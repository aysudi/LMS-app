import { Router } from "express";
import {
  getCourseProgress,
  updateLessonProgress,
  getLearningAnalytics,
  getUserProgress,
  completeLessonProgress,
} from "../controllers/userProgressController";
import { authenticateToken } from "../middlewares/auth.middleware";
import { AuthRequest } from "../types/common.types";

const userProgressRouter = Router();

// GET /api/user-progress - Get all user progress
userProgressRouter.get("/", authenticateToken, (req, res) =>
  getUserProgress(req as AuthRequest, res)
);

// GET /api/user-progress/analytics - Get learning analytics
userProgressRouter.get("/analytics", authenticateToken, (req, res) =>
  getLearningAnalytics(req as AuthRequest, res)
);

// GET /api/user-progress/course/:courseId - Get course progress
userProgressRouter.get("/course/:courseId", authenticateToken, (req, res) =>
  getCourseProgress(req as AuthRequest, res)
);

// PATCH /api/user-progress/course/:courseId - Update lesson progress
userProgressRouter.patch("/:courseId", authenticateToken, (req, res) =>
  updateLessonProgress(req as AuthRequest, res)
);

// POST /api/user-progress/:courseId - Complete lesson (only once)
userProgressRouter.post("/:courseId", authenticateToken, (req, res) =>
  completeLessonProgress(req as AuthRequest, res)
);

export default userProgressRouter;
