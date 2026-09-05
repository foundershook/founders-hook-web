

/**
 * Brevo & SMTP transactional email service.
 */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

interface SendOtpEmailOptions {
  to: string;
  otp: string;
}

function buildOtpEmailHtml(otp: string): string {
  const digits = otp.split("").join("</span><span style=\"display:inline-block;width:48px;height:56px;line-height:56px;text-align:center;font-size:28px;font-weight:700;background:#1a1c23;border:1.5px solid rgba(255,255,255,0.3);border-radius:10px;color:#d4d4d8;margin:0 4px;font-family:monospace\">");
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Founders Hook Verification Code</title>
</head>
<body style="margin:0;padding:0;background:#0c0d10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0d10;min-height:100vh">
    <tr>
      <td align="center" style="padding:48px 16px">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#13141a;border-radius:20px;border:1px solid rgba(255,255,255,0.08);overflow:hidden">
          
          <!-- Header -->
          <tr>
            <td style="padding:36px 40px 24px;text-align:center;background:linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 70%)">
              <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:8px">
                <img src="https://res.cloudinary.com/t7efuhnd/image/upload/v1786022235/founder_hook_iorswv.jpg" width="36" height="36" style="border-radius:8px;object-fit:cover;" alt="Logo" />
                <span style="font-size:16px;font-weight:700;color:#fff;letter-spacing:0.06em">FOUNDERS HOOK</span>
              </div>
              <div style="width:48px;height:2px;background:linear-gradient(90deg,transparent,#d4d4d8,transparent);margin:16px auto 0"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:8px 40px 40px">
              <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px;text-align:center">Verify your email</h1>
              <p style="font-size:14px;color:#8b95a3;text-align:center;margin:0 0 32px;line-height:1.6">
                Use the verification code below to confirm your email address and complete your signup.
              </p>

              <!-- OTP Digits -->
              <div style="text-align:center;margin-bottom:32px">
                <span style="display:inline-block;width:48px;height:56px;line-height:56px;text-align:center;font-size:28px;font-weight:700;background:#1a1c23;border:1.5px solid rgba(255,255,255,0.3);border-radius:10px;color:#d4d4d8;margin:0 4px;font-family:monospace">${digits}</span>
              </div>

              <!-- Expiry notice -->
              <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:10px;padding:14px 18px;margin-bottom:28px;text-align:center">
                <p style="font-size:13px;color:#d4d4d8;margin:0">
                  This code expires in <strong>15 minutes</strong>
                </p>
              </div>

              <p style="font-size:13px;color:#4a5260;text-align:center;margin:0;line-height:1.6">
                If you didn't create a Founders Hook account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
              <p style="font-size:12px;color:#3d4450;margin:0">
                © ${new Date().getFullYear()} Founders Hook · All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

interface SendEmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendEmail({ to, subject, htmlContent, textContent }: SendEmailOptions): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_FROM || "noreply@foundershook.com";
  const senderName = process.env.BREVO_SENDER_NAME || "Founders Hook";

  // 1. Try Brevo API if configured
  if (apiKey && apiKey !== "your-brevo-api-key-here") {
    const payload = {
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [{ email: to }],
      subject,
      ...(textContent && { textContent }),
      htmlContent,
    };

    try {
      const res = await fetch(BREVO_API_URL, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        console.log(`[EMAIL SENT via BREVO API] To: ${to}, Subject: ${subject}`);
        return;
      } else {
        const errorBody = await res.text();
        console.error("Brevo API error:", res.status, errorBody);
      }
    } catch (err: any) {
      console.error("[BREVO API ERROR] Failed to send email via Brevo API:", err?.message || err);
    }
  }

  // 3. Fallback for Development mode: Output to console
  console.log(`
=====================================================
[EMAIL DEV MODE] To: ${to}
Subject: ${subject}
=====================================================
  `);
}

export async function sendOtpEmail({ to, otp }: SendOtpEmailOptions): Promise<void> {
  const subject = `${otp} is your Founders Hook verification code`;
  const textContent = `Your Founders Hook verification code is: ${otp}\n\nThis code expires in 15 minutes.\n\nIf you didn't sign up, ignore this email.`;
  const htmlContent = buildOtpEmailHtml(otp);

  await sendEmail({ to, subject, htmlContent, textContent });
}

