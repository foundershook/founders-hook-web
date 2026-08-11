import nodemailer from "nodemailer";

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

export async function sendOtpEmail({ to, otp }: SendOtpEmailOptions): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_FROM || "noreply@foundershook.com";
  const senderName = process.env.BREVO_SENDER_NAME || "Founders Hook";

  // 1. Try Nodemailer SMTP if configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to,
        subject: `${otp} is your Founders Hook verification code`,
        text: `Your Founders Hook verification code is: ${otp}\n\nThis code expires in 15 minutes.\n\nIf you didn't sign up, ignore this email.`,
        html: buildOtpEmailHtml(otp),
      });

      console.log(`[OTP EMAIL SENT via SMTP] To: ${to}, Code: ${otp}`);
      return;
    } catch (err: any) {
      console.error("[SMTP ERROR] Failed to send email via SMTP:", err?.message || err);
    }
  }

  // 2. Try Brevo API if configured
  if (apiKey && apiKey !== "your-brevo-api-key-here") {
    const payload = {
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [{ email: to }],
      subject: `${otp} is your Founders Hook verification code`,
      textContent: `Your Founders Hook verification code is: ${otp}\n\nThis code expires in 15 minutes.\n\nIf you didn't sign up, ignore this email.`,
      htmlContent: buildOtpEmailHtml(otp),
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
        console.log(`[OTP EMAIL SENT via BREVO API] To: ${to}, Code: ${otp}`);
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
[OTP DEV MODE] Verification Code for ${to}: ${otp}
Expires in 15 minutes.
(To deliver real emails to inbox, configure SMTP_HOST/SMTP_USER/SMTP_PASS or BREVO_API_KEY in .env)
=====================================================
  `);
}

