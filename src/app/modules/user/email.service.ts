import nodemailer from "nodemailer";

import config from "../../config";

const transporter = nodemailer.createTransport({
  host: config.email.SMTP_HOST,
  port: Number(config.email.SMTP_PORT),
  secure: Number(config.email.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: config.email.SMTP_USER,
    pass: config.email.SMTP_PASS,
  },
});

/**
 * Send an email via Nodemailer
 */
const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: `"${config.email.EMAIL_FROM_NAME}" <${config.email.EMAIL_FROM}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

/**
 * Send verification email
 */
const sendVerificationEmail = async (to: string, token: string) => {
  const verificationUrl = `${config.frontend_url}/verify-email/${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

          body {
            font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0e0a1a 0%, #1a1128 50%, #140e25 100%);
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          .container {
            max-width: 600px;
            margin: 40px auto;
            background: linear-gradient(180deg, #140e25 0%, #1a1128 100%);
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid rgba(130, 107, 199, 0.2);
            box-shadow: 0 20px 60px rgba(99, 70, 185, 0.3);
          }

          .cyber-pattern {
            position: relative;
            background-image:
              radial-gradient(circle at 2px 2px, rgba(130, 107, 199, 0.15) 1px, transparent 0);
            background-size: 24px 24px;
          }

          .header {
            background: linear-gradient(135deg, #4f3894 0%, #826bc7 100%);
            padding: 48px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }

          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background:
              radial-gradient(circle at 20% 50%, rgba(161, 144, 213, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(79, 56, 148, 0.2) 0%, transparent 50%);
          }

          .logo-container {
            position: relative;
            z-index: 1;
            display: inline-flex;
            align-items: center;
            gap: 12px;
          }

          .logo-icon {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
          }

          .logo-text {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          }

          .content {
            padding: 48px 40px;
            color: #e0daf1;
          }

          .icon-badge {
            width: 64px;
            height: 64px;
            margin: 0 auto 24px;
            background: linear-gradient(135deg, #4f3894 0%, #826bc7 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            border: 2px solid rgba(130, 107, 199, 0.3);
            box-shadow: 0 8px 24px rgba(79, 56, 148, 0.4);
          }

          .title {
            font-size: 28px;
            font-weight: 700;
            color: #ffffff;
            margin: 0 0 16px 0;
            text-align: center;
            letter-spacing: -0.5px;
          }

          .subtitle {
            font-size: 16px;
            color: #a190d5;
            line-height: 1.6;
            margin: 0 0 32px 0;
            text-align: center;
          }

          .button-container {
            text-align: center;
            margin: 32px 0;
          }

          .button {
            display: inline-block;
            background: linear-gradient(135deg, #826bc7 0%, #6346b9 100%);
            color: #ffffff;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 16px;
            font-weight: 600;
            font-size: 16px;
            letter-spacing: 0.3px;
            border: 1px solid rgba(161, 144, 213, 0.3);
            box-shadow:
              0 8px 24px rgba(130, 107, 199, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
          }

          .button:hover {
            transform: translateY(-2px);
            box-shadow:
              0 12px 32px rgba(130, 107, 199, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }

          .info-box {
            background: rgba(130, 107, 199, 0.1);
            border: 1px solid rgba(130, 107, 199, 0.2);
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
          }

          .info-text {
            font-size: 14px;
            color: #a190d5;
            margin: 0 0 12px 0;
            text-align: center;
          }

          .code-block {
            background: rgba(14, 10, 26, 0.6);
            border: 1px solid rgba(130, 107, 199, 0.2);
            border-radius: 8px;
            padding: 16px;
            word-break: break-all;
            font-size: 13px;
            color: #826bc7;
            text-align: center;
            font-family: 'Courier New', monospace;
          }

          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(130, 107, 199, 0.3), transparent);
            margin: 32px 0;
          }

          .footer {
            background: rgba(20, 14, 37, 0.6);
            padding: 32px 40px;
            text-align: center;
            border-top: 1px solid rgba(130, 107, 199, 0.2);
          }

          .footer-text {
            font-size: 13px;
            color: #826bc7;
            margin: 0 0 8px 0;
            opacity: 0.8;
          }

          .security-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(130, 107, 199, 0.1);
            border: 1px solid rgba(130, 107, 199, 0.2);
            border-radius: 8px;
            padding: 8px 16px;
            margin-top: 16px;
            font-size: 12px;
            color: #a190d5;
          }

          @media only screen and (max-width: 600px) {
            .container { margin: 20px; }
            .content { padding: 32px 24px; }
            .header { padding: 32px 24px; }
            .title { font-size: 24px; }
          }
        </style>
      </head>
      <body class="cyber-pattern">
        <div class="container">
          <div class="header">
            <div class="logo-container">
              <div class="logo-icon">🪐</div>
              <div class="logo-text">StockFlow</div>
            </div>
          </div>

          <div class="content">
            <div class="icon-badge">✉️</div>

            <h1 class="title">Verify Your Email</h1>
            <p class="subtitle">
              Welcome to StockFlow! We're excited to have you on board.
              To get started with your secure cloud storage, please verify your email address.
            </p>

            <div class="button-container">
              <a href="${verificationUrl}" class="button">
                Verify Email Address →
              </a>
            </div>

            <div class="divider"></div>

            <div class="info-box">
              <p class="info-text">
                Or copy and paste this link into your browser:
              </p>
              <div class="code-block">${verificationUrl}</div>
            </div>

            <p style="text-align: center; font-size: 13px; color: #826bc7; margin-top: 24px;">
              ⏱️ This link will expire in 24 hours
            </p>
          </div>

          <div class="footer">
            <p class="footer-text">© ${new Date().getFullYear()} StockFlow. All rights reserved.</p>
            <p class="footer-text">
              If you didn't create an account, you can safely ignore this email.
            </p>
            <div class="security-badge">
              🔒 OBSIDIAN TIER SECURITY
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(to, "Verify your email - StockFlow", html);
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (to: string, token: string) => {
  const resetUrl = `${config.frontend_url}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

          body {
            font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0e0a1a 0%, #1a1128 50%, #140e25 100%);
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          .container {
            max-width: 600px;
            margin: 40px auto;
            background: linear-gradient(180deg, #140e25 0%, #1a1128 100%);
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid rgba(239, 104, 104, 0.2);
            box-shadow: 0 20px 60px rgba(239, 68, 68, 0.3);
          }

          .cyber-pattern {
            position: relative;
            background-image:
              radial-gradient(circle at 2px 2px, rgba(239, 104, 104, 0.15) 1px, transparent 0);
            background-size: 24px 24px;
          }

          .header {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            padding: 48px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }

          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background:
              radial-gradient(circle at 20% 50%, rgba(248, 113, 113, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(220, 38, 38, 0.2) 0%, transparent 50%);
          }

          .logo-container {
            position: relative;
            z-index: 1;
            display: inline-flex;
            align-items: center;
            gap: 12px;
          }

          .logo-icon {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
          }

          .logo-text {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          }

          .content {
            padding: 48px 40px;
            color: #e0daf1;
          }

          .icon-badge {
            width: 64px;
            height: 64px;
            margin: 0 auto 24px;
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            border: 2px solid rgba(239, 68, 68, 0.3);
            box-shadow: 0 8px 24px rgba(220, 38, 38, 0.4);
          }

          .title {
            font-size: 28px;
            font-weight: 700;
            color: #ffffff;
            margin: 0 0 16px 0;
            text-align: center;
            letter-spacing: -0.5px;
          }

          .subtitle {
            font-size: 16px;
            color: #a190d5;
            line-height: 1.6;
            margin: 0 0 32px 0;
            text-align: center;
          }

          .warning-box {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
            text-align: center;
          }

          .warning-text {
            font-size: 14px;
            color: #fca5a5;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .button-container {
            text-align: center;
            margin: 32px 0;
          }

          .button {
            display: inline-block;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: #ffffff;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 16px;
            font-weight: 600;
            font-size: 16px;
            letter-spacing: 0.3px;
            border: 1px solid rgba(248, 113, 113, 0.3);
            box-shadow:
              0 8px 24px rgba(239, 68, 68, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
          }

          .button:hover {
            transform: translateY(-2px);
            box-shadow:
              0 12px 32px rgba(239, 68, 68, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }

          .info-box {
            background: rgba(130, 107, 199, 0.1);
            border: 1px solid rgba(130, 107, 199, 0.2);
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
          }

          .info-text {
            font-size: 14px;
            color: #a190d5;
            margin: 0 0 12px 0;
            text-align: center;
          }

          .code-block {
            background: rgba(14, 10, 26, 0.6);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 8px;
            padding: 16px;
            word-break: break-all;
            font-size: 13px;
            color: #fca5a5;
            text-align: center;
            font-family: 'Courier New', monospace;
          }

          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.3), transparent);
            margin: 32px 0;
          }

          .footer {
            background: rgba(20, 14, 37, 0.6);
            padding: 32px 40px;
            text-align: center;
            border-top: 1px solid rgba(239, 68, 68, 0.2);
          }

          .footer-text {
            font-size: 13px;
            color: #826bc7;
            margin: 0 0 8px 0;
            opacity: 0.8;
          }

          .security-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(130, 107, 199, 0.1);
            border: 1px solid rgba(130, 107, 199, 0.2);
            border-radius: 8px;
            padding: 8px 16px;
            margin-top: 16px;
            font-size: 12px;
            color: #a190d5;
          }

          @media only screen and (max-width: 600px) {
            .container { margin: 20px; }
            .content { padding: 32px 24px; }
            .header { padding: 32px 24px; }
            .title { font-size: 24px; }
          }
        </style>
      </head>
      <body class="cyber-pattern">
        <div class="container">
          <div class="header">
            <div class="logo-container">
              <div class="logo-icon">🪐</div>
              <div class="logo-text">StockFlow</div>
            </div>
          </div>

          <div class="content">
            <div class="icon-badge">🔐</div>

            <h1 class="title">Reset Your Password</h1>
            <p class="subtitle">
              We received a request to reset your password. Click the button below to choose a new password.
            </p>

            <div class="warning-box">
              <p class="warning-text">
                ⏱️ This link expires in 1 hour for security reasons
              </p>
            </div>

            <div class="button-container">
              <a href="${resetUrl}" class="button">
                Reset Password →
              </a>
            </div>

            <div class="divider"></div>

            <div class="info-box">
              <p class="info-text">
                Or copy and paste this link into your browser:
              </p>
              <div class="code-block">${resetUrl}</div>
            </div>

            <p style="text-align: center; font-size: 13px; color: #fca5a5; margin-top: 24px;">
              ⚠️ If you didn't request this, someone may have attempted to access your account
            </p>
          </div>

          <div class="footer">
            <p class="footer-text">© ${new Date().getFullYear()} StockFlow. All rights reserved.</p>
            <p class="footer-text">
              If you didn't request a password reset, please contact support immediately.
            </p>
            <div class="security-badge">
              🔒 OBSIDIAN TIER SECURITY
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(to, "Reset your password - StockFlow", html);
};

export const EmailService = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