interface SendMeetInviteEmailOptions {
  to: string;
  recipientName?: string;
  senderName: string;
  meetUrl: string;
  contextTitle?: string;
}

function buildMeetInviteHtml({ recipientName, senderName, meetUrl, contextTitle }: { recipientName?: string; senderName: string; meetUrl: string; contextTitle?: string }): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Google Meet Invitation - Founders Hook</title>
</head>
<body style="margin:0;padding:0;background:#0c0d10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0d10;min-height:100vh">
    <tr>
      <td align="center" style="padding:48px 16px">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#13141a;border-radius:20px;border:1px solid rgba(255,255,255,0.08);overflow:hidden">
          
          <!-- Header -->
          <tr>
            <td style="padding:36px 40px 24px;text-align:center;background:linear-gradient(135deg,rgba(16,185,129,0.12) 0%,transparent 70%)">
              <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:8px">
                <img src="https://res.cloudinary.com/t7efuhnd/image/upload/v1786022235/founder_hook_iorswv.jpg" width="36" height="36" style="border-radius:8px;object-fit:cover;" alt="Logo" />
                <span style="font-size:16px;font-weight:700;color:#fff;letter-spacing:0.06em">FOUNDERS HOOK</span>
              </div>
              <div style="width:48px;height:2px;background:linear-gradient(90deg,transparent,#10b981,transparent);margin:16px auto 0"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:8px 40px 40px">
              <div style="text-align:center;margin-bottom:20px;">
                <span style="display:inline-block;padding:8px 16px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);border-radius:999px;color:#10b981;font-size:13px;font-weight:600;">
                  📹 Live Video Call Invitation
                </span>
              </div>
              <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 12px;text-align:center">
                ${senderName} has invited you to a Google Meet
              </h1>
              <p style="font-size:14px;color:#8b95a3;text-align:center;margin:0 0 24px;line-height:1.6">
                ${recipientName ? `Hi <strong>${recipientName}</strong>, ` : ""}${senderName} started a live Google Meet call ${contextTitle ? `regarding <strong>${contextTitle}</strong>` : ""} on Founders Hook.
              </p>

              <!-- Meet Button -->
              <div style="text-align:center;margin:32px 0">
                <a href="${meetUrl}" target="_blank" style="display:inline-block;padding:14px 32px;background:#10b981;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;border-radius:12px;box-shadow:0 4px 14px rgba(16,185,129,0.4);">
                  Join Google Meet Call →
                </a>
              </div>

              <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:14px 18px;margin-bottom:20px;text-align:center">
                <p style="font-size:12px;color:#d4d4d8;margin:0;word-break:break-all;">
                  Link: <a href="${meetUrl}" target="_blank" style="color:#10b981;text-decoration:underline;">${meetUrl}</a>
                </p>
              </div>

              <p style="font-size:12px;color:#6b7280;text-align:center;margin:0;line-height:1.5">
                You can also join directly from your active conversation thread in Founders Hook.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
              <p style="font-size:12px;color:#3d4450;margin:0">
                © ${new Date().getFullYear()} Founders Hook · All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendMeetInviteEmail({ to, recipientName, senderName, meetUrl, contextTitle }: SendMeetInviteEmailOptions): Promise<void> {
  const subject = `📹 ${senderName} invited you to a Google Meet on Founders Hook`;
  const textContent = `${senderName} has invited you to a Google Meet call${contextTitle ? ` regarding ${contextTitle}` : ""}.\n\nJoin here: ${meetUrl}\n\nFounders Hook`;
  const htmlContent = buildMeetInviteHtml({ recipientName, senderName, meetUrl, contextTitle });

  await sendEmail({ to, subject, htmlContent, textContent });
}

