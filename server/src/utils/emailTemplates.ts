export const emailTemplates = {
  instructorApplicationReceived: (firstName: string, lastName: string) => ({
    subject: "Instructor Application Received - Skillify",
    html: `
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
    `,
  }),

  instructorApplicationApproved: (
    firstName: string,
    lastName: string,
    adminFeedback?: string
  ) => ({
    subject:
      "🎉 Congratulations! Your Instructor Application Has Been Approved - Skillify",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 32px;">🎉 Congratulations!</h1>
          <p style="margin: 10px 0 0 0; font-size: 20px; font-weight: 500;">Welcome to the Skillify Instructor Family!</p>
        </div>
        
        <div style="padding: 30px; background-color: white;">
          <p style="font-size: 16px; color: #374151;">Dear ${firstName} ${lastName},</p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            We're <strong>thrilled</strong> to inform you that your instructor application has been <span style="color: #10b981; font-weight: 600;">approved</span>! 
            You are now officially part of the Skillify instructor community, and we can't wait to see the amazing courses you'll create.
          </p>
          
          ${
            adminFeedback
              ? `
            <div style="background-color: #f0f9ff; padding: 25px; border-left: 4px solid #3b82f6; margin: 25px 0; border-radius: 8px;">
              <h3 style="color: #1e40af; margin-top: 0; font-size: 16px;">💬 Message from our Review Team:</h3>
              <p style="color: #374151; margin-bottom: 0; font-style: italic; line-height: 1.6;">"${adminFeedback}"</p>
            </div>
          `
              : ""
          }
          
          <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0;">
            <h3 style="color: #374151; margin-top: 0; font-size: 18px;">🚀 Your Next Steps:</h3>
            <ol style="color: #6b7280; line-height: 1.8; font-size: 15px; padding-left: 20px;">
              <li><strong>Access your instructor dashboard</strong> - Start exploring your new tools</li>
              <li><strong>Complete your instructor profile</strong> - Add your bio, photo, and expertise</li>
              <li><strong>Plan your first course</strong> - Use our course creation wizard</li>
              <li><strong>Record your content</strong> - Upload videos, add resources, and create quizzes</li>
              <li><strong>Publish and start earning</strong> - Share your knowledge with the world!</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/instructor/dashboard" 
               style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              🎯 Access Your Instructor Dashboard
            </a>
          </div>
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #065f46; font-weight: 600; margin: 0;">🎁 Welcome Bonus:</p>
            <p style="color: #374151; margin: 10px 0 0 0;">As a new instructor, you'll earn <strong>90% revenue share</strong> on your first course for the first 3 months!</p>
          </div>
          
          <p style="font-size: 16px; color: #374151;">If you need any help getting started, our instructor success team is here to support you every step of the way.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">Welcome aboard!<br><strong>The Skillify Team</strong></p>
          </div>
        </div>
      </div>
    `,
  }),

  instructorApplicationRejected: (
    firstName: string,
    lastName: string,
    rejectionReason: string,
    adminFeedback?: string
  ) => ({
    subject: "Update on Your Instructor Application - Skillify",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #fee2e2; color: #991b1b; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">📧 Application Update</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for your interest in teaching</p>
        </div>
        
        <div style="padding: 30px; background-color: white;">
          <p style="font-size: 16px; color: #374151;">Dear ${firstName} ${lastName},</p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Thank you for your interest in becoming a Skillify instructor and for taking the time to submit your application. 
            After careful review of your qualifications and experience, we're unable to approve your application at this time.
          </p>
          
          <div style="background-color: #fef2f2; padding: 25px; border-left: 4px solid #ef4444; margin: 25px 0; border-radius: 8px;">
            <h3 style="color: #dc2626; margin-top: 0; font-size: 16px;">📝 Reason for Decision:</h3>
            <p style="color: #374151; margin-bottom: 0; line-height: 1.6;">${rejectionReason}</p>
          </div>
          
          ${
            adminFeedback
              ? `
            <div style="background-color: #f0f9ff; padding: 25px; border-left: 4px solid #3b82f6; margin: 25px 0; border-radius: 8px;">
              <h3 style="color: #1e40af; margin-top: 0; font-size: 16px;">💡 Additional Feedback:</h3>
              <p style="color: #374151; margin-bottom: 0; line-height: 1.6;">${adminFeedback}</p>
            </div>
          `
              : ""
          }
          
          <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0;">
            <h3 style="color: #374151; margin-top: 0; font-size: 18px;">🔄 What's Next?</h3>
            <ul style="color: #6b7280; line-height: 1.8; font-size: 15px;">
              <li><strong>You can reapply</strong> after addressing the mentioned concerns</li>
              <li><strong>Gain more experience</strong> in your area of expertise</li>
              <li><strong>Build a portfolio</strong> of your teaching or training materials</li>
              <li><strong>Consider taking courses</strong> to enhance your skills</li>
              <li><strong>Contact our support team</strong> for personalized guidance</li>
            </ul>
          </div>
          
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1e40af; font-weight: 600; margin: 0;">💪 Don't Give Up!</p>
            <p style="color: #374151; margin: 10px 0 0 0;">Many of our successful instructors were initially rejected but came back stronger. We encourage you to keep developing your skills and apply again in the future.</p>
          </div>
          
          <p style="font-size: 16px; color: #374151;">
            We appreciate your interest in teaching on Skillify and hope to see you apply again soon. 
            If you have questions about this decision, please contact us at <a href="mailto:support@skillify.com" style="color: #4f46e5;">support@skillify.com</a>
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">Best regards,<br><strong>The Skillify Team</strong></p>
          </div>
        </div>
      </div>
    `,
  }),
};

export default emailTemplates;
