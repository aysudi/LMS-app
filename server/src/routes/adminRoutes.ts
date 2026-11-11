import express from "express";
import {
  syncAllEnrollments,
  syncFromEnrollmentModel,
  syncUsersToCoursesOnly,
  syncCoursesToUsersOnly,
} from "../controllers/enrollmentMigrationController.js";
import {
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
} from "../controllers/adminController.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { AuthRequest } from "../types/common.types.js";
import { UserRole } from "../types/user.types.js";

const adminRouter = express.Router();

// Dashboard routes
adminRouter.get("/dashboard/stats", authenticateToken, (req, res) =>
  getAdminDashboardStats(req as AuthRequest, res),
);
adminRouter.get("/dashboard/activity", authenticateToken, (req, res) =>
  getRecentActivity(req as AuthRequest, res),
);

// User management routes
adminRouter.get("/users", authenticateToken, (req, res) =>
  getAdminUsers(req as AuthRequest, res),
);
adminRouter.patch("/users/:userId/status", authenticateToken, (req, res) =>
  updateUserStatus(req as AuthRequest, res),
);
adminRouter.patch("/users/:userId/role", authenticateToken, (req, res) =>
  updateUserRole(req as AuthRequest, res),
);
adminRouter.patch("/users/bulk", authenticateToken, (req, res) =>
  bulkUpdateUsers(req as AuthRequest, res),
);
adminRouter.delete("/users/:userId", authenticateToken, (req, res) =>
  deleteUser(req as AuthRequest, res),
);

// Analytics routes
adminRouter.get("/analytics", authenticateToken, (req, res) =>
  getAdminAnalytics(req as AuthRequest, res),
);

// Certificates routes
adminRouter.get("/certificates", authenticateToken, (req, res) =>
  getAdminCertificates(req as AuthRequest, res),
);

// Course moderation routes
adminRouter.get("/courses", authenticateToken, (req, res) =>
  getAdminCourses(req as AuthRequest, res),
);
adminRouter.get("/courses/:courseId", authenticateToken, (req, res) =>
  getAdminCourseDetails(req as AuthRequest, res),
);
adminRouter.patch("/courses/:courseId/approve", authenticateToken, (req, res) =>
  approveCourse(req as AuthRequest, res),
);
adminRouter.patch("/courses/:courseId/reject", authenticateToken, (req, res) =>
  rejectCourse(req as AuthRequest, res),
);

// Data migration routes (for development/maintenance)
const requireAdmin = [authenticateToken, authorizeRoles(UserRole.ADMIN)];
adminRouter.post("/sync/enrollments/all", ...requireAdmin, syncAllEnrollments);
adminRouter.post(
  "/sync/enrollments/from-model",
  ...requireAdmin,
  syncFromEnrollmentModel,
);
adminRouter.post(
  "/sync/enrollments/users-to-courses",
  ...requireAdmin,
  syncUsersToCoursesOnly,
);
adminRouter.post(
  "/sync/enrollments/courses-to-users",
  ...requireAdmin,
  syncCoursesToUsersOnly,
);

export default adminRouter;
