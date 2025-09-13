import { Router } from "express";
import {
  addLesson,
  getAllLessonsController,
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

lessonRouter.use(authenticateToken);

lessonRouter.get("/", (req, res) => getAllLessonsController(req as any, res));

lessonRouter.get("/section/:sectionId", (req, res) =>
  getLessonsBySection(req as any, res)
);

lessonRouter.get("/:lessonId", (req, res) => getLessonById(req as any, res));

lessonRouter.post("/", authorizeRoles(UserRole.INSTRUCTOR), (req, res) =>
  addLesson(req as any, res)
);

lessonRouter.put(
  "/:courseId/lesson/:lessonId",
  authorizeRoles(UserRole.INSTRUCTOR),
  (req, res) => updateLesson(req as any, res)
);

lessonRouter.delete(
  "/:courseId/lesson/:lessonId",
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
