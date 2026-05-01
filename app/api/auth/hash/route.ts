import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = body?.password;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "password is required" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 10);
    const matches = await bcrypt.compare(password, hash);

    return NextResponse.json({
      success: true,
      password,
      hash,
      matches,
    });
  } catch (error: unknown) {
    console.error("HASH ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Hashing failed",
        error: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
