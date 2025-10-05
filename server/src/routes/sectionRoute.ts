import { Router } from "express";
import {
  addSection,
  getAllSectionsController,
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
import {
  sectionUploadMiddleware,
  sectionUploadErrorHandler,
  processSectionUploads,
} from "../middlewares/section-upload.middleware";

const sectionRouter = Router();

sectionRouter.get("/", (req, res) => getAllSectionsController(req as any, res));

sectionRouter.post(
  "/",
  authenticateToken,
  authorizeRoles(UserRole.INSTRUCTOR),
  sectionUploadMiddleware,
  sectionUploadErrorHandler,
  processSectionUploads,
  (req: any, res: any) => addSection(req, res)
);

sectionRouter.get("/course/:courseId", (req, res) =>
  getSections(req as any, res)
);

sectionRouter.get("/:courseId/with-count", (req, res) =>
  getSectionsWithCount(req as any, res)
);

sectionRouter.get("/:sectionId", (req, res) => getSection(req as any, res));

sectionRouter.put(
  "/:sectionId",
  authenticateToken,
  authorizeRoles(UserRole.INSTRUCTOR),
  sectionUploadMiddleware,
  sectionUploadErrorHandler,
  processSectionUploads,
  (req: any, res: any) => updateSection(req, res)
);

sectionRouter.delete(
  "/:sectionId",
  authenticateToken,
  authorizeRoles(UserRole.INSTRUCTOR),
  (req, res) => deleteSection(req as any, res)
);

export default sectionRouter;
