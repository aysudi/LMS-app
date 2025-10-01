import { Router } from "express";
import { getUserEnrollments, getEnrollmentById, updateEnrollmentProgress, getEnrollmentNotes, addEnrollmentNote, getEnrollmentReviews, toggleLessonBookmark, addCourseReview, getLearningStats, recalculateEnrollmentProgress, recalculateAllUserProgress, } from "../controllers/enrollmentController";
import { authenticateToken } from "../middlewares/auth.middleware";
const enrollmentRouter = Router();
enrollmentRouter.get("/", authenticateToken, (req, res) => getUserEnrollments(req, res));
enrollmentRouter.get("/stats", authenticateToken, (req, res) => getLearningStats(req, res));
// POST /api/enrollments/recalculate-all-progress - Recalculate all user enrollments progress
enrollmentRouter.post("/recalculate-all-progress", authenticateToken, (req, res) => recalculateAllUserProgress(req, res));
enrollmentRouter.get("/:enrollmentId", authenticateToken, (req, res) => getEnrollmentById(req, res));
// PATCH /api/enrollments/:enrollmentId/progress - Update enrollment progress
enrollmentRouter.patch("/:enrollmentId/progress", authenticateToken, (req, res) => updateEnrollmentProgress(req, res));
// GET /api/enrollments/:enrollmentId/notes - Get enrollment notes
enrollmentRouter.get("/:enrollmentId/notes", authenticateToken, (req, res) => getEnrollmentNotes(req, res));
// POST /api/enrollments/:enrollmentId/notes - Add note to enrollment
enrollmentRouter.post("/:enrollmentId/notes", authenticateToken, (req, res) => addEnrollmentNote(req, res));
// PATCH /api/enrollments/:enrollmentId/bookmark - Toggle lesson bookmark
enrollmentRouter.patch("/:enrollmentId/bookmark", authenticateToken, (req, res) => toggleLessonBookmark(req, res));
// GET /api/enrollments/:enrollmentId/review - Get enrollment review
enrollmentRouter.get("/:enrollmentId/review", authenticateToken, (req, res) => getEnrollmentReviews(req, res));
// POST /api/enrollments/:enrollmentId/review - Add course review
enrollmentRouter.post("/:enrollmentId/review", authenticateToken, (req, res) => addCourseReview(req, res));
// POST /api/enrollments/:enrollmentId/recalculate-progress - Recalculate enrollment progress
enrollmentRouter.post("/:enrollmentId/recalculate-progress", authenticateToken, (req, res) => recalculateEnrollmentProgress(req, res));
export default enrollmentRouter;
