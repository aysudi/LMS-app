import InstructorApplication, {
  IInstructorApplication,
} from "../schemas/instructorApplicationSchema";
import User from "../models/User";
import { UserRole } from "../types/user.types";
import mongoose from "mongoose";
import { sendEmail } from "../utils/emailService";
import { emailTemplates } from "../utils/emailTemplates";

// Submit instructor application
export const submitInstructorApplication = async (
  userId: string,
  applicationData: Partial<IInstructorApplication>
): Promise<IInstructorApplication> => {
  try {
    const existingApplication = await InstructorApplication.findOne({
      user: userId,
    });
    if (existingApplication) {
      throw new Error("You have already submitted an instructor application");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === UserRole.INSTRUCTOR) {
      throw new Error("You are already an instructor");
    }

    const application = new InstructorApplication({
      ...applicationData,
      user: userId,
      status: "pending",
      submittedAt: new Date(),
    });

    await application.save();

    const emailTemplate = emailTemplates.instructorApplicationReceived(
      application.firstName,
      application.lastName
    );

    await sendEmail({
      to: application.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
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

    application.status = "approved";
    application.reviewedAt = new Date();
    application.reviewedBy = new mongoose.Types.ObjectId(adminId);
    application.adminFeedback = adminFeedback;
    await application.save();

    const user = await User.findById(application.user);
    if (user) {
      user.role = UserRole.INSTRUCTOR;
      await user.save();
    }

    const emailTemplate = emailTemplates.instructorApplicationApproved(
      application.firstName,
      application.lastName,
      adminFeedback
    );

    await sendEmail({
      to: application.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
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

    application.status = "rejected";
    application.reviewedAt = new Date();
    application.reviewedBy = new mongoose.Types.ObjectId(adminId);
    application.rejectionReason = rejectionReason;
    application.adminFeedback = adminFeedback;
    await application.save();

    const emailTemplate = emailTemplates.instructorApplicationRejected(
      application.firstName,
      application.lastName,
      rejectionReason,
      adminFeedback
    );

    await sendEmail({
      to: application.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
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
