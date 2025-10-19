import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { AuthRequest } from "../types/common.types.js";
import {
  getAllAnnouncements,
  getAnnouncementsByCourse,
  getAnnouncementsByInstructor,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAnnouncementAsRead,
  getAnnouncementStats,
} from "../controllers/announcementController";

const router = express.Router();

// Public routes (require authentication)
router.get("/", authenticateToken, (req, res) =>
  getAllAnnouncements(req as AuthRequest, res)
);

router.get("/course/:courseId", authenticateToken, (req, res) =>
  getAnnouncementsByCourse(req as AuthRequest, res)
);

router.get("/:id", authenticateToken, (req, res) =>
  getAnnouncementById(req as AuthRequest, res)
);

router.post("/:id/read", authenticateToken, (req, res) =>
  markAnnouncementAsRead(req as AuthRequest, res)
);

// Instructor routes
router.get("/instructor/my", authenticateToken, (req, res) =>
  getAnnouncementsByInstructor(req as AuthRequest, res)
);

router.get("/instructor/stats", authenticateToken, (req, res) =>
  getAnnouncementStats(req as AuthRequest, res)
);

router.post("/", authenticateToken, (req, res) =>
  createAnnouncement(req as AuthRequest, res)
);

router.put("/:id", authenticateToken, (req, res) =>
  updateAnnouncement(req as AuthRequest, res)
);

router.delete("/:id", authenticateToken, (req, res) =>
  deleteAnnouncement(req as AuthRequest, res)
);

export default router;
