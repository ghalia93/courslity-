import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  EmailConfigurationError,
  isEmailConfigured,
  sendPasswordResetEmail,
} from "@/lib/email";
import {
  createPasswordResetLink,
  getAppBaseUrl,
  isValidEmail,
  normalizeEmail,
} from "@/lib/passwordReset";

type PasswordResetBody = {
  email?: unknown;
};

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const body = (await req.json().catch(() => ({}))) as PasswordResetBody;
    const email = normalizeEmail(body.email);

    if (!email) {
      return NextResponse.json(
        { success: false, message: "email is required" },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "email must be valid" },
        { status: 400 },
      );
    }

    const resetLink = await createPasswordResetLink(email, getAppBaseUrl(req.url));

    if (!resetLink.found) {
      return NextResponse.json(
        { success: false, message: "No active user was found for this email." },
        { status: 404 },
      );
    }

    try {
      await sendPasswordResetEmail({
        to: resetLink.user.email,
        resetUrl: resetLink.resetUrl,
      });

      return NextResponse.json({
        success: true,
        emailSent: true,
        resetUrl: resetLink.resetUrl,
        message: "Password reset email sent successfully.",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Password reset link was created, but the email was not sent.";

      if (error instanceof EmailConfigurationError || !isEmailConfigured()) {
        return NextResponse.json({
          success: true,
          emailSent: false,
          resetUrl: resetLink.resetUrl,
          message,
        });
      }

      console.error("ADMIN PASSWORD RESET EMAIL ERROR:", error);
      return NextResponse.json(
        {
          success: false,
          emailSent: false,
          resetUrl: resetLink.resetUrl,
          message,
        },
        { status: 502 },
      );
    }
  } catch (error: unknown) {
    console.error("ADMIN PASSWORD RESET ERROR:", error);

    if (error instanceof Error && error.message === "JWT_SECRET_MISSING") {
      return NextResponse.json(
        { success: false, message: "Server misconfigured: JWT_SECRET missing" },
        { status: 500 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, message: "FORBIDDEN" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}
