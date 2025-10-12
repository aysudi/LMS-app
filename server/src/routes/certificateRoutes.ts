import express from "express";
import {
  generateAndSendCertificate,
  downloadCertificate,
} from "../controllers/certificateController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

// Generate and send certificate via email
router.post("/generate", authenticateToken, generateAndSendCertificate);

// Download certificate (future implementation)
router.get("/download/:certificateId", authenticateToken, downloadCertificate);

export default router;
