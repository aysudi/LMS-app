import { Router } from "express";
import { sendCourseMessage, getCourseMessages, markMessagesAsRead, getUnreadMessageCounts, deleteCourseMessage, editCourseMessage, } from "../controllers/courseMessageController.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import { body } from "express-validator";
import { param } from "express-validator";
const courseMessageRouter = Router();
// Validation schemas
const sendMessageValidation = [
    body("content")
        .trim()
        .notEmpty()
        .withMessage("Message content is required")
        .isLength({ max: 2000 })
        .withMessage("Message content cannot exceed 2000 characters"),
    body("course")
        .notEmpty()
        .withMessage("Course ID is required")
        .isMongoId()
        .withMessage("Invalid course ID"),
    body("messageType")
        .optional()
        .isIn(["text", "image", "file"])
        .withMessage("Invalid message type"),
];
const courseIdValidation = [
    param("courseId")
        .notEmpty()
        .withMessage("Course ID is required")
        .isMongoId()
        .withMessage("Invalid course ID"),
];
const messageIdValidation = [
    param("messageId")
        .notEmpty()
        .withMessage("Message ID is required")
        .isMongoId()
        .withMessage("Invalid message ID"),
];
// Send a message to course group chat
courseMessageRouter.post("/", authenticateToken, sendMessageValidation, validateRequest, sendCourseMessage);
// Get messages for a course
courseMessageRouter.get("/course/:courseId", authenticateToken, courseIdValidation, validateRequest, getCourseMessages);
// Mark messages as read for a course
courseMessageRouter.put("/course/:courseId/read", authenticateToken, courseIdValidation, validateRequest, markMessagesAsRead);
// Get unread message counts for all enrolled courses
courseMessageRouter.get("/unread-counts", authenticateToken, getUnreadMessageCounts);
// Edit a message
courseMessageRouter.put("/:messageId", authenticateToken, messageIdValidation, body("content")
    .trim()
    .notEmpty()
    .withMessage("Message content is required")
    .isLength({ max: 2000 })
    .withMessage("Message content cannot exceed 2000 characters"), validateRequest, editCourseMessage);
// Delete a message
courseMessageRouter.delete("/:messageId", authenticateToken, messageIdValidation, validateRequest, deleteCourseMessage);
export default courseMessageRouter;
