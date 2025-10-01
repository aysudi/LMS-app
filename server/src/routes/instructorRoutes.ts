import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { AuthRequest } from "../types/common.types.js";
import {
  getInstructorOverview,
  getInstructorCoursesWithStats,
  getCourseStudents,
} from "../controllers/instructorController";
import {
  getInstructorMessages,
  replyToMessage,
  markMessageAsRead,
  markMessageAsResolved,
  getMessageStats,
} from "../controllers/instructorCommunicationController";
import {
  getInstructorEarnings,
  getInstructorEarningsByCourseController,
  updateInstructorPayoutStatus,
} from "../controllers/instructorEarningsController";

const instructorRouter = Router();

// Dashboard & Overview
instructorRouter.get("/overview", authenticateToken, (req, res) =>
  getInstructorOverview(req as AuthRequest, res)
);

// Course Management
instructorRouter.get("/courses", authenticateToken, (req, res) =>
  getInstructorCoursesWithStats(req as AuthRequest, res)
);

instructorRouter.get(
  "/courses/:courseId/students",
  authenticateToken,
  (req, res) => getCourseStudents(req as AuthRequest, res)
);

// Communication
instructorRouter.get("/messages", authenticateToken, (req, res) =>
  getInstructorMessages(req as AuthRequest, res)
);

instructorRouter.post(
  "/messages/:messageId/reply",
  authenticateToken,
  (req, res) => replyToMessage(req as AuthRequest, res)
);

instructorRouter.patch(
  "/messages/:messageId/read",
  authenticateToken,
  (req, res) => markMessageAsRead(req as AuthRequest, res)
);

instructorRouter.patch(
  "/messages/:messageId/resolve",
  authenticateToken,
  (req, res) => markMessageAsResolved(req as AuthRequest, res)
);

instructorRouter.get("/messages/stats", authenticateToken, (req, res) =>
  getMessageStats(req as AuthRequest, res)
);

// Earnings & Revenue
instructorRouter.get("/earnings", authenticateToken, (req, res) =>
  getInstructorEarnings(req as AuthRequest, res)
);

instructorRouter.get("/earnings/by-course", authenticateToken, (req, res) =>
  getInstructorEarningsByCourseController(req as AuthRequest, res)
);

instructorRouter.patch(
  "/earnings/payout-status",
  authenticateToken,
  (req, res) => updateInstructorPayoutStatus(req as AuthRequest, res)
);

export default instructorRouter;
