import InstructorApplication from "../schemas/instructorApplicationSchema";
import User from "../models/User";
import { UserRole } from "../types/user.types";
import mongoose from "mongoose";
import { sendApplicationApprovedEmail, sendApplicationReceivedEmail, sendApplicationRejectedEmail, } from "../utils/sendMail";
// Submit instructor application
export const submitInstructorApplication = async (userId, applicationData) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        if (user.role === UserRole.INSTRUCTOR) {
            throw new Error("You are already an instructor");
        }
        // Check if user already has a pending or approved application
        const existingApplication = await InstructorApplication.findOne({
            user: userId,
        });
        if (existingApplication) {
            if (existingApplication.status === "pending") {
                throw new Error("You have already submitted an instructor application that is currently under review");
            }
            if (existingApplication.status === "approved") {
                throw new Error("You are already an approved instructor");
            }
            // If rejected, they can resubmit - delete the old one and allow new submission
            if (existingApplication.status === "rejected") {
                await InstructorApplication.findByIdAndDelete(existingApplication._id);
                console.log(`Deleted rejected application for user ${userId} to allow resubmission`);
            }
        }
        // Create new instructor application
        const newApplication = new InstructorApplication({
            user: userId,
            firstName: applicationData.firstName || user.firstName,
            lastName: applicationData.lastName || user.lastName,
            email: applicationData.email || user.email,
            phone: applicationData.phone,
            bio: applicationData.bio,
            expertise: applicationData.expertise,
            experience: applicationData.experience,
            education: applicationData.education,
            motivation: applicationData.motivation,
            sampleCourseTitle: applicationData.sampleCourseTitle,
            sampleCourseDescription: applicationData.sampleCourseDescription,
            portfolio: applicationData.portfolio,
            linkedIn: applicationData.linkedIn,
            website: applicationData.website,
        });
        const savedApplication = await newApplication.save();
        // Send email asynchronously - don't block the response if it fails
        sendApplicationReceivedEmail(user.email, user.firstName, user.lastName).catch((error) => {
            console.error("Error sending application received email:", error.message);
        });
        return savedApplication;
    }
    catch (error) {
        throw new Error(`Failed to submit application: ${error.message}`);
    }
};
// Get all instructor applications (admin only)
export const getAllInstructorApplications = async (page = 1, limit = 10, status) => {
    try {
        const skip = (page - 1) * limit;
        const filter = {};
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
    }
    catch (error) {
        throw new Error(`Failed to fetch applications: ${error.message}`);
    }
};
// Get user's instructor application
export const getUserInstructorApplication = async (userId) => {
    try {
        const application = await InstructorApplication.findOne({ user: userId })
            .populate("user", "firstName lastName email avatar")
            .populate("reviewedBy", "firstName lastName");
        return application;
    }
    catch (error) {
        throw new Error(`Failed to fetch application: ${error.message}`);
    }
};
// Approve instructor application
export const approveInstructorApplication = async (applicationId, adminId, adminFeedback) => {
    try {
        // Find the application
        const application = await InstructorApplication.findById(applicationId).populate("user");
        if (!application) {
            throw new Error("Application not found");
        }
        if (application.status !== "pending") {
            throw new Error(`Cannot approve application with status: ${application.status}. Only pending applications can be approved.`);
        }
        const user = application.user;
        if (!user) {
            throw new Error("User not found for this application");
        }
        // Update application status
        application.status = "approved";
        application.reviewedAt = new Date();
        application.reviewedBy = new mongoose.Types.ObjectId(adminId);
        if (adminFeedback) {
            application.adminFeedback = adminFeedback;
        }
        // Upgrade user to instructor and copy essential data
        user.role = UserRole.INSTRUCTOR;
        user.instructorInfo = {
            bio: application.bio,
            experience: application.experience,
            education: application.education,
            motivation: application.motivation,
            expertise: application.expertise,
            headline: "",
            yearsOfExperience: 0,
            totalStudents: 0,
            averageRating: 0,
            totalReviews: 0,
            totalCourses: 0,
            totalEarnings: 0,
            isVerifiedInstructor: false,
            joinedAsInstructorAt: new Date(),
            paymentInfo: {},
        };
        // Save both application and user
        await Promise.all([application.save(), user.save()]);
        // Send email asynchronously - don't block the response if it fails
        sendApplicationApprovedEmail(user.email, `${user.firstName} ${user.lastName}`).catch((error) => {
            console.error("Error sending application approved email:", error.message);
        });
        return application;
    }
    catch (error) {
        throw new Error(`Failed to approve application: ${error.message}`);
    }
};
// Reject instructor application
export const rejectInstructorApplication = async (applicationId, adminId, rejectionReason, adminFeedback) => {
    try {
        // Find the application
        const application = await InstructorApplication.findById(applicationId).populate("user");
        if (!application) {
            throw new Error("Application not found");
        }
        if (application.status !== "pending") {
            throw new Error(`Cannot reject application with status: ${application.status}. Only pending applications can be rejected.`);
        }
        const user = application.user;
        if (!user) {
            throw new Error("User not found for this application");
        }
        // Update application status
        application.status = "rejected";
        application.reviewedAt = new Date();
        application.reviewedBy = new mongoose.Types.ObjectId(adminId);
        application.rejectionReason = rejectionReason;
        if (adminFeedback) {
            application.adminFeedback = adminFeedback;
        }
        await application.save();
        // Send email asynchronously - don't block the response if it fails
        sendApplicationRejectedEmail(user.email, `${user.firstName} ${user.lastName}`, rejectionReason).catch((error) => {
            console.error("Error sending application rejected email:", error.message);
        });
        return application;
    }
    catch (error) {
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
