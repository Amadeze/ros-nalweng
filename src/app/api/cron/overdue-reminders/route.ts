import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOverdueReminders } from "@/lib/overdue-reminders";
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
  const result = await sendOverdueReminders(prisma);
  return NextResponse.json({ ok: true, ...result });
}
