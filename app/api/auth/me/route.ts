// Handles API auth me requests.
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
    });
  } catch {
    return NextResponse.json(
      {
        success: true,
        authenticated: false,
        user: null,
      },
      { status: 200 }
    );
  }
}
