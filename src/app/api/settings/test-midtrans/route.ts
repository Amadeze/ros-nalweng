import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serverKey, isProduction } = body;

    if (!serverKey || typeof serverKey !== "string") {
      return NextResponse.json({ success: false, message: "Server Key is required." });
    }

    // Basic validation for Midtrans keys
    // Sandbox keys usually start with 'SB-Mid-server-'
    // Production keys usually start with 'Mid-server-'
    const isSandboxKey = serverKey.startsWith("SB-Mid-server-");
    const isProdKey = serverKey.startsWith("Mid-server-");

    if (isProduction && !isProdKey) {
      return NextResponse.json({ 
        success: false, 
        message: "Warning: You are in Production mode but the key doesn't look like a Production Server Key." 
      });
    }

    if (!isProduction && !isSandboxKey) {
      return NextResponse.json({ 
        success: false, 
        message: "Warning: You are in Sandbox mode but the key doesn't look like a Sandbox Server Key (SB-Mid-server-)." 
      });
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ 
      success: true, 
      message: "Connection successful! API Key format is valid." 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
