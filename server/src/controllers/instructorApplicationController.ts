import { Response } from "express";
import { AuthRequest } from "../types/common.types";
import { UserRole } from "../types/user.types";
import {
  submitInstructorApplication,
  getAllInstructorApplications,
  getUserInstructorApplication,
  approveInstructorApplication,
  rejectInstructorApplication,
} from "../services/instructorApplicationService";

// Submit instructor application
export const submitApplication = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (userRole === UserRole.INSTRUCTOR) {
      return res.status(400).json({
        success: false,
        message: "You are already an instructor",
      });
    }

    const applicationData = req.body;
    const application = await submitInstructorApplication(
      userId,
      applicationData
    );

    res.status(201).json({
      success: true,
      message: "Instructor application submitted successfully",
      data: application,
    });
  } catch (error: any) {
    console.error("Submit application error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to submit application",
    });
  }
};

// Get user's instructor application
export const getMyApplication = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const application = await getUserInstructorApplication(userId);

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error: any) {
    console.error("Get application error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch application",
    });
  }
};

// Get all instructor applications (admin only)
export const getAllApplications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const result = await getAllInstructorApplications(page, limit, status);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Get all applications error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch applications",
    });
  }
};

// Approve instructor application (admin only)
export const approveApplication = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { applicationId } = req.params;
    const { adminFeedback } = req.body;

    const application = await approveInstructorApplication(
      applicationId,
      userId,
      adminFeedback
    );

    res.status(200).json({
      success: true,
      message: "Instructor application approved successfully",
      data: application,
    });
  } catch (error: any) {
    console.error("Approve application error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to approve application",
    });
  }
};

// Reject instructor application (admin only)
export const rejectApplication = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { applicationId } = req.params;
    const { rejectionReason, adminFeedback } = req.body;

    if (!rejectionReason || rejectionReason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const application = await rejectInstructorApplication(
      applicationId,
      userId,
      rejectionReason,
      adminFeedback
    );

    res.status(200).json({
      success: true,
      message: "Instructor application rejected",
      data: application,
    });
  } catch (error: any) {
    console.error("Reject application error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to reject application",
    });
  }
};

export default {
  submitApplication,
  getMyApplication,
  getAllApplications,
  approveApplication,
  rejectApplication,
};