export async function sendPasswordResetEmail({ to, otp }: { to: string, otp: string }): Promise<void> {
  const digits = otp.split("").join("</span><span style=\"display:inline-block;width:48px;height:56px;line-height:56px;text-align:center;font-size:28px;font-weight:700;background:#1a1c23;border:1.5px solid rgba(255,255,255,0.3);border-radius:10px;color:#d4d4d8;margin:0 4px;font-family:monospace\">");
  const subject = `Reset Your Password - Founders Hook`;
  const textContent = `You requested to reset your password. Your verification code is: ${otp}\n\nThis code expires in 15 minutes.\n\nIf you did not request this, please ignore this email.`;
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background:#0c0d10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0d10;min-height:100vh">
    <tr>
      <td align="center" style="padding:48px 16px">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#13141a;border-radius:20px;border:1px solid rgba(255,255,255,0.08);overflow:hidden">
          <tr>
            <td style="padding:36px 40px 24px;text-align:center;background:linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 70%)">
              <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:8px">
                <img src="https://res.cloudinary.com/t7efuhnd/image/upload/v1786022235/founder_hook_iorswv.jpg" width="36" height="36" style="border-radius:8px;object-fit:cover;" alt="Logo" />
                <span style="font-size:16px;font-weight:700;color:#fff;letter-spacing:0.06em">FOUNDERS HOOK</span>
              </div>
              <div style="width:48px;height:2px;background:linear-gradient(90deg,transparent,#d4d4d8,transparent);margin:16px auto 0"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 40px">
              <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px;text-align:center">Reset Your Password</h1>
              <p style="font-size:14px;color:#8b95a3;text-align:center;margin:0 0 32px;line-height:1.6">
                You recently requested to reset your password for your Founders Hook account. Use the code below to reset it.
              </p>
              
              <div style="text-align:center;margin-bottom:32px">
                <span style="display:inline-block;width:48px;height:56px;line-height:56px;text-align:center;font-size:28px;font-weight:700;background:#1a1c23;border:1.5px solid rgba(255,255,255,0.3);border-radius:10px;color:#d4d4d8;margin:0 4px;font-family:monospace">${digits}</span>
              </div>

              <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:10px;padding:14px 18px;margin-bottom:28px;text-align:center">
                <p style="font-size:13px;color:#d4d4d8;margin:0">
                  This code expires in <strong>15 minutes</strong>
                </p>
              </div>

              <p style="font-size:13px;color:#4a5260;text-align:center;margin:0;line-height:1.6">
                If you didn't request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
              <p style="font-size:12px;color:#3d4450;margin:0">
                © ${new Date().getFullYear()} Founders Hook · All rights reserved
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await sendEmail({ to, subject, htmlContent, textContent });
}

export async function sendPasswordResetSuccessEmail(to: string): Promise<void> {
  const subject = `Password Reset Successful - Founders Hook`;
  const textContent = `Your password has been successfully reset. If you did not make this change, please contact support immediately.`;
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset Successful</title>
</head>
<body style="margin:0;padding:0;background:#0c0d10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0d10;min-height:100vh">
    <tr>
      <td align="center" style="padding:48px 16px">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#13141a;border-radius:20px;border:1px solid rgba(255,255,255,0.08);overflow:hidden">
          <tr>
            <td style="padding:36px 40px 24px;text-align:center;background:linear-gradient(135deg,rgba(16,185,129,0.12) 0%,transparent 70%)">
              <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:8px">
                <img src="https://res.cloudinary.com/t7efuhnd/image/upload/v1786022235/founder_hook_iorswv.jpg" width="36" height="36" style="border-radius:8px;object-fit:cover;" alt="Logo" />
                <span style="font-size:16px;font-weight:700;color:#fff;letter-spacing:0.06em">FOUNDERS HOOK</span>
              </div>
              <div style="width:48px;height:2px;background:linear-gradient(90deg,transparent,#10b981,transparent);margin:16px auto 0"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 40px">
              <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px;text-align:center">Password Updated</h1>
              <p style="font-size:14px;color:#8b95a3;text-align:center;margin:0 0 32px;line-height:1.6">
                Your password for your Founders Hook account has been successfully updated. You can now log in using your new password.
              </p>
              
              <p style="font-size:13px;color:#4a5260;text-align:center;margin:0;line-height:1.6">
                If you did not make this change, please contact our support team immediately to secure your account.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
              <p style="font-size:12px;color:#3d4450;margin:0">
                © ${new Date().getFullYear()} Founders Hook · All rights reserved
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await sendEmail({ to, subject, htmlContent, textContent });
}
