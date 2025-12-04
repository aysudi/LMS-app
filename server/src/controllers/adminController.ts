import { Response } from "express";
import { AuthRequest } from "../types/common.types";
import User from "../models/User";
import Course from "../models/Course";
import Enrollment from "../models/Enrollment";
import { UserRole } from "../types/user.types";
import formatMongoData from "../utils/formatMongoData";
import mongoose from "mongoose";
import {
  sendCourseApprovedEmail,
  sendCourseRejectedEmail,
} from "../utils/sendMail";
import { getAdminAnalyticsService } from "../services/adminAnalyticsService";

// Get admin dashboard statistics
export const getAdminDashboardStats = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const [
      totalUsers,
      totalInstructors,
      totalStudents,
      totalCourses,
      totalEnrollments,
      pendingCourses,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: UserRole.INSTRUCTOR }),
      User.countDocuments({ role: UserRole.STUDENT }),
      Course.countDocuments({ isPublished: true }),
      Enrollment.countDocuments(),
      Course.countDocuments({ isPublished: false, status: "pending" }),
    ]);

    // Get recent user growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const stats = {
      totalUsers,
      totalInstructors,
      totalStudents,
      totalCourses,
      totalRevenue: 0,
      pendingApprovals: pendingCourses,
      activeStudents: totalStudents,
      completedCourses: 0,
      certificatesIssued: 0,
      revenueGrowth: 0,
      userGrowth: Math.round((recentUsers / totalUsers) * 100),
      courseGrowth: 0,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Get admin dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get dashboard statistics",
    });
  }
};

// Get all users with admin privileges
export const getAdminUsers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const filters: any = {};
    if (role && role !== "all") {
      filters.role = role;
    }
    if (status && status !== "all") {
      filters.status = status;
    }
    if (search) {
      filters.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

    const [users, totalUsers] = await Promise.all([
      User.find(filters)
        .select(
          "-password -refreshToken -verificationToken -passwordResetToken"
        )
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filters),
    ]);

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [enrollmentCount, coursesCreated] = await Promise.all([
          user.role === UserRole.STUDENT
            ? Enrollment.countDocuments({ user: user._id })
            : 0,
          user.role === UserRole.INSTRUCTOR
            ? Course.countDocuments({ instructor: user._id })
            : 0,
        ]);

        return {
          ...formatMongoData(user),
          coursesEnrolled: enrollmentCount,
          coursesCreated: coursesCreated,
          lastActive: "Recently",
        };
      })
    );

    const totalPages = Math.ceil(totalUsers / limitNum);

    res.status(200).json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalUsers,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      },
    });
  } catch (error: any) {
    console.error("Get admin users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get users",
    });
  }
};

// Update user status
export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { userId: targetUserId } = req.params;
    const { status } = req.body;

    if (!userId || userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    if (!["active", "suspended", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const user = await User.findByIdAndUpdate(
      targetUserId,
      { status },
      { new: true }
    ).select("-password -refreshToken -verificationToken -passwordResetToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: formatMongoData(user),
    });
  } catch (error: any) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

// Update user role
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { userId: targetUserId } = req.params;
    const { role } = req.body;

    if (!userId || userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role value",
      });
    }

    const user = await User.findByIdAndUpdate(
      targetUserId,
      { role },
      { new: true }
    ).select("-password -refreshToken -verificationToken -passwordResetToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: formatMongoData(user),
    });
  } catch (error: any) {
    console.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
    });
  }
};

