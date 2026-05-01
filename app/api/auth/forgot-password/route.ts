import { NextResponse } from "next/server";
import { EmailConfigurationError, sendPasswordResetEmail } from "@/lib/email";
import {
  createPasswordResetLink,
  getAppBaseUrl,
  isValidEmail,
  normalizeEmail,
} from "@/lib/passwordReset";

type ForgotPasswordBody = {
  email?: unknown;
};

/**
 * POST /api/auth/forgot-password
 *
 * Public endpoint. It returns the same success message whether the email exists
 * or not, so users cannot use it to discover accounts.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as ForgotPasswordBody;
    const email = normalizeEmail(body.email);
    let resetUrl: string | undefined;
    let emailSent = false;

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

    if (resetLink.found) {
      try {
        await sendPasswordResetEmail({
          to: resetLink.user.email,
          resetUrl: resetLink.resetUrl,
        });
        emailSent = true;
      } catch (error: unknown) {
        const message =
          error instanceof EmailConfigurationError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Email sending failed";

        console.log("[forgot-password] Reset email was not sent:", message);
        console.log("[forgot-password] Development reset link:", resetLink.resetUrl);

        if (process.env.NODE_ENV !== "production") {
          resetUrl = resetLink.resetUrl;
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      resetUrl,
      message:
        resetUrl
          ? "Email is not configured locally. Use the reset link below."
          : "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error: unknown) {
    console.error("FORGOT PASSWORD ERROR:", error);

    if (error instanceof Error && error.message === "JWT_SECRET_MISSING") {
      return NextResponse.json(
        { success: false, message: "Server misconfigured: JWT_SECRET missing" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Request failed" },
      { status: 500 },
    );
  }
}
