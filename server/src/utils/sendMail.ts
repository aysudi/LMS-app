import nodemailer from "nodemailer";
import config from "../configs/config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: config.GMAIL_USER,
    pass: config.GMAIL_PASS,
  },
});

const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
  textContent?: string
): Promise<void> => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "Skillify"}" <${
        process.env.EMAIL_FROM || process.env.EMAIL_USER
      }>`,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

// Email verification function
export const sendVerificationEmail = async (
  email: string,
  firstName: string,
  verificationToken: string
): Promise<void> => {
  const verificationUrl = `${
    process.env.CLIENT_URL || "http://localhost:3000"
  }/verify-email?token=${verificationToken}`;

  const subject = "Verify Your Email Address - Skillify";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Skillify! 🎓</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName}!</h2>
          <p>Thank you for joining Skillify, your journey to new skills starts here!</p>
          <p>To complete your registration and start exploring our courses, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
          
          <p><strong>This verification link will expire in 24 hours.</strong></p>
          
          <p>If you didn't create an account with Skillify, please ignore this email.</p>
          
          <p>Happy learning!<br>The Skillify Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Skillify. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Welcome to Skillify!
    
    Hi ${firstName}!
    
    Thank you for joining Skillify. To complete your registration, please verify your email address by clicking the link below:
    
    ${verificationUrl}
    
    This verification link will expire in 24 hours.
    
    If you didn't create an account with Skillify, please ignore this email.
    
    Happy learning!
    The Skillify Team
  `;

  await sendEmail(email, subject, htmlContent, textContent);
};

// Account unlock email function
export const sendUnlockAccountEmail = async (
  email: string,
  firstName: string,
  unlockTime: string
): Promise<void> => {
  const subject = "Account Security Alert - Skillify";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Locked</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff7b7b 0%, #ff6b6b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Account Temporarily Locked</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>We detected multiple failed login attempts on your Skillify account.</p>
          
          <div class="alert">
            <strong>Security Notice:</strong> Your account has been temporarily locked for your protection.
          </div>
          
          <p><strong>Account Details:</strong></p>
          <ul>
            <li>Email: ${email}</li>
            <li>Locked at: ${new Date().toLocaleString()}</li>
            <li>Automatically unlocks: ${unlockTime}</li>
          </ul>
          
          <p><strong>What happened?</strong><br>
          Multiple unsuccessful login attempts were made to your account. This could be due to:</p>
          <ul>
            <li>Forgotten password</li>
            <li>Typos in password entry</li>
            <li>Unauthorized access attempts</li>
          </ul>
          
          <p><strong>What to do:</strong></p>
          <ul>
            <li>Wait for the automatic unlock time</li>
            <li>If you forgot your password, use the "Forgot Password" option after unlock</li>
            <li>If you suspect unauthorized access, contact our support team immediately</li>
          </ul>
          
          <p>If you didn't attempt to log in, please contact our support team immediately.</p>
          
          <p>Best regards,<br>The Skillify Security Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Skillify. All rights reserved.</p>
          <p>For support, contact us at support@skillify.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Account Temporarily Locked - Skillify
    
    Hi ${firstName},
    
    We detected multiple failed login attempts on your Skillify account.
    
    Your account has been temporarily locked for your protection.
    
    Account Details:
    - Email: ${email}
    - Locked at: ${new Date().toLocaleString()}
    - Automatically unlocks: ${unlockTime}
    
    What happened?
    Multiple unsuccessful login attempts were made to your account. This could be due to forgotten password, typos, or unauthorized access attempts.
    
    What to do:
    - Wait for the automatic unlock time
    - If you forgot your password, use the "Forgot Password" option after unlock
    - If you suspect unauthorized access, contact our support team immediately
    
    If you didn't attempt to log in, please contact our support team immediately.
    
    Best regards,
    The Skillify Security Team
  `;

  await sendEmail(email, subject, htmlContent, textContent);
};

// Forgot password email function
export const sendForgotPasswordEmail = async (
  email: string,
  firstName: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${
    process.env.CLIENT_URL || "http://localhost:3000"
  }/reset-password?token=${resetToken}`;

  const subject = "Reset Your Password - Skillify";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>We received a request to reset your password for your Skillify account.</p>
          
          <p>If you requested this password reset, click the button below to create a new password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
          
          <div class="warning">
            <strong>Important:</strong>
            <ul>
              <li>This password reset link will expire in 1 hour</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your current password remains unchanged until you set a new one</li>
            </ul>
          </div>
          
          <p><strong>Security Tips:</strong></p>
          <ul>
            <li>Choose a strong password with at least 8 characters</li>
            <li>Include uppercase, lowercase, numbers, and symbols</li>
            <li>Don't reuse passwords from other accounts</li>
            <li>Consider using a password manager</li>
          </ul>
          
          <p>If you continue to have trouble accessing your account, please contact our support team.</p>
          
          <p>Best regards,<br>The Skillify Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Skillify. All rights reserved.</p>
          <p>For support, contact us at support@skillify.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Password Reset Request - Skillify
    
    Hi ${firstName},
    
    We received a request to reset your password for your Skillify account.
    
    If you requested this password reset, click the link below to create a new password:
    
    ${resetUrl}
    
    Important:
    - This password reset link will expire in 1 hour
    - If you didn't request this reset, please ignore this email
    - Your current password remains unchanged until you set a new one
    
    Security Tips:
    - Choose a strong password with at least 8 characters
    - Include uppercase, lowercase, numbers, and symbols
    - Don't reuse passwords from other accounts
    - Consider using a password manager
    
    If you continue to have trouble accessing your account, please contact our support team.
    
    Best regards,
    The Skillify Team
  `;

  await sendEmail(email, subject, htmlContent, textContent);
};

// General notification email function
export const sendNotificationEmail = async (
  email: string,
  firstName: string,
  subject: string,
  message: string
): Promise<void> => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 ${subject}</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <div>${message}</div>
          <p>Best regards,<br>The Skillify Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Skillify. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    ${subject}
    
    Hi ${firstName},
    
    ${message.replace(/<[^>]*>/g, "")}
    
    Best regards,
    The Skillify Team
  `;

  await sendEmail(email, subject, htmlContent, textContent);
};

export default {
  sendVerificationEmail,
  sendUnlockAccountEmail,
  sendForgotPasswordEmail,
  sendNotificationEmail,
};
