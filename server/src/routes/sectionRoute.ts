import { Router } from "express";
import {
  addSection,
  getSections,
  getSectionsWithCount,
  getSection,
  updateSection,
  deleteSection,
} from "../controllers/sectionController";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware";
import { UserRole } from "../types/user.types";

const sectionRouter = Router();

// Apply authentication middleware to all routes
sectionRouter.use(authenticateToken);

// Get all sections for a course
sectionRouter.get("/:courseId", (req, res) => getSections(req as any, res));

// Get sections with lesson count
sectionRouter.get("/:courseId/sections/with-count", (req, res) =>
  getSectionsWithCount(req as any, res)
);

// Get specific section
sectionRouter.get("/:courseId/section/:sectionId", (req, res) =>
  getSection(req as any, res)
);

// Create new section (instructor only)
sectionRouter.post(
  "/:courseId",
  authorizeRoles(UserRole.INSTRUCTOR),
  (req, res) => addSection(req as any, res)
);

// Update section (instructor only)
sectionRouter.put(
  "/:courseId/section/:sectionId",
  authorizeRoles(UserRole.INSTRUCTOR),
  (req, res) => updateSection(req as any, res)
);

// Delete section (instructor only)
sectionRouter.delete(
  "/:courseId/section/:sectionId",
  authorizeRoles(UserRole.INSTRUCTOR),
  (req, res) => deleteSection(req as any, res)
);

export default sectionRouter;
