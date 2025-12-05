import { authenticateToken } from "./../middlewares/auth.middleware";
import express from "express";
import { sendMessageToInstructor, replyToMessage, getStudentConversations, getInstructorConversations, getConversationThread, markMessageAsRead, markConversationAsResolved, getEnrolledInstructors, } from "../controllers/studentInstructorMessageController";
const router = express.Router();
router.use(authenticateToken);
// Student routes
router.get("/enrolled-instructors", getEnrolledInstructors);
router.post("/send", sendMessageToInstructor);
router.get("/student/conversations", getStudentConversations);
// Instructor routes
router.get("/instructor/conversations", getInstructorConversations);
// Shared routes (both student and instructor)
router.post("/:messageId/reply", replyToMessage);
router.get("/:messageId/thread", getConversationThread);
router.patch("/:messageId/read", markMessageAsRead);
router.patch("/:messageId/resolve", markConversationAsResolved);
export default router;
