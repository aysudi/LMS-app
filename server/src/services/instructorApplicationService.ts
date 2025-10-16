import InstructorApplication, {
  IInstructorApplication,
} from "../schemas/instructorApplicationSchema";
import User from "../models/User";
import { UserRole } from "../types/user.types";
import mongoose from "mongoose";
import { sendEmail } from "../utils/emailService";

// Submit instructor application
export const submitInstructorApplication = async (
  userId: string,
  applicationData: Partial<IInstructorApplication>
): Promise<IInstructorApplication> => {
  try {
    // Check if user already has an application
    const existingApplication = await InstructorApplication.findOne({
      user: userId,
    });
    if (existingApplication) {
      throw new Error("You have already submitted an instructor application");
    }

    // Check if user is already an instructor
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === UserRole.INSTRUCTOR) {
      throw new Error("You are already an instructor");
    }

    // Create new application
    const application = new InstructorApplication({
      ...applicationData,
      user: userId,
      status: "pending",
      submittedAt: new Date(),
    });

    await application.save();

    // Send confirmation email to applicant
    await sendEmail({
      to: application.email,
      subject: "Instructor Application Received - Skillify",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Thank You for Your Application!</h2>
          <p>Dear ${application.firstName} ${application.lastName},</p>
          <p>We have received your instructor application and are excited to review your qualifications.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">What's Next?</h3>
            <ul style="color: #6b7280;">
              <li>Our team will review your application within 3-5 business days</li>
              <li>We'll evaluate your expertise, experience, and teaching motivation</li>
              <li>You'll receive an email notification once a decision is made</li>
            </ul>
          </div>
          
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>The Skillify Team</p>
        </div>
      `,
    });

    return application;
  } catch (error: any) {
    throw new Error(`Failed to submit application: ${error.message}`);
  }
};

// Get all instructor applications (admin only)
export const getAllInstructorApplications = async (
  page: number = 1,
  limit: number = 10,
  status?: string
) => {
  try {
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const [applications, totalCount] = await Promise.all([
      InstructorApplication.find(filter)
        .populate("user", "firstName lastName email avatar")
        .populate("reviewedBy", "firstName lastName")
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit),
      InstructorApplication.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      applications,
      pagination: {
        currentPage: page,
        totalPages,
        totalApplications: totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch applications: ${error.message}`);
  }
};

// Get user's instructor application
export const getUserInstructorApplication = async (userId: string) => {
  try {
    const application = await InstructorApplication.findOne({
      user: userId,
    }).populate("reviewedBy", "firstName lastName");

    return application;
  } catch (error: any) {
    throw new Error(`Failed to fetch application: ${error.message}`);
  }
};

// Approve instructor application
export const approveInstructorApplication = async (
  applicationId: string,
  adminId: string,
  adminFeedback?: string
) => {
  try {
    const application = await InstructorApplication.findById(
      applicationId
    ).populate("user");
    if (!application) {
      throw new Error("Application not found");
    }

    if (application.status !== "pending") {
      throw new Error("Application has already been processed");
    }

    // Update application status
    application.status = "approved";
    application.reviewedAt = new Date();
    application.reviewedBy = new mongoose.Types.ObjectId(adminId);
    application.adminFeedback = adminFeedback;
    await application.save();

    // Update user role to instructor
    const user = await User.findById(application.user);
    if (user) {
      user.role = UserRole.INSTRUCTOR;
      await user.save();
    }

    // Send approval email
    await sendEmail({
      to: application.email,
      subject:
        "Congratulations! Your Instructor Application Has Been Approved - Skillify",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">You're now a Skillify Instructor!</p>
          </div>
          
          <div style="padding: 30px; background-color: white;">
            <p>Dear ${application.firstName} ${application.lastName},</p>
            
            <p>We're thrilled to inform you that your instructor application has been <strong>approved</strong>! Welcome to the Skillify instructor community.</p>
            
            ${
              adminFeedback
                ? `
              <div style="background-color: #f0f9ff; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                <h3 style="color: #1e40af; margin-top: 0;">Feedback from our team:</h3>
                <p style="color: #1f2937; margin-bottom: 0;">${adminFeedback}</p>
              </div>
            `
                : ""
            }
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">What's Next?</h3>
              <ul style="color: #6b7280;">
                <li>Log in to your account to access the instructor dashboard</li>
                <li>Complete your instructor profile</li>
                <li>Create your first course</li>
                <li>Start sharing your knowledge with students worldwide</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/instructor/dashboard" 
                 style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Access Instructor Dashboard
              </a>
            </div>
            
            <p>If you have any questions or need help getting started, our support team is here to help.</p>
            <p>Best regards,<br>The Skillify Team</p>
          </div>
        </div>
      `,
    });

    return application;
  } catch (error: any) {
    throw new Error(`Failed to approve application: ${error.message}`);
  }
};

// Reject instructor application
export const rejectInstructorApplication = async (
  applicationId: string,
  adminId: string,
  rejectionReason: string,
  adminFeedback?: string
) => {
  try {
    const application = await InstructorApplication.findById(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    if (application.status !== "pending") {
      throw new Error("Application has already been processed");
    }

    // Update application status
    application.status = "rejected";
    application.reviewedAt = new Date();
    application.reviewedBy = new mongoose.Types.ObjectId(adminId);
    application.rejectionReason = rejectionReason;
    application.adminFeedback = adminFeedback;
    await application.save();

    // Send rejection email
    await sendEmail({
      to: application.email,
      subject: "Update on Your Instructor Application - Skillify",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #fee2e2; color: #991b1b; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Application Update</h1>
          </div>
          
          <div style="padding: 30px; background-color: white;">
            <p>Dear ${application.firstName} ${application.lastName},</p>
            
            <p>Thank you for your interest in becoming a Skillify instructor. After careful review, we're unable to approve your application at this time.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-left: 4px solid #ef4444; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">Reason for Rejection:</h3>
              <p style="color: #1f2937; margin-bottom: 0;">${rejectionReason}</p>
            </div>
            
            ${
              adminFeedback
                ? `
              <div style="background-color: #f0f9ff; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                <h3 style="color: #1e40af; margin-top: 0;">Additional Feedback:</h3>
                <p style="color: #1f2937; margin-bottom: 0;">${adminFeedback}</p>
              </div>
            `
                : ""
            }
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">What's Next?</h3>
              <ul style="color: #6b7280;">
                <li>You can reapply after addressing the mentioned concerns</li>
                <li>Consider gaining more experience in your area of expertise</li>
                <li>Feel free to contact our support team for guidance</li>
              </ul>
            </div>
            
            <p>We appreciate your interest in teaching on Skillify and encourage you to apply again in the future.</p>
            <p>Best regards,<br>The Skillify Team</p>
          </div>
        </div>
      `,
    });

    return application;
  } catch (error: any) {
    throw new Error(`Failed to reject application: ${error.message}`);
  }
};

export default {
  submitInstructorApplication,
  getAllInstructorApplications,
  getUserInstructorApplication,
  approveInstructorApplication,
  rejectInstructorApplication,
};
