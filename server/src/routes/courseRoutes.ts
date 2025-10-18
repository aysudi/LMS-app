import { Router } from "express";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware";
import { UserRole } from "../types/user.types";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  getInstructorCourses,
  getUserCourses,
  updateCourse,
  toggleCourseStatus,
  submitCourseForApproval,
} from "../controllers/courseController";
import {
  courseUploadMiddleware,
  courseUploadErrorHandler,
  processCourseUploads,
} from "../middlewares/course-upload.middleware.js";

const courseRouter = Router();

courseRouter.get("/", (req, res) => getAllCourses(req, res));
courseRouter.get("/:id", (req, res) => getCourseById(req, res));

courseRouter.use(authenticateToken);

courseRouter.get("/user/enrolled", authenticateToken, (req, res) =>
  getUserCourses(req as any, res)
);

courseRouter.get(
  "/instructor/courses",
  authorizeRoles(UserRole.INSTRUCTOR),
  (req, res) => getInstructorCourses(req as any, res)
);
courseRouter.post(
  "/",
  authorizeRoles(UserRole.INSTRUCTOR),
  courseUploadMiddleware,
  courseUploadErrorHandler,
  processCourseUploads,
  (req: any, res: any) => createCourse(req, res)
);
courseRouter.put(
  "/:id",
  authorizeRoles(UserRole.INSTRUCTOR),
  courseUploadMiddleware,
  courseUploadErrorHandler,
  processCourseUploads,
  (req: any, res: any) => updateCourse(req, res)
);
courseRouter.delete("/:id", authorizeRoles(UserRole.INSTRUCTOR), (req, res) =>
  deleteCourse(req as any, res)
);
courseRouter.patch(
  "/:id/toggle-status",
  authorizeRoles(UserRole.INSTRUCTOR),
  (req, res) => toggleCourseStatus(req as any, res)
);
courseRouter.patch(
  "/:id/submit-for-approval",
  authorizeRoles(UserRole.INSTRUCTOR),
  (req, res) => submitCourseForApproval(req as any, res)
);

export default courseRouter;
