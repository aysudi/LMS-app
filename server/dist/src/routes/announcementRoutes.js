import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { getAllAnnouncements, getAnnouncementsByCourse, getAnnouncementsByInstructor, getAnnouncementById, createAnnouncement, updateAnnouncement, deleteAnnouncement, markAnnouncementAsRead, getAnnouncementStats, } from "../controllers/announcementController";
const router = express.Router();
// Public routes (require authentication)
router.get("/", authenticateToken, (req, res) => getAllAnnouncements(req, res));
router.get("/course/:courseId", authenticateToken, (req, res) => getAnnouncementsByCourse(req, res));
router.get("/:id", authenticateToken, (req, res) => getAnnouncementById(req, res));
router.post("/:id/read", authenticateToken, (req, res) => markAnnouncementAsRead(req, res));
// Instructor routes
router.get("/instructor/my", authenticateToken, (req, res) => getAnnouncementsByInstructor(req, res));
router.get("/instructor/stats", authenticateToken, (req, res) => getAnnouncementStats(req, res));
router.post("/", authenticateToken, (req, res) => createAnnouncement(req, res));
router.put("/:id", authenticateToken, (req, res) => updateAnnouncement(req, res));
router.delete("/:id", authenticateToken, (req, res) => deleteAnnouncement(req, res));
export default router;
