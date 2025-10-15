import express from "express";
import { generateAndSendCertificate, downloadCertificate, getCertificateStatus, } from "../controllers/certificateController";
import { authenticateToken } from "../middlewares/auth.middleware";
const router = express.Router();
// Generate and send certificate via email
router.post("/generate", authenticateToken, generateAndSendCertificate);
// Get certificate status for a course and user
router.get("/status/:courseId/:userId", authenticateToken, getCertificateStatus);
// Download certificate (future implementation)
router.get("/download/:certificateId", authenticateToken, downloadCertificate);
export default router;
