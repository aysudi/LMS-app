import { Router } from "express";
import {
  getUserEnrollments,
  getEnrollmentById,
  updateEnrollmentProgress,
  addEnrollmentNote,
  toggleLessonBookmark,
  addCourseReview,
  getLearningStats,
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

enrollmentRouter.get("/:enrollmentId", authenticateToken, (req, res) =>
  getEnrollmentById(req as AuthRequest, res)
);

// PATCH /api/enrollments/:enrollmentId/progress - Update enrollment progress
enrollmentRouter.patch(
  "/:enrollmentId/progress",
  authenticateToken,
  (req, res) => updateEnrollmentProgress(req as AuthRequest, res)
);

// POST /api/enrollments/:enrollmentId/notes - Add note to enrollment
enrollmentRouter.post("/:enrollmentId/notes", authenticateToken, (req, res) =>
  addEnrollmentNote(req as AuthRequest, res)
);

// PATCH /api/enrollments/:enrollmentId/bookmark - Toggle lesson bookmark
enrollmentRouter.patch(
  "/:enrollmentId/bookmark",
  authenticateToken,
  (req, res) => toggleLessonBookmark(req as AuthRequest, res)
);

// POST /api/enrollments/:enrollmentId/review - Add course review
enrollmentRouter.post("/:enrollmentId/review", authenticateToken, (req, res) =>
  addCourseReview(req as AuthRequest, res)
);

export default enrollmentRouter;
