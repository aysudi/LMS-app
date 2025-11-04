import { sendEmail } from "./sendMail";
export const sendContactNotificationEmail = async (data) => {
    try {
        const { adminEmail, contactData } = data;
        const subject = `New Contact Message: ${contactData.subject}`;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Message</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f6f9fc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .info-section { background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
            .message-section { background-color: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 6px; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
            .badge { display: inline-block; background-color: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">📧 New Contact Message</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">You have received a new message from your website</p>
            </div>
            
            <div class="content">
              <div class="info-section">
                <h3 style="margin: 0 0 15px 0; color: #1e293b;">Contact Information</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${contactData.name}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${contactData.email}</p>
                ${contactData.phone
            ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${contactData.phone}</p>`
            : ""}
                <p style="margin: 5px 0;"><strong>Subject:</strong> ${contactData.subject}</p>
              </div>
              
              <div class="message-section">
                <h3 style="margin: 0 0 15px 0; color: #1e293b;">Message</h3>
                <p style="line-height: 1.6; color: #475569; white-space: pre-wrap;">${contactData.message}</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <span class="badge">Action Required</span>
                <p style="margin: 10px 0; color: #64748b;">Please respond to this contact message promptly.</p>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">This email was sent from your Skillify contact form</p>
              <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} Skillify Learning Platform</p>
            </div>
          </div>
        </body>
      </html>
    `;
        const textContext = `
    New contact message received:
    
    Name: ${contactData.name}
    Email: ${contactData.email}
    Subject: ${contactData.subject}
    Message: ${contactData.message}
    Phone: ${contactData.phone || "N/A"}    
    `;
        await sendEmail(adminEmail, subject, html, textContext);
    }
    catch (error) {
        console.error("Failed to send contact notification email:", error);
        throw error;
    }
};
export const sendContactReplyEmail = async (data) => {
    try {
        const { contactEmail, contactName, originalSubject, originalMessage, replyMessage, } = data;
        const subject = `Re: ${originalSubject}`;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reply to Your Contact Message</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f6f9fc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .reply-section { background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981; }
            .original-section { background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #64748b; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">✅ Thank You for Contacting Us</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">We have received your message and here's our response</p>
            </div>
            
            <div class="content">
              <p style="margin: 0 0 20px 0; color: #1e293b;">Dear ${contactName},</p>
              <p style="margin: 0 0 20px 0; color: #475569;">Thank you for reaching out to us. We have reviewed your message and here's our response:</p>
              
              <div class="reply-section">
                <h3 style="margin: 0 0 15px 0; color: #059669;">Our Response</h3>
                <p style="line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${replyMessage}</p>
              </div>
              
              <div class="original-section">
                <h3 style="margin: 0 0 15px 0; color: #64748b;">Your Original Message</h3>
                <p style="margin: 0 0 10px 0; color: #64748b;"><strong>Subject:</strong> ${originalSubject}</p>
                <p style="line-height: 1.6; color: #64748b; white-space: pre-wrap;">${originalMessage}</p>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #475569;">If you have any further questions, please don't hesitate to contact us again.</p>
              <p style="margin: 10px 0 0 0; color: #475569;">Best regards,<br>The Skillify Team</p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">© ${new Date().getFullYear()} Skillify Learning Platform</p>
              <p style="margin: 5px 0 0 0;">This email was sent in response to your contact form submission</p>
            </div>
          </div>
        </body>
      </html>
    `;
        await sendEmail(contactEmail, subject, html, subject);
    }
    catch (error) {
        console.error("Failed to send contact reply email:", error);
        throw error;
    }
};
