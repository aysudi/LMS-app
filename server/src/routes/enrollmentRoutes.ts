import { Router } from "express";
import {
  getUserEnrollments,
  getEnrollmentById,
  updateEnrollmentProgress,
  getEnrollmentNotes,
  addEnrollmentNote,
  getEnrollmentReviews,
  toggleLessonBookmark,
  addCourseReview,
  getLearningStats,
  recalculateEnrollmentProgress,
  recalculateAllUserProgress,
  enrollInFreeCourse,
} from "../controllers/enrollmentController";
import { authenticateToken } from "../middlewares/auth.middleware";
import { AuthRequest } from "../types/common.types";

const enrollmentRouter = Router();

enrollmentRouter.get("/", authenticateToken, (req, res) =>
  getUserEnrollments(req as AuthRequest, res)
);

enrollmentRouter.get("/stats", authenticateToken, (req, res) =>
  getLearningStats(req as AuthRequest, res)
);

enrollmentRouter.post("/free", authenticateToken, (req, res) =>
  enrollInFreeCourse(req as AuthRequest, res)
);

enrollmentRouter.post(
  "/recalculate-all-progress",
  authenticateToken,
  (req, res) => recalculateAllUserProgress(req as AuthRequest, res)
);

enrollmentRouter.get("/:enrollmentId", authenticateToken, (req, res) =>
  getEnrollmentById(req as AuthRequest, res)
);

enrollmentRouter.patch(
  "/:enrollmentId/progress",
  authenticateToken,
  (req, res) => updateEnrollmentProgress(req as AuthRequest, res)
);

enrollmentRouter.get("/:enrollmentId/notes", authenticateToken, (req, res) =>
  getEnrollmentNotes(req as AuthRequest, res)
);

enrollmentRouter.post("/:enrollmentId/notes", authenticateToken, (req, res) =>
  addEnrollmentNote(req as AuthRequest, res)
);

enrollmentRouter.patch(
  "/:enrollmentId/bookmark",
  authenticateToken,
  (req, res) => toggleLessonBookmark(req as AuthRequest, res)
);

enrollmentRouter.get("/:enrollmentId/review", authenticateToken, (req, res) =>
  getEnrollmentReviews(req as AuthRequest, res)
);

enrollmentRouter.post("/:enrollmentId/review", authenticateToken, (req, res) =>
  addCourseReview(req as AuthRequest, res)
);

enrollmentRouter.post(
  "/:enrollmentId/recalculate-progress",
  authenticateToken,
  (req, res) => recalculateEnrollmentProgress(req as AuthRequest, res)
);

export default enrollmentRouter;
