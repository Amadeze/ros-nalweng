import { Prisma, type PrismaClient } from "@prisma/client";
import { getCurrentDate } from "@/lib/date-utils";

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function runTrackedJob<T>(
  client: PrismaClient,
  input: { jobName: string; runKey: string },
  work: () => Promise<T>,
): Promise<{ skipped: boolean; result: T | null }> {
  const existing = await client.jobRun.findUnique({
    where: { runKey: input.runKey },
    select: { status: true, summary: true },
  });
  if (existing?.status === "SUCCEEDED") {
    return { skipped: true, result: existing.summary as T | null };
  }

  const startedAt = getCurrentDate();
  await client.jobRun.upsert({
    where: { runKey: input.runKey },
    create: {
      jobName: input.jobName,
      runKey: input.runKey,
      status: "RUNNING",
      startedAt,
    },
    update: {
      status: "RUNNING",
      startedAt,
      finishedAt: null,
      summary: Prisma.JsonNull,
      error: null,
      attempt: { increment: 1 },
    },
  });

  try {
    const result = await work();
    await client.jobRun.update({
      where: { runKey: input.runKey },
      data: {
        status: "SUCCEEDED",
        finishedAt: getCurrentDate(),
        summary: toJson(result),
      },
    });
    return { skipped: false, result };
  } catch (error) {
    await client.jobRun.update({
      where: { runKey: input.runKey },
      data: {
        status: "FAILED",
        finishedAt: getCurrentDate(),
        error: error instanceof Error ? error.message.slice(0, 2_000) : "Unknown error",
      },
    });
    throw error;
  }
}
