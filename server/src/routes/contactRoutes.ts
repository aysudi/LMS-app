import express from "express";
import * as contactController from "../controllers/contactController";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware";
import { UserRole } from "../types/user.types";

const router = express.Router();

// Public route - Create contact message
router.post("/", contactController.createContact);

// Admin routes - Protected
router.get(
  "/",
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  contactController.getContacts
);

router.get(
  "/stats",
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  contactController.getContactStats
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  contactController.getContactById
);

router.post(
  "/:id/reply",
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  contactController.replyToContact
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  contactController.deleteContact
);

export default router;
