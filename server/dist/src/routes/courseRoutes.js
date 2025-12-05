import { Router } from "express";
import { authenticateToken, authorizeRoles, } from "../middlewares/auth.middleware";
import { UserRole } from "../types/user.types";
import { createCourse, deleteCourse, getAllCourses, getCourseById, getInstructorCourses, getUserCourses, updateCourse, toggleCourseStatus, submitCourseForApproval, addReview, getCourseReviews, updateReview, deleteReview, } from "../controllers/courseController";
import { courseUploadMiddleware, courseUploadErrorHandler, processCourseUploads, } from "../middlewares/course-upload.middleware.js";
import { trackCourseView } from "../services/analyticsService.js";
const courseRouter = Router();
// Public routes
courseRouter.get("/", (req, res) => getAllCourses(req, res));
courseRouter.get("/:id", (req, res) => getCourseById(req, res));
courseRouter.get("/:id/reviews", (req, res) => getCourseReviews(req, res));
// Protected routes
courseRouter.use(authenticateToken);
courseRouter.get("/user/enrolled", (req, res) => getUserCourses(req, res));
courseRouter.get("/instructor/courses", authorizeRoles(UserRole.INSTRUCTOR), (req, res) => getInstructorCourses(req, res));
courseRouter.post("/", authorizeRoles(UserRole.INSTRUCTOR), courseUploadMiddleware, courseUploadErrorHandler, processCourseUploads, (req, res) => createCourse(req, res));
courseRouter.put("/:id", authorizeRoles(UserRole.INSTRUCTOR), courseUploadMiddleware, courseUploadErrorHandler, processCourseUploads, (req, res) => updateCourse(req, res));
courseRouter.delete("/:id", authorizeRoles(UserRole.INSTRUCTOR), (req, res) => deleteCourse(req, res));
courseRouter.patch("/:id/toggle-status", authorizeRoles(UserRole.INSTRUCTOR), (req, res) => toggleCourseStatus(req, res));
courseRouter.patch("/:id/submit-for-approval", authorizeRoles(UserRole.INSTRUCTOR), (req, res) => submitCourseForApproval(req, res));
// Review routes (authenticated)
courseRouter.post("/:id/reviews", (req, res) => addReview(req, res));
courseRouter.put("/:id/reviews/:reviewId", (req, res) => updateReview(req, res));
courseRouter.delete("/:id/reviews/:reviewId", (req, res) => deleteReview(req, res));
// Track course view for analytics
courseRouter.post("/track-view/:courseId", async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.body.userId; // Optional - may not be provided for anonymous users
        await trackCourseView(courseId, userId);
        res.json({ success: true, message: "View tracked successfully" });
    }
    catch (error) {
        console.error("Error tracking course view:", error);
        res.status(500).json({ success: false, message: "Failed to track view" });
    }
});
// Track watch time for analytics
courseRouter.post("/track-watch-time/:courseId", async (req, res) => {
    try {
        const { courseId } = req.params;
        const { watchTimeSeconds, userId } = req.body;
        const { trackWatchTime } = await import("../services/analyticsService.js");
        await trackWatchTime(courseId, userId, watchTimeSeconds);
        res.json({ success: true, message: "Watch time tracked successfully" });
    }
    catch (error) {
        console.error("Error tracking watch time:", error);
        res
            .status(500)
            .json({ success: false, message: "Failed to track watch time" });
    }
});
export default courseRouter;
