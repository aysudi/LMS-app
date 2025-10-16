import express from "express";
import {
  syncAllEnrollments,
  syncFromEnrollmentModel,
  syncUsersToCoursesOnly,
  syncCoursesToUsersOnly,
} from "../controllers/enrollmentMigrationController";
import {
  getAdminDashboardStats,
  getAdminUsers,
  updateUserStatus,
  updateUserRole,
  bulkUpdateUsers,
  deleteUser,
  getRecentActivity,
} from "../controllers/adminController";
import { authenticateToken } from "../middlewares/auth.middleware";
import { AuthRequest } from "../types/common.types";

const adminRouter = express.Router();

// Dashboard routes
adminRouter.get("/dashboard/stats", authenticateToken, (req, res) =>
  getAdminDashboardStats(req as AuthRequest, res)
);
adminRouter.get("/dashboard/activity", authenticateToken, (req, res) =>
  getRecentActivity(req as AuthRequest, res)
);

// User management routes
adminRouter.get("/users", authenticateToken, (req, res) =>
  getAdminUsers(req as AuthRequest, res)
);
adminRouter.patch("/users/:userId/status", authenticateToken, (req, res) =>
  updateUserStatus(req as AuthRequest, res)
);
adminRouter.patch("/users/:userId/role", authenticateToken, (req, res) =>
  updateUserRole(req as AuthRequest, res)
);
adminRouter.patch("/users/bulk", authenticateToken, (req, res) =>
  bulkUpdateUsers(req as AuthRequest, res)
);
adminRouter.delete("/users/:userId", authenticateToken, (req, res) =>
  deleteUser(req as AuthRequest, res)
);

// Data migration routes (for development/maintenance)
adminRouter.post("/sync/enrollments/all", syncAllEnrollments);
adminRouter.post("/sync/enrollments/from-model", syncFromEnrollmentModel);
adminRouter.post("/sync/enrollments/users-to-courses", syncUsersToCoursesOnly);
adminRouter.post("/sync/enrollments/courses-to-users", syncCoursesToUsersOnly);

export default adminRouter;
