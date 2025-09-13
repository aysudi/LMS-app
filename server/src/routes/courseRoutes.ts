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
} from "../controllers/courseController";

const courseRouter = Router();

// Public routes
courseRouter.get("/", (req, res) => getAllCourses(req, res));
courseRouter.get("/:id", (req, res) => getCourseById(req, res));

// Protected routes (require authentication)
courseRouter.use(authenticateToken);

// User/Student routes
courseRouter.get("/user/enrolled", (req, res) =>
  getUserCourses(req as any, res)
);

// Instructor routes
courseRouter.get(
  "/instructor/courses",
  authorizeRoles(UserRole.INSTRUCTOR),
  (req, res) => getInstructorCourses(req as any, res)
);
courseRouter.post("/", authorizeRoles(UserRole.INSTRUCTOR), (req, res) =>
  createCourse(req as any, res)
);
courseRouter.put("/:id", authorizeRoles(UserRole.INSTRUCTOR), (req, res) =>
  updateCourse(req as any, res)
);
courseRouter.delete("/:id", authorizeRoles(UserRole.INSTRUCTOR), (req, res) =>
  deleteCourse(req as any, res)
);

export default courseRouter;
