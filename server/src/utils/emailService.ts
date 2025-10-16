import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Create transporter for sending emails
const createTransporter = () => {
  if (process.env.NODE_ENV === "production") {
    // Production email configuration
    return nodemailer.createTransport({
      service: "gmail", // or your preferred email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // Development: Create a test transporter that doesn't actually send emails
    return nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });
  }
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from:
        options.from ||
        process.env.DEFAULT_FROM_EMAIL ||
        "noreply@skillify.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    if (process.env.NODE_ENV === "production") {
      // Actually send email in production
      const result = await transporter.sendMail(mailOptions);
      console.log(
        `✅ Email sent successfully to ${options.to}:`,
        result.messageId
      );
    }

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  } catch (error: any) {
    console.error("Failed to send email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default {
  sendEmail,
};
