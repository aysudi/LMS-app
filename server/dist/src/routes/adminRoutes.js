import express from "express";
import { syncAllEnrollments, syncFromEnrollmentModel, syncUsersToCoursesOnly, syncCoursesToUsersOnly, } from "../controllers/enrollmentMigrationController";
import { getAdminDashboardStats, getAdminUsers, updateUserStatus, updateUserRole, bulkUpdateUsers, deleteUser, getRecentActivity, getAdminAnalytics, getAdminCertificates, getAdminCourses, getAdminCourseDetails, approveCourse, rejectCourse, } from "../controllers/adminController";
import { authenticateToken } from "../middlewares/auth.middleware";
const adminRouter = express.Router();
// Dashboard routes
adminRouter.get("/dashboard/stats", authenticateToken, (req, res) => getAdminDashboardStats(req, res));
adminRouter.get("/dashboard/activity", authenticateToken, (req, res) => getRecentActivity(req, res));
// User management routes
adminRouter.get("/users", authenticateToken, (req, res) => getAdminUsers(req, res));
adminRouter.patch("/users/:userId/status", authenticateToken, (req, res) => updateUserStatus(req, res));
adminRouter.patch("/users/:userId/role", authenticateToken, (req, res) => updateUserRole(req, res));
adminRouter.patch("/users/bulk", authenticateToken, (req, res) => bulkUpdateUsers(req, res));
adminRouter.delete("/users/:userId", authenticateToken, (req, res) => deleteUser(req, res));
// Analytics routes
adminRouter.get("/analytics", authenticateToken, (req, res) => getAdminAnalytics(req, res));
// Certificates routes
adminRouter.get("/certificates", authenticateToken, (req, res) => getAdminCertificates(req, res));
// Course moderation routes
adminRouter.get("/courses", authenticateToken, (req, res) => getAdminCourses(req, res));
adminRouter.get("/courses/:courseId", authenticateToken, (req, res) => getAdminCourseDetails(req, res));
adminRouter.patch("/courses/:courseId/approve", authenticateToken, (req, res) => approveCourse(req, res));
adminRouter.patch("/courses/:courseId/reject", authenticateToken, (req, res) => rejectCourse(req, res));
// Data migration routes (for development/maintenance)
adminRouter.post("/sync/enrollments/all", syncAllEnrollments);
adminRouter.post("/sync/enrollments/from-model", syncFromEnrollmentModel);
adminRouter.post("/sync/enrollments/users-to-courses", syncUsersToCoursesOnly);
adminRouter.post("/sync/enrollments/courses-to-users", syncCoursesToUsersOnly);
export default adminRouter;
