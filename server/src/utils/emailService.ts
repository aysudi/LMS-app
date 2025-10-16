// Simple email service implementation
// In a real application, you would integrate with services like SendGrid, Nodemailer, etc.

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    // For development, just log the email content
    console.log(`
    📧 EMAIL NOTIFICATION:
    ═══════════════════════════════════════
    To: ${options.to}
    Subject: ${options.subject}
    From: ${options.from || "noreply@skillify.com"}
    ═══════════════════════════════════════
    Content:
    ${options.html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim()}
    ═══════════════════════════════════════
    `);

    // TODO: Integrate with actual email service
    // Example with Nodemailer:
    /*
    import nodemailer from 'nodemailer';
    
    const transporter = nodemailer.createTransporter({
      // Your email configuration
    });
    
    await transporter.sendMail({
      from: options.from || process.env.DEFAULT_FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    */

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  } catch (error: any) {
    console.error("Failed to send email:", error);
    // In production, you might want to throw the error or handle it differently
    // throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default {
  sendEmail,
};
