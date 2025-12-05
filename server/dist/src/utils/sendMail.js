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
export const sendEmail = async (to, subject, htmlContent, textContent) => {
    try {
        // Skip email sending in development if credentials are not configured
        if (process.env.NODE_ENV !== "production" &&
            (!config.GMAIL_USER || !config.GMAIL_PASS)) {
            console.log(`[DEV] Email would be sent to ${to} with subject: ${subject}`);
            return;
        }
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || "Skillify"}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to,
            subject,
            text: textContent,
            html: htmlContent,
        };
        const result = await transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
};
// Email verification function
export const sendVerificationEmail = async (email, firstName, verificationToken) => {
    const verificationUrl = `${config.CLIENT_URL || "http://localhost:5173"}/auth/verify-email?token=${verificationToken}`;
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
export const sendUnlockAccountEmail = async (email, firstName, unlockTime) => {
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
export const sendForgotPasswordEmail = async (email, firstName, resetToken) => {
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`;
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
export const sendNotificationEmail = async (email, firstName, subject, message) => {
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
// Certificate email function with attachment
export const sendCertificateEmail = async (email, studentName, courseName, certificateBuffer, fileName) => {
    try {
        const subject = `🎉 Your Certificate of Completion - ${courseName}`;
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Congratulations! 🎉</h1>
          <p style="color: #f8f9fa; margin: 10px 0 0 0; font-size: 16px;">You've earned your certificate!</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; border-top: none;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear ${studentName},</p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Congratulations on successfully completing <strong>"${courseName}"</strong>! 
            Your dedication and hard work have paid off.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin: 0 0 10px 0;">Certificate Details:</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Course:</strong> ${courseName}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Certificate ID:</strong> ${fileName}</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Your certificate is attached to this email as a PDF file. You can download, print, 
            or share it to showcase your achievement.
          </p>
          
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Keep up the excellent work and continue your learning journey with us!
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Best regards,<br>
            <strong>The Skillify Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>This certificate verifies the completion of the course on Skillify platform.</p>
          <p>Questions? Contact us at support@skillify.com</p>
        </div>
      </div>
    `;
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || "Skillify"}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html: htmlContent,
            attachments: [
                {
                    filename: fileName,
                    content: certificateBuffer,
                    contentType: "application/pdf",
                },
            ],
        };
        await transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Error in sendCertificateEmail:", error);
        throw error;
    }
};
export const sendApplicationApprovedEmail = async (email, instructorName) => {
    const subject = "Your Instructor Application has been Approved! 🎉";
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Application Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .emoji { font-size: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="emoji">🎉</span>
            <h1>Welcome to the Skillify Instructor Team!</h1>
          </div>
          <div class="content">
            <h2>Dear ${instructorName},</h2>
            <p>We're thrilled to inform you that your instructor application has been <strong>approved</strong>!</p>
            
            <p>You can now:</p>
            <ul>
              <li>✅ Create and publish courses</li>
              <li>📚 Manage your course content</li>
              <li>👥 Interact with students</li>
              <li>💰 Earn revenue from your expertise</li>
            </ul>
            
            <p>Ready to get started? Click the button below to access your instructor dashboard:</p>
            <p style="text-align: center;">
              <a href="http://localhost:5173/instructor/dashboard" class="button">Go to Dashboard</a>
            </p>
            
            <p>If you have any questions or need assistance, our support team is here to help.</p>
            
            <p>Welcome aboard!<br>
            The Skillify Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Skillify. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    const textContent = `
      Dear ${instructorName},

      We're thrilled to inform you that your instructor application has been approved!

      You can now:
      - Create and publish courses
      - Manage your course content
      - Interact with students
      - Earn revenue from your expertise

      Ready to get started? Visit your instructor dashboard: http://localhost:5173/instructor/dashboard

      If you have any questions or need assistance, our support team is here to help.

      Welcome aboard!
      The Skillify Team
    `;
    await sendEmail(email, subject, htmlContent, textContent);
};
export const sendApplicationReceivedEmail = async (email, firstName, lastName) => {
    const subject = "Instructor Application Received - Skillify";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Application Received!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Thank you for applying to become an instructor</p>
        </div>
        
        <div style="padding: 30px; background-color: white;">
          <p style="font-size: 16px; color: #374151;">Dear ${firstName} ${lastName},</p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            We have received your instructor application and are excited to review your qualifications. 
            Your passion for teaching and expertise will help create an amazing learning experience for our students.
          </p>
          
          <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #4f46e5;">
            <h3 style="color: #374151; margin-top: 0; font-size: 18px;">📋 What's Next?</h3>
            <ul style="color: #6b7280; line-height: 1.8; font-size: 15px;">
              <li>Our expert team will review your application within <strong>3-5 business days</strong></li>
              <li>We'll carefully evaluate your expertise, experience, and teaching motivation</li>
              <li>You'll receive an email notification once a decision is made</li>
              <li>If approved, you'll get immediate access to our instructor tools</li>
            </ul>
          </div>
          
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1e40af; font-weight: 600; margin: 0;">💡 Pro Tip:</p>
            <p style="color: #374151; margin: 10px 0 0 0;">While you wait, check out our <a href="${process.env.CLIENT_URL}/instructor-guidelines" style="color: #4f46e5;">Instructor Guidelines</a> to learn about best practices for creating engaging courses.</p>
          </div>
          
          <p style="font-size: 16px; color: #374151;">If you have any questions, feel free to contact our support team at <a href="mailto:support@skillify.com" style="color: #4f46e5;">support@skillify.com</a></p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">Best regards,<br><strong>The Skillify Team</strong></p>
          </div>
        </div>
      </div>
    `;
    const textContent = `
      Dear ${firstName} ${lastName},

      We have received your instructor application and are excited to review your qualifications. 
      Your passion for teaching and expertise will help create an amazing learning experience for our students.

      What's Next?
      - Our expert team will review your application within 3-5 business days
      - We'll carefully evaluate your expertise, experience, and teaching motivation
      - You'll receive an email notification once a decision is made
      - If approved, you'll get immediate access to our instructor tools

      Pro Tip:
      While you wait, check out our Instructor Guidelines to learn about best practices for creating engaging courses: ${process.env.CLIENT_URL}/instructor-guidelines

      If you have any questions, feel free to contact our support team at support@skillify.com
      Best regards,
      The Skillify Team
    `;
    await sendEmail(email, subject, htmlContent, textContent);
};
const formatRejectionReason = (reason) => {
    const reasonMap = {
        expertise_mismatch: "Your expertise doesn't align with our current course categories or requirements.",
        incomplete_application: "Your application is missing required information or documentation.",
        insufficient_experience: "We require more teaching or professional experience in your field.",
        quality_standards: "Your application doesn't meet our current quality standards for instructors.",
        technical_requirements: "You don't meet the technical requirements for creating online courses.",
        communication_skills: "We need instructors with stronger communication and presentation skills.",
        portfolio_insufficient: "Your portfolio or work samples don't demonstrate the required level of expertise.",
        background_check: "Issues were found during the background verification process.",
        other: reason,
    };
    return reasonMap[reason] || reason;
};
export const sendApplicationRejectedEmail = async (email, instructorName, reason) => {
    const subject = "Update on Your Instructor Application - Skillify";
    const formattedReason = formatRejectionReason(reason);
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Application Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .reason-box { background: #fff8e1; border-left: 4px solid #ff9800; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .tips-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Application Review Complete</h1>
          </div>
          <div class="content">
            <h2>Dear ${instructorName},</h2>
            <p>Thank you for your interest in becoming an instructor on Skillify. We have carefully reviewed your application.</p>
            
            <p>After thorough consideration, we are unable to approve your application at this time. We understand this may be disappointing, but we want to provide you with specific feedback to help you in future applications.</p>
            
            <div class="reason-box">
              <h3>📝 Reason for Decision:</h3>
              <p><strong>${formattedReason}</strong></p>
            </div>
            
            <div class="tips-box">
              <h3>💡 Next Steps:</h3>
              <ul>
                <li>📚 Review our detailed instructor guidelines and requirements</li>
                <li>🛠️ Address the specific feedback mentioned above</li>
                <li>📈 Consider gaining additional experience or certifications in your field</li>
                <li>🔄 You're welcome to reapply once you've made improvements</li>
                <li>💬 Reach out to our support team if you need clarification</li>
              </ul>
            </div>
            
            <p>We appreciate the time and effort you put into your application. Our standards help us maintain the quality of education our students expect, and we encourage you to continue developing your expertise.</p>
            
            <p style="text-align: center;">
              <a href="http://localhost:5173/become-instructor" class="button">View Guidelines & Requirements</a>
            </p>
            
            <p>We wish you the best in your professional journey and hope to potentially work with you in the future.</p>
            
            <p>Best regards,<br>
            The Skillify Review Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Skillify. All rights reserved.</p>
            <p>Questions? Contact us at <a href="mailto:support@skillify.com">support@skillify.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
    const textContent = `
      Dear ${instructorName},

      Thank you for your interest in becoming an instructor on Skillify. After careful review, we regret to inform you that we cannot approve your application at this time.

      We encourage you to:
      - Review our instructor guidelines
      - Address the feedback provided
      - Reapply once you've made the necessary improvements
      The Skillify Team
    `;
    await sendEmail(email, subject, htmlContent, textContent);
};
// Course approval email
export const sendCourseApprovedEmail = async (email, instructorName, courseTitle, courseId, adminFeedback) => {
    const subject = `🎉 Your Course "${courseTitle}" has been Approved!`;
    const courseUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/course/${courseId}`;
    const dashboardUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/instructor/courses`;
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Course Approved</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; font-weight: 700; }
        .header p { margin: 15px 0 0 0; font-size: 18px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .course-card { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 5px solid #10b981; }
        .course-title { color: #0c4a6e; font-size: 22px; font-weight: 600; margin: 0 0 10px 0; }
        .course-id { color: #64748b; font-size: 14px; font-family: monospace; background: #f1f5f9; padding: 5px 10px; border-radius: 4px; display: inline-block; }
        .feedback-section { background: #fefce8; border-left: 4px solid #eab308; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .feedback-title { color: #92400e; font-weight: 600; margin: 0 0 10px 0; font-size: 16px; }
        .feedback-text { color: #451a03; line-height: 1.6; margin: 0; font-style: italic; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 30px 0; }
        .stat-item { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
        .stat-number { font-size: 24px; font-weight: 700; color: #10b981; margin: 0; }
        .stat-label { color: #64748b; font-size: 14px; margin: 5px 0 0 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 10px; font-weight: 600; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.25); transition: transform 0.2s; }
        .button:hover { transform: translateY(-2px); }
        .action-buttons { text-align: center; margin: 30px 0; }
        .congratulations { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
        .congratulations h3 { color: #065f46; margin: 0 0 15px 0; font-size: 20px; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #64748b; margin: 5px 0; font-size: 14px; }
        .tips-section { background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .tips-title { color: #0c4a6e; font-weight: 600; margin: 0 0 15px 0; }
        .tips-list { color: #374151; margin: 0; padding-left: 20px; }
        .tips-list li { margin: 8px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Course Approved!</h1>
          <p>Congratulations! Your course is now live on Skillify</p>
        </div>
        
        <div class="content">
          <p style="font-size: 18px; color: #374151;">Dear ${instructorName},</p>
          
          <div class="congratulations">
            <h3>🚀 Your course is now published!</h3>
            <p style="color: #059669; margin: 0;">Students can now discover, enroll, and learn from your expertise.</p>
          </div>
          
          <div class="course-card">
            <div class="course-title">"${courseTitle}"</div>
            <p style="color: #475569; margin: 10px 0;">Your course has been reviewed and approved by our team. It meets our quality standards and is ready to help students achieve their learning goals.</p>
            <div class="course-id">Course ID: ${courseId}</div>
          </div>
          
          ${adminFeedback
        ? `
          <div class="feedback-section">
            <div class="feedback-title">📝 Admin Review Notes:</div>
            <div class="feedback-text">"${adminFeedback}"</div>
          </div>
          `
        : ""}
          
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">✅</div>
              <div class="stat-label">Quality Approved</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">🌐</div>
              <div class="stat-label">Now Live</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">📈</div>
              <div class="stat-label">Ready for Students</div>
            </div>
          </div>
          
          <div class="action-buttons">
            <a href="${courseUrl}" class="button">View Your Course</a>
          </div>
          
          <div class="tips-section">
            <div class="tips-title">💡 Next Steps to Maximize Your Success:</div>
            <ul class="tips-list">
              <li><strong>Share your course:</strong> Promote it on social media and professional networks</li>
              <li><strong>Engage with students:</strong> Respond to questions and provide support</li>
              <li><strong>Monitor performance:</strong> Check your analytics regularly to track progress</li>
              <li><strong>Gather feedback:</strong> Use student reviews to improve future courses</li>
              <li><strong>Keep content fresh:</strong> Update your course materials as needed</li>
            </ul>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.7;">
            Thank you for contributing to the Skillify community. Your expertise will help countless students achieve their goals and advance their careers.
          </p>
          
          <p style="color: #374151; margin-top: 30px;">
            Best regards,<br>
            <strong>The Skillify Review Team</strong>
          </p>
        </div>
        
        <div class="footer">
          <p><strong>Need Help?</strong> Contact our instructor support team</p>
          <p>📧 <a href="mailto:instructor-support@skillify.com" style="color: #3b82f6;">instructor-support@skillify.com</a></p>
          <p style="margin-top: 20px;">© 2025 Skillify. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
    const textContent = `
    Course Approved - ${courseTitle}

    Dear ${instructorName},

    Congratulations! Your course "${courseTitle}" has been approved and is now live on Skillify.

    Course Details:
    - Title: ${courseTitle}
    - Course ID: ${courseId}
    - Status: Approved and Published
    - Available at: ${courseUrl}

    ${adminFeedback ? `Admin Review Notes: "${adminFeedback}"` : ""}

    Next Steps:
    - View your course: ${courseUrl}
    - Check your instructor dashboard: ${dashboardUrl}
    - Start promoting your course to attract students
    - Engage with students and respond to their questions

    Thank you for contributing to the Skillify community!

    Best regards,
    The Skillify Review Team
  `;
    await sendEmail(email, subject, htmlContent, textContent);
};
// Course rejection email
export const sendCourseRejectedEmail = async (email, instructorName, courseTitle, courseId, rejectionReason, adminFeedback) => {
    const subject = `Course Review Update: "${courseTitle}"`;
    const dashboardUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/instructor/courses`;
    const guidelinesUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/instructor-guidelines`;
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Course Review Update</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 15px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .course-card { background: #f8fafc; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 5px solid #667eea; }
        .course-title { color: #1e293b; font-size: 20px; font-weight: 600; margin: 0 0 10px 0; }
        .course-id { color: #64748b; font-size: 14px; font-family: monospace; background: #e2e8f0; padding: 5px 10px; border-radius: 4px; display: inline-block; }
        .reason-section { background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 25px; margin: 25px 0; }
        .reason-title { color: #b91c1c; font-weight: 600; margin: 0 0 15px 0; font-size: 18px; }
        .reason-text { color: #7f1d1d; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px; }
        .feedback-section { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .feedback-title { color: #92400e; font-weight: 600; margin: 0 0 10px 0; font-size: 16px; }
        .feedback-text { color: #451a03; line-height: 1.6; margin: 0; font-style: italic; }
        .action-section { background: #f0f9ff; border-radius: 12px; padding: 25px; margin: 25px 0; }
        .action-title { color: #0c4a6e; font-weight: 600; margin: 0 0 15px 0; font-size: 18px; }
        .action-list { color: #374151; margin: 0; padding-left: 20px; }
        .action-list li { margin: 10px 0; line-height: 1.5; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 10px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25); }
        .action-buttons { text-align: center; margin: 30px 0; }
        .encouragement { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
        .encouragement h3 { color: #065f46; margin: 0 0 15px 0; font-size: 18px; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #64748b; margin: 5px 0; font-size: 14px; }
        .status-badge { background: #fee2e2; color: #991b1b; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; display: inline-block; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Course Review Complete</h1>
          <p>We've completed the review of your course submission</p>
        </div>
        
        <div class="content">
          <p style="font-size: 18px; color: #374151;">Dear ${instructorName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Thank you for submitting your course to Skillify. We've completed our review process, and while we appreciate the effort you've put into creating this content, we're unable to approve it for publication at this time.
          </p>
          
          <div class="course-card">
            <div class="course-title">"${courseTitle}"</div>
            <div class="status-badge">Needs Revision</div>
            <div class="course-id">Course ID: ${courseId}</div>
          </div>
          
          <div class="reason-section">
            <div class="reason-title">📝 Review Feedback:</div>
            <div class="reason-text">${rejectionReason}</div>
          </div>
          
          ${adminFeedback
        ? `
          <div class="feedback-section">
            <div class="feedback-title">💬 Additional Comments from Our Review Team:</div>
            <div class="feedback-text">"${adminFeedback}"</div>
          </div>
          `
        : ""}
          
          <div class="action-section">
            <div class="action-title">🔧 What You Can Do Next:</div>
            <ul class="action-list">
              <li><strong>Review the feedback:</strong> Carefully read the specific points mentioned above</li>
              <li><strong>Update your course:</strong> Make the necessary improvements to address the feedback</li>
              <li><strong>Check our guidelines:</strong> Ensure your course meets all quality standards</li>
              <li><strong>Resubmit for review:</strong> Once you've made improvements, submit for review again</li>
              <li><strong>Contact support:</strong> If you need clarification on any feedback points</li>
            </ul>
          </div>
          
          <div class="action-buttons">
            <a href="${dashboardUrl}" class="button">Edit Your Course</a>
          </div>
          
          <div class="encouragement">
            <h3>💪 Don't Give Up!</h3>
            <p style="color: #059669; margin: 0; line-height: 1.6;">
              Many successful instructors needed revisions on their first submission. This feedback is designed to help you create the best possible learning experience for students. We're here to support you throughout the process.
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.7;">
            We believe in your potential as an educator and look forward to seeing your revised course. Our goal is to help you succeed while maintaining the high quality that Skillify students expect.
          </p>
          
          <p style="color: #374151; margin-top: 30px;">
            Best regards,<br>
            <strong>The Skillify Course Review Team</strong>
          </p>
        </div>
        
        <div class="footer">
          <p><strong>Questions about this feedback?</strong></p>
          <p>📧 <a href="mailto:course-review@skillify.com" style="color: #3b82f6;">course-review@skillify.com</a></p>
          <p>💬 <a href="mailto:instructor-support@skillify.com" style="color: #3b82f6;">instructor-support@skillify.com</a></p>
          <p style="margin-top: 20px;">© 2025 Skillify. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
    const textContent = `
    Course Review Update - ${courseTitle}

    Dear ${instructorName},

    We've completed the review of your course "${courseTitle}" and are unable to approve it for publication at this time.

    Course Details:
    - Title: ${courseTitle}
    - Course ID: ${courseId}
    - Status: Needs Revision

    Review Feedback:
    ${rejectionReason}

    ${adminFeedback ? `Additional Comments: "${adminFeedback}"` : ""}

    What You Can Do Next:
    - Review the feedback carefully
    - Update your course to address the points mentioned
    - Check our course guidelines
    - Resubmit for review once improved
    - Contact support if you need clarification

    Access your course: ${dashboardUrl}
    View guidelines: ${guidelinesUrl}

    We believe in your potential and look forward to your revised submission!

    Best regards,
    The Skillify Course Review Team
  `;
    await sendEmail(email, subject, htmlContent, textContent);
};
export default {
    sendVerificationEmail,
    sendUnlockAccountEmail,
    sendForgotPasswordEmail,
    sendNotificationEmail,
    sendCertificateEmail,
    sendCourseApprovedEmail,
    sendCourseRejectedEmail,
};
