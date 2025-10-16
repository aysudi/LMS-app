import express from "express";
import {
  submitApplication,
  getMyApplication,
  getAllApplications,
  approveApplication,
  rejectApplication,
} from "../controllers/instructorApplicationController";
import { authenticateToken } from "../middlewares/auth.middleware";
import { AuthRequest } from "../types/common.types";

const instructorApplicationRouter = express.Router();

// Student routes
instructorApplicationRouter.post("/", authenticateToken, (req, res) =>
  submitApplication(req as AuthRequest, res)
);

instructorApplicationRouter.get(
  "/my-application",
  authenticateToken,
  (req, res) => getMyApplication(req as AuthRequest, res)
);

// Admin routes
instructorApplicationRouter.get("/admin/all", authenticateToken, (req, res) =>
  getAllApplications(req as AuthRequest, res)
);

instructorApplicationRouter.patch(
  "/admin/:applicationId/approve",
  authenticateToken,
  (req, res) => approveApplication(req as AuthRequest, res)
);

instructorApplicationRouter.patch(
  "/admin/:applicationId/reject",
  authenticateToken,
  (req, res) => rejectApplication(req as AuthRequest, res)
);

export default instructorApplicationRouter;
