import nodemailer from "nodemailer";
import config from "../configs/config";
// Create transporter based on environment
const createTransporter = () => {
    const isDevelopment = process.env.NODE_ENV === "development";
    if (!isDevelopment) {
        // Production email configuration (use your actual email service)
        return nodemailer.createTransport({
            service: "gmail", // or your email service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    else {
        // Development: Create test account or use console
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: "ethereal.user@ethereal.email",
                pass: "ethereal.pass",
            },
        });
    }
};
export const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: config.GMAIL_USER,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || options.html.replace(/<[^>]*>/g, ""),
        };
        if (process.env.NODE_ENV === "development") {
            // In development, log email details instead of sending
            // console.log("\n📧 EMAIL WOULD BE SENT IN PRODUCTION:");
            // console.log("==================================================");
            // console.log(`📬 To: ${mailOptions.to}`);
            // console.log(`📝 Subject: ${mailOptions.subject}`);
            // console.log("📄 HTML Content:");
            // console.log("--------------------------------------------------");
            // console.log(mailOptions.html);
            // console.log("==================================================\n");
            return true; // Simulate successful send in development
        }
        // Send actual email in production
        const result = await transporter.sendMail(mailOptions);
        console.log("📧 Email sent successfully:", result.messageId);
        return true;
    }
    catch (error) {
        console.error("❌ Failed to send email:", error);
        return false;
    }
};
// Email templates
export const emailTemplates = {
    instructorApplicationApproved: (instructorName) => ({
        subject: "🎉 Congratulations! Your Instructor Application Has Been Approved",
        html: `
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
    `,
    }),
    instructorApplicationRejected: (instructorName, reason) => ({
        subject: "Update on Your Instructor Application",
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Application Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .reason-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Application</h1>
          </div>
          <div class="content">
            <h2>Dear ${instructorName},</h2>
            <p>Thank you for your interest in becoming an instructor on Skillify. After careful review, we regret to inform you that we cannot approve your application at this time.</p>
            
            <div class="reason-box">
              <h3>📝 Feedback:</h3>
              <p>${reason}</p>
            </div>
            
            <p>We encourage you to:</p>
            <ul>
              <li>📚 Review our instructor guidelines</li>
              <li>🛠️ Address the feedback provided</li>
              <li>🔄 Reapply once you've made the necessary improvements</li>
            </ul>
            
            <p>We appreciate your understanding and look forward to a potential future application.</p>
            
            <p style="text-align: center;">
              <a href="http://localhost:5173/become-instructor" class="button">View Guidelines</a>
            </p>
            
            <p>Best regards,<br>
            The Skillify Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Skillify. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    }),
};
export default { sendEmail, emailTemplates };