// Bulk update users
export const bulkUpdateUsers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { userIds, updates } = req.body;

    if (!userId || userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User IDs array is required",
      });
    }

    const allowedFields = ["status", "role"];
    const validUpdates: any = {};

    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        validUpdates[key] = updates[key];
      }
    });

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: validUpdates }
    );

    res.status(200).json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} users`,
      updated: result.modifiedCount,
    });
  } catch (error: any) {
    console.error("Bulk update users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update users",
    });
  }
};

// Delete user (soft delete - set status to deleted)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { userId: targetUserId } = req.params;

    if (!userId || userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const user = await User.findByIdAndUpdate(
      targetUserId,
      { status: "deleted", deletedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// Get recent activity
export const getRecentActivity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const limit = parseInt(req.query.limit as string) || 10;

    const [recentUsers, recentCourses, recentEnrollments] = await Promise.all([
      User.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select("firstName lastName email role createdAt"),

      Course.find()
        .sort({ updatedAt: -1 })
        .limit(3)
        .populate("instructor", "firstName lastName")
        .select("title instructor isPublished updatedAt createdAt"),

      Enrollment.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .populate("user", "firstName lastName")
        .populate("course", "title")
        .select("user course createdAt"),
    ]);

    const activities: any[] = [];

    recentUsers.forEach((user) => {
      activities.push({
        id: `user_${user._id}`,
        type: "new_user",
        user: `${user.firstName} ${user.lastName}`,
        action: `registered as ${user.role}`,
        time: user.createdAt,
        metadata: { email: user.email, role: user.role },
      });
    });

    recentCourses.forEach((course) => {
      const instructor = course.instructor as any;
      const isPublished = (course as any).isPublished;
      activities.push({
        id: `course_${course._id}`,
        type: isPublished ? "course_update" : "course_submission",
        user: instructor
          ? `${instructor.firstName} ${instructor.lastName}`
          : "Unknown Instructor",
        action: isPublished
          ? `published course "${course.title}"`
          : `submitted "${course.title}" for approval`,
        time: course.updatedAt,
        metadata: { courseTitle: course.title, isPublished },
      });
    });

    recentEnrollments.forEach((enrollment) => {
      const user = enrollment.user as any;
      const course = enrollment.course as any;
      activities.push({
        id: `enrollment_${enrollment._id}`,
        type: "user_action",
        user: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
        action: course
          ? `enrolled in "${course.title}"`
          : "enrolled in a course",
        time: enrollment.createdAt,
        metadata: { courseTitle: course?.title },
      });
    });

    activities.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );
    const limitedActivities = activities.slice(0, limit);

    const formattedActivities = limitedActivities.map((activity) => ({
      ...activity,
      time: new Date(activity.time).toLocaleString(),
    }));

    res.status(200).json({
      success: true,
      data: formattedActivities,
    });
  } catch (error: any) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent activity",
      error: error.message,
    });
  }
};

// Get admin analytics data
export const getAdminAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const analytics = await getAdminAnalyticsService(req.query);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    console.error("Error fetching admin analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
      error: error.message,
    });
  }
};

// Get admin certificates data
export const getAdminCertificates = async (req: AuthRequest, res: Response) => {
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
    const skip = (page - 1) * limit;

    const certificates: any = await Enrollment.find({
      certificateIssued: true,
      status: "completed",
    })
      .populate("user", "firstName lastName email avatar")
      .populate("course", "title instructor category")
      .populate({
        path: "course",
        populate: {
          path: "instructor",
          select: "firstName lastName",
        },
      })
      .sort({ certificateIssuedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount: any = await Enrollment.countDocuments({
      certificateIssued: true,
      status: "completed",
    });

    const stats = {
      totalCertificates: totalCount,
      issuedThisMonth: await Enrollment.countDocuments({
        certificateIssued: true,
        status: "completed",
        certificateIssuedAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
      averageCompletionTime: await Enrollment.aggregate([
        {
          $match: {
            certificateIssued: true,
            status: "completed",
            completedAt: { $exists: true },
            enrolledAt: { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            avgTime: {
              $avg: {
                $divide: [
                  { $subtract: ["$completedAt", "$enrolledAt"] },
                  1000 * 60 * 60 * 24, // Convert to days
                ],
              },
            },
          },
        },
      ]).then((result) => Math.round(result[0]?.avgTime || 0)),
    };

    const formattedCertificates = certificates.map((enrollment: any) => ({
      id: enrollment._id,
      certificateId: enrollment.certificateId,
      student: {
        id: enrollment.user._id,
        name: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
        email: enrollment.user.email,
        avatar: enrollment.user.avatar,
      },
      course: {
        id: enrollment.course._id,
        title: enrollment.course.title,
        category: enrollment.course.category,
        instructor: enrollment.course.instructor
          ? {
              name: `${enrollment.course.instructor.firstName} ${enrollment.course.instructor.lastName}`,
            }
          : null,
      },
      issuedAt: enrollment.certificateIssuedAt,
      completedAt: enrollment.completedAt,
      enrolledAt: enrollment.enrolledAt,
      progress: enrollment.progress,
      grade: enrollment.grade || "Pass",
    }));

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: {
        certificates: formattedCertificates,
        stats,
        pagination: {
          currentPage: page,
          totalPages,
          totalCertificates: totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching admin certificates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch certificates data",
      error: error.message,
    });
  }
};

// Get admin courses for moderation
export const getAdminCourses = async (req: AuthRequest, res: Response) => {
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
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    // Build filter - exclude draft courses, only show courses that have been submitted
    const filter: any = {
      status: { $in: ["pending", "approved", "rejected"] },
    };

    if (status && status !== "all") {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const [courses, totalCount] = await Promise.all([
      Course.find(filter)
        .populate("instructor", "firstName lastName email avatar")
        .populate("reviewedBy", "firstName lastName")
        .sort({ submittedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Course.countDocuments(filter),
    ]);

    const formattedCourses = courses.map((course: any) => ({
      id: course._id,
      title: course.title,
      description: course.description,
      shortDescription: course.shortDescription,
      category: course.category,
      level: course.level,
      originalPrice: course.originalPrice,
      discountPrice: course.discountPrice,
      isFree: course.isFree,
      image: course.image,
      instructor: {
        id: course.instructor._id,
        name: `${course.instructor.firstName} ${course.instructor.lastName}`,
        email: course.instructor.email,
        avatar: course.instructor.avatar,
      },
      status: course.status,
      isPublished: course.isPublished,
      submittedAt: course.submittedAt,
      reviewedAt: course.reviewedAt,
      reviewedBy: course.reviewedBy
        ? {
            name: `${course.reviewedBy.firstName} ${course.reviewedBy.lastName}`,
          }
        : null,
      rejectionReason: course.rejectionReason,
      adminFeedback: course.adminFeedback,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      studentsCount: course.studentsEnrolled?.length || 0,
      rating: course.rating,
      ratingsCount: course.ratingsCount,
      totalLessons: course.totalLessons,
      totalDuration: course.totalDuration,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: {
        courses: formattedCourses,
        pagination: {
          currentPage: page,
          totalPages,
          totalCourses: totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching admin courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses data",
      error: error.message,
    });
  }
};

// Approve course
export const approveCourse = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { courseId } = req.params;
    const { adminFeedback } = req.body;

    const course = await Course.findById(courseId).populate(
      "instructor",
      "firstName lastName email"
    );
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Course is not pending approval",
      });
    }

    // Update course status
    course.status = "approved";
    course.isPublished = true;
    course.publishedAt = new Date();
    course.reviewedAt = new Date();
    course.reviewedBy = new mongoose.Types.ObjectId(userId);
    if (adminFeedback) {
      course.adminFeedback = adminFeedback;
    }

    await course.save();

    // Send email notification to instructor about approval
    try {
      const instructor = course.instructor as any;
      await sendCourseApprovedEmail(
        instructor.email,
        `${instructor.firstName} ${instructor.lastName}`,
        course.title,
        course._id.toString(),
        adminFeedback
      );
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
      // Continue with the response even if email fails
    }

    res.status(200).json({
      success: true,
      message: "Course approved successfully",
      data: {
        courseId: course._id,
        status: course.status,
        isPublished: course.isPublished,
        publishedAt: course.publishedAt,
      },
    });
  } catch (error: any) {
    console.error("Error approving course:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve course",
      error: error.message,
    });
  }
};

// Reject course
export const rejectCourse = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { courseId } = req.params;
    const { rejectionReason, adminFeedback } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const course = await Course.findById(courseId).populate(
      "instructor",
      "firstName lastName email"
    );
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Course is not pending approval",
      });
    }

    // Update course status
    course.status = "rejected";
    course.isPublished = false;
    course.reviewedAt = new Date();
    course.reviewedBy = new mongoose.Types.ObjectId(userId);
    course.rejectionReason = rejectionReason;
    if (adminFeedback) {
      course.adminFeedback = adminFeedback;
    }

    await course.save();

    // Send email notification to instructor about rejection
    try {
      const instructor = course.instructor as any;
      await sendCourseRejectedEmail(
        instructor.email,
        `${instructor.firstName} ${instructor.lastName}`,
        course.title,
        course._id.toString(),
        rejectionReason,
        adminFeedback
      );
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
      // Continue with the response even if email fails
    }

    res.status(200).json({
      success: true,
      message: "Course rejected successfully",
      data: {
        courseId: course._id,
        status: course.status,
        rejectionReason: course.rejectionReason,
      },
    });
  } catch (error: any) {
    console.error("Error rejecting course:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject course",
      error: error.message,
    });
  }
};

// Get detailed course information for admin review
export const getAdminCourseDetails = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate("instructor", "firstName lastName email avatar bio")
      .populate("reviewedBy", "firstName lastName")
      .populate({
        path: "sections",
        populate: {
          path: "lessons",
          model: "Lesson",
        },
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const instructor = course.instructor as any;
    const reviewedBy = course.reviewedBy as any;

    const courseDetails = {
      id: course._id,
      title: course.title,
      description: course.description,
      shortDescription: course.shortDescription,
      category: course.category,
      subcategory: course.subcategory,
      level: course.level,
      originalPrice: course.originalPrice,
      discountPrice: course.discountPrice,
      isFree: course.isFree,
      image: course.image,
      videoPromo: course.videoPromo,
      tags: course.tags,
      language: course.language,
      learningObjectives: course.learningObjectives,
      requirements: course.requirements,
      targetAudience: course.targetAudience,
      certificateProvided: course.certificateProvided,
      instructor: {
        id: instructor._id,
        name: `${instructor.firstName} ${instructor.lastName}`,
        email: instructor.email,
        avatar: instructor.avatar,
        bio: instructor.bio,
      },
      status: course.status,
      isPublished: course.isPublished,
      submittedAt: course.submittedAt,
      publishedAt: course.publishedAt,
      reviewedAt: course.reviewedAt,
      reviewedBy: reviewedBy
        ? {
            name: `${reviewedBy.firstName} ${reviewedBy.lastName}`,
          }
        : null,
      rejectionReason: course.rejectionReason,
      adminFeedback: course.adminFeedback,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      totalDuration: course.totalDuration,
      totalLessons: course.totalLessons,
      studentsEnrolled: course.studentsEnrolled?.length || 0,
      rating: course.rating,
      ratingsCount: course.ratingsCount,
      sections: (course as any).sections || [],
    };

    res.status(200).json({
      success: true,
      data: courseDetails,
    });
  } catch (error: any) {
    console.error("Error fetching course details for admin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course details",
      error: error.message,
    });
  }
};

export default {
  getAdminDashboardStats,
  getAdminUsers,
  updateUserStatus,
  updateUserRole,
  bulkUpdateUsers,
  deleteUser,
  getRecentActivity,
  getAdminAnalytics,
  getAdminCertificates,
  getAdminCourses,
  getAdminCourseDetails,
  approveCourse,
  rejectCourse,
};
