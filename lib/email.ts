// Sends application emails through the configured email provider.
import { Resend } from "resend";
// npm install resend --legacy-peer-deps

export class EmailConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailConfigurationError";
  }
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new EmailConfigurationError(
      "RESEND_API_KEY is missing. Add it to .env.local to send password reset emails.",
    );
  }

  return new Resend(apiKey);
}

function getFromAddress() {
  return process.env.EMAIL_FROM?.trim() || "noreply@yourdomain.com";
}

function getAppName() {
  return process.env.NEXT_PUBLIC_APP_NAME?.trim() || "UniPortal";
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

interface SendPasswordResetEmailOptions {
  to: string;
  resetUrl: string;
}

/**
 * Sends a styled HTML password reset email via Resend.
 *
 * Required environment variables:
 *   RESEND_API_KEY          - your Resend API key (from resend.com/api-keys)
 *   EMAIL_FROM              - verified sender address e.g. noreply@yourdomain.com
 *   NEXT_PUBLIC_APP_NAME    - shown in the email subject and body (optional, defaults to "UniPortal")
 *   NEXT_PUBLIC_APP_URL     - used in forgot-password route to build the reset link
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: SendPasswordResetEmailOptions): Promise<void> {
  const resend = getResendClient();
  const appName = getAppName();

  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to,
    subject: `Reset your ${appName} password`,
    html: buildResetEmailHtml({ resetUrl, appName }),
    // Plain-text fallback for email clients that don't render HTML
    text: buildResetEmailText({ resetUrl, appName }),
  });

  if (error) {
    console.error("[sendPasswordResetEmail] Resend error:", error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}

// ---
// HTML template
// ---

function buildResetEmailHtml({
  resetUrl,
  appName,
}: {
  resetUrl: string;
  appName: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6fb;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6fb;padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="520" cellpadding="0" cellspacing="0"
              style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;
                      box-shadow:0 4px 16px rgba(0,0,0,0.06);overflow:hidden;">

          <!-- Header band -->
          <tr>
            <td align="center"
                style="background:linear-gradient(135deg,#6155F5 0%,#503fdc 100%);
                      padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;
                        letter-spacing:-0.3px;">
                ${appName}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">

              <h2 style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:600;">
                Reset your password
              </h2>

              <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
                We received a request to reset the password for your ${appName} account.
                Click the button below to choose a new password. This link is valid for
                <strong style="color:#111827;">1 hour</strong>.
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td align="center"
                      style="background:#6155F5;border-radius:8px;">
                    <a href="${resetUrl}"
                        style="display:inline-block;padding:13px 32px;
                              color:#ffffff;font-size:14px;font-weight:600;
                              text-decoration:none;letter-spacing:0.2px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.5;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 24px;word-break:break-all;">
                <a href="${resetUrl}"
                    style="color:#6155F5;font-size:13px;text-decoration:underline;">
                  ${resetUrl}
                </a>
              </p>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0"
                      style="margin:0 0 20px;">
                <tr>
                  <td style="border-top:1px solid #e5e7eb;"></td>
                </tr>
              </table>

              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email  -
                your password will not be changed.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center"
                style="background:#f9fafb;border-top:1px solid #e5e7eb;
                        padding:16px 40px;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                (c) ${new Date().getFullYear()} ${appName}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

// ---
// Plain-text fallback
// ---

function buildResetEmailText({
  resetUrl,
  appName,
}: {
  resetUrl: string;
  appName: string;
}): string {
  return `
${appName} - Reset your password
---

We received a request to reset the password for your ${appName} account.

Click the link below to choose a new password (valid for 1 hour):

${resetUrl}

If you didn't request this, you can safely ignore this email - your password will not be changed.

(c) ${new Date().getFullYear()} ${appName}
  `.trim();
}
