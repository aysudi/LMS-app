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
import {
  lessonUploadMiddleware,
  lessonUploadErrorHandler,
  processLessonUploads,
} from "../middlewares/lesson-upload.middleware";

const lessonRouter = Router();

// lessonRouter.use(authenticateToken);

lessonRouter.get("/", (req, res) => getAllLessonsController(req as any, res));

lessonRouter.get("/section/:sectionId", (req, res) =>
  getLessonsBySection(req as any, res)
);

lessonRouter.get("/:lessonId", (req, res) => getLessonById(req as any, res));

lessonRouter.post(
  "/",
  authenticateToken,
  authorizeRoles(UserRole.INSTRUCTOR),
  lessonUploadMiddleware,
  lessonUploadErrorHandler,
  processLessonUploads,
  (req: any, res: any) => addLesson(req, res)
);

lessonRouter.put(
  "/:courseId/lesson/:lessonId",
  authenticateToken,
  authorizeRoles(UserRole.INSTRUCTOR),
  lessonUploadMiddleware,
  lessonUploadErrorHandler,
  processLessonUploads,
  (req: any, res: any) => updateLesson(req, res)
);

lessonRouter.delete(
  "/:courseId/lesson/:lessonId",
  authenticateToken,
  authorizeRoles(UserRole.INSTRUCTOR),
  (req, res) => deleteLesson(req as any, res)
);

// Add note to lesson (students and instructors)
lessonRouter.post(
  "/:courseId/sections/:sectionId/lessons/:lessonId/notes",
  authenticateToken,
  (req, res) => addNoteToLesson(req as any, res)
);

// Get user notes for a lesson (students and instructors)
lessonRouter.get(
  "/:courseId/sections/:sectionId/lessons/:lessonId/notes",
  (req, res) => getUserNotesForLesson(req as any, res)
);

export default lessonRouter;
