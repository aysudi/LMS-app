import express from "express";
import { submitApplication, getMyApplication, getAllApplications, approveApplication, rejectApplication, } from "../controllers/instructorApplicationController";
import { authenticateToken } from "../middlewares/auth.middleware";
const instructorApplicationRouter = express.Router();
// Student routes
instructorApplicationRouter.post("/", authenticateToken, (req, res) => submitApplication(req, res));
instructorApplicationRouter.get("/my-application", authenticateToken, (req, res) => getMyApplication(req, res));
// Admin routes
instructorApplicationRouter.get("/admin/all", authenticateToken, (req, res) => getAllApplications(req, res));
instructorApplicationRouter.patch("/admin/:applicationId/approve", authenticateToken, (req, res) => approveApplication(req, res));
instructorApplicationRouter.patch("/admin/:applicationId/reject", authenticateToken, (req, res) => rejectApplication(req, res));
export default instructorApplicationRouter;
