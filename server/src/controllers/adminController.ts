import { Response } from "express";
import { AuthRequest } from "../types/common.types";
import User from "../models/User";
import Course from "../models/Course";
import Enrollment from "../models/Enrollment";
import { UserRole } from "../types/user.types";
import formatMongoData from "../utils/formatMongoData";

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

    // Get counts and statistics
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
      totalRevenue: 0, // TODO: Calculate from payments/orders
      pendingApprovals: pendingCourses,
      activeStudents: totalStudents, // TODO: Calculate active students
      completedCourses: 0, // TODO: Calculate from enrollments
      certificatesIssued: 0, // TODO: Calculate from certificates
      revenueGrowth: 0, // TODO: Calculate growth
      userGrowth: Math.round((recentUsers / totalUsers) * 100),
      courseGrowth: 0, // TODO: Calculate course growth
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

    // Get additional user data (enrollments, courses created, etc.)
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
          lastActive: "Recently", // TODO: Implement actual last active tracking
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

    // Validate updates
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

    // Instead of hard delete, we'll set status to 'deleted'
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

export default {
  getAdminDashboardStats,
  getAdminUsers,
  updateUserStatus,
  updateUserRole,
  bulkUpdateUsers,
  deleteUser,
};
