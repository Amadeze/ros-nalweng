import { NextResponse } from "next/server";
import { getCurrentDate } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: getCurrentDate().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
