import { Router } from "express";
import {
  addLesson,
  getLessonsBySection,
  getLessonById,
  updateLesson,
  deleteLesson,
  addNoteToLesson,
  getUserNotesForLesson,
} from "../controllers/lessonController";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware";
import { UserRole } from "../types/user.types";

const lessonRouter = Router();

// Apply authentication middleware to all routes
lessonRouter.use(authenticateToken);

// Get all lessons for a section
lessonRouter.get("/:courseId/sections/:sectionId", (req, res) =>
  getLessonsBySection(req as any, res)
);

// Get specific lesson
lessonRouter.get(
  "/:courseId/sections/:sectionId/lessons/:lessonId",
  (req, res) => getLessonById(req as any, res)
);

// Create new lesson (instructor only)
lessonRouter.post(
  "/:courseId/sections/:sectionId",
  authorizeRoles(UserRole.INSTRUCTOR),
  (req, res) => addLesson(req as any, res)
);

// Update lesson (instructor only)
lessonRouter.put(
  "/:courseId/sections/:sectionId/lessons/:lessonId",
  authorizeRoles(UserRole.INSTRUCTOR),
  (req, res) => updateLesson(req as any, res)
);

// Delete lesson (instructor only)
lessonRouter.delete(
  "/:courseId/sections/:sectionId/lessons/:lessonId",
  authorizeRoles(UserRole.INSTRUCTOR),
  (req, res) => deleteLesson(req as any, res)
);

// Add note to lesson (students and instructors)
lessonRouter.post(
  "/:courseId/sections/:sectionId/lessons/:lessonId/notes",
  (req, res) => addNoteToLesson(req as any, res)
);

// Get user notes for a lesson (students and instructors)
lessonRouter.get(
  "/:courseId/sections/:sectionId/lessons/:lessonId/notes",
  (req, res) => getUserNotesForLesson(req as any, res)
);

export default lessonRouter;
