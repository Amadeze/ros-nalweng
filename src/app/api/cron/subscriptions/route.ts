import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { synchronizeSubscriptionStatuses } from "@/lib/subscription-maintenance";
import { timingSafeEqualText } from "@/lib/webhook-inbox";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (
    !cronSecret
    || !authorization
    || !timingSafeEqualText(`Bearer ${cronSecret}`, authorization)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await synchronizeSubscriptionStatuses(prisma);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron/subscriptions]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
