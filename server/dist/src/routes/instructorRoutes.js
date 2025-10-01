import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { getInstructorOverview, getInstructorCoursesWithStats, getCourseStudents, } from "../controllers/instructorController";
import { getInstructorMessages, replyToMessage, markMessageAsRead, markMessageAsResolved, getMessageStats, } from "../controllers/instructorCommunicationController";
const instructorRouter = Router();
// Dashboard & Overview
instructorRouter.get("/overview", authenticateToken, (req, res) => getInstructorOverview(req, res));
// Course Management
instructorRouter.get("/courses", authenticateToken, (req, res) => getInstructorCoursesWithStats(req, res));
instructorRouter.get("/courses/:courseId/students", authenticateToken, (req, res) => getCourseStudents(req, res));
// Communication
instructorRouter.get("/messages", authenticateToken, (req, res) => getInstructorMessages(req, res));
instructorRouter.post("/messages/:messageId/reply", authenticateToken, (req, res) => replyToMessage(req, res));
instructorRouter.patch("/messages/:messageId/read", authenticateToken, (req, res) => markMessageAsRead(req, res));
instructorRouter.patch("/messages/:messageId/resolve", authenticateToken, (req, res) => markMessageAsResolved(req, res));
instructorRouter.get("/messages/stats", authenticateToken, (req, res) => getMessageStats(req, res));
export default instructorRouter;
