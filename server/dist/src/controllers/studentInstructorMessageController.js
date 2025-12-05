import StudentInstructorMessage from "../models/StudentInstructorMessage";
import Enrollment from "../models/Enrollment";
import Course from "../models/Course";
import { MessageStatus } from "../types/studentInstructorMessage.types";
import mongoose from "mongoose";
// Send a message to instructor
export const sendMessageToInstructor = async (req, res) => {
    try {
        const { instructor: instructorId, course: courseId, subject, content, attachments, } = req.body;
        const studentId = req.user?.userId;
        if (!studentId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        // Verify enrollment
        const enrollment = await Enrollment.findOne({
            user: studentId,
            course: courseId,
            status: "active",
        });
        if (!enrollment) {
            return res.status(403).json({
                error: "You must be enrolled in this course to message the instructor",
            });
        }
        // Verify instructor owns the course
        const course = await Course.findById(courseId);
        if (!course || course.instructor.toString() !== instructorId) {
            return res.status(400).json({
                error: "Invalid instructor for this course",
            });
        }
        const message = new StudentInstructorMessage({
            student: studentId,
            instructor: instructorId,
            course: courseId,
            subject,
            content,
            isStudentMessage: true,
            attachments: attachments || [],
        });
        await message.save();
        // Populate message with user and course info
        const populatedMessage = await StudentInstructorMessage.findById(message._id)
            .populate("student", "firstName lastName email avatar")
            .populate("instructor", "firstName lastName email avatar")
            .populate("course", "title image.url");
        res.status(201).json({
            success: true,
            message: populatedMessage,
        });
    }
    catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Failed to send message" });
    }
};
// Reply to a message
export const replyToMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content, attachments } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        // Find the parent message
        const parentMessage = await StudentInstructorMessage.findById(messageId);
        if (!parentMessage) {
            return res.status(404).json({ error: "Message not found" });
        }
        // Check if user is either the student or instructor in the conversation
        const isStudent = parentMessage.student.toString() === userId;
        const isInstructor = parentMessage.instructor.toString() === userId;
        if (!isStudent && !isInstructor) {
            return res.status(403).json({
                error: "You don't have permission to reply to this message",
            });
        }
        const reply = new StudentInstructorMessage({
            student: parentMessage.student,
            instructor: parentMessage.instructor,
            course: parentMessage.course,
            subject: `Re: ${parentMessage.subject}`,
            content,
            isStudentMessage: isStudent,
            parentMessage: messageId,
            attachments: attachments || [],
        });
        await reply.save();
        // Populate reply with user and course info
        const populatedReply = await StudentInstructorMessage.findById(reply._id)
            .populate("student", "firstName lastName email avatar")
            .populate("instructor", "firstName lastName email avatar")
            .populate("course", "title image.url")
            .populate("parentMessage");
        res.status(201).json({
            success: true,
            message: populatedReply,
        });
    }
    catch (error) {
        console.error("Error replying to message:", error);
        res.status(500).json({ error: "Failed to send reply" });
    }
};
// Get conversations for a student
export const getStudentConversations = async (req, res) => {
    try {
        const studentId = req.user?.userId;
        if (!studentId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const conversations = await StudentInstructorMessage.aggregate([
            {
                $match: {
                    student: new mongoose.Types.ObjectId(studentId),
                    parentMessage: null, // Only root messages
                },
            },
            {
                $lookup: {
                    from: "studentinstructormessages",
                    localField: "_id",
                    foreignField: "parentMessage",
                    as: "replies",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "instructor",
                    foreignField: "_id",
                    as: "instructorInfo",
                },
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "course",
                    foreignField: "_id",
                    as: "courseInfo",
                },
            },
            {
                $addFields: {
                    replyCount: { $size: "$replies" },
                    lastReply: { $max: "$replies.createdAt" },
                    lastActivity: {
                        $max: ["$createdAt", { $ifNull: ["$lastReply", "$createdAt"] }],
                    },
                },
            },
            {
                $sort: { lastActivity: -1 },
            },
            {
                $project: {
                    subject: 1,
                    content: 1,
                    status: 1,
                    createdAt: 1,
                    readAt: 1,
                    resolvedAt: 1,
                    replyCount: 1,
                    lastActivity: 1,
                    instructor: { $arrayElemAt: ["$instructorInfo", 0] },
                    course: { $arrayElemAt: ["$courseInfo", 0] },
                },
            },
        ]);
        res.json({
            success: true,
            conversations,
        });
    }
    catch (error) {
        console.error("Error getting student conversations:", error);
        res.status(500).json({ error: "Failed to get conversations" });
    }
};
// Get conversations for an instructor
export const getInstructorConversations = async (req, res) => {
    try {
        const instructorId = req.user?.userId;
        if (!instructorId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const conversations = await StudentInstructorMessage.aggregate([
            {
                $match: {
                    instructor: new mongoose.Types.ObjectId(instructorId),
                    parentMessage: null,
                },
            },
            {
                $lookup: {
                    from: "studentinstructormessages",
                    localField: "_id",
                    foreignField: "parentMessage",
                    as: "replies",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "student",
                    foreignField: "_id",
                    as: "studentInfo",
                },
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "course",
                    foreignField: "_id",
                    as: "courseInfo",
                },
            },
            {
                $addFields: {
                    replyCount: { $size: "$replies" },
                    lastReply: { $max: "$replies.createdAt" },
                    lastActivity: {
                        $max: ["$createdAt", { $ifNull: ["$lastReply", "$createdAt"] }],
                    },
                    unreadCount: {
                        $size: {
                            $filter: {
                                input: "$replies",
                                cond: {
                                    $and: [
                                        { $eq: ["$$this.isStudentMessage", true] },
                                        { $eq: ["$$this.readAt", null] },
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            {
                $sort: { lastActivity: -1 },
            },
            {
                $project: {
                    subject: 1,
                    content: 1,
                    status: 1,
                    createdAt: 1,
                    readAt: 1,
                    resolvedAt: 1,
                    replyCount: 1,
                    lastActivity: 1,
                    unreadCount: 1,
                    student: { $arrayElemAt: ["$studentInfo", 0] },
                    course: { $arrayElemAt: ["$courseInfo", 0] },
                },
            },
        ]);
        res.json({
            success: true,
            conversations,
        });
    }
    catch (error) {
        console.error("Error getting instructor conversations:", error);
        res.status(500).json({ error: "Failed to get conversations" });
    }
};
// Get full conversation thread
export const getConversationThread = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        // Find the root message
        const rootMessage = await StudentInstructorMessage.findById(messageId)
            .populate("student", "firstName lastName email avatar")
            .populate("instructor", "firstName lastName email avatar")
            .populate("course", "title image.url");
        if (!rootMessage) {
            return res.status(404).json({ error: "Message not found" });
        }
        // Check if user has access to this conversation
        const hasAccess = rootMessage.student._id.toString() === userId ||
            rootMessage.instructor._id.toString() === userId;
        if (!hasAccess) {
            return res.status(403).json({
                error: "You don't have permission to view this conversation",
            });
        }
        // Get all replies
        const replies = await StudentInstructorMessage.find({
            parentMessage: messageId,
        })
            .populate("student", "firstName lastName email avatar")
            .populate("instructor", "firstName lastName email avatar")
            .sort({ createdAt: 1 });
        res.json({
            success: true,
            conversation: {
                rootMessage,
                replies,
            },
        });
    }
    catch (error) {
        console.error("Error getting conversation thread:", error);
        res.status(500).json({ error: "Failed to get conversation" });
    }
};
// Mark message as read
export const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const message = await StudentInstructorMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }
        // Check if user can mark as read (must be the recipient)
        const canMarkAsRead = (message.isStudentMessage && message.instructor.toString() === userId) ||
            (!message.isStudentMessage && message.student.toString() === userId);
        if (!canMarkAsRead) {
            return res.status(403).json({
                error: "You can only mark messages addressed to you as read",
            });
        }
        message.readAt = new Date();
        await message.save();
        res.json({
            success: true,
            message: "Message marked as read",
        });
    }
    catch (error) {
        console.error("Error marking message as read:", error);
        res.status(500).json({ error: "Failed to mark message as read" });
    }
};
// Mark conversation as resolved
export const markConversationAsResolved = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const message = await StudentInstructorMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }
        // Only instructor can mark as resolved
        if (message.instructor.toString() !== userId) {
            return res.status(403).json({
                error: "Only the instructor can mark conversations as resolved",
            });
        }
        message.status = MessageStatus.RESOLVED;
        message.resolvedAt = new Date();
        await message.save();
        // Also mark all replies as resolved
        await StudentInstructorMessage.updateMany({ parentMessage: messageId }, {
            status: MessageStatus.RESOLVED,
            resolvedAt: new Date(),
        });
        res.json({
            success: true,
            message: "Conversation marked as resolved",
        });
    }
    catch (error) {
        console.error("Error marking conversation as resolved:", error);
        res.status(500).json({ error: "Failed to mark conversation as resolved" });
    }
};
// Get instructors for enrolled courses
export const getEnrolledInstructors = async (req, res) => {
    try {
        const studentId = req.user?.userId;
        if (!studentId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const enrollments = await Enrollment.find({
            user: studentId,
        })
            .populate({
            path: "course",
            populate: {
                path: "instructor",
                select: "firstName lastName email avatar",
            },
        })
            .select("course");
        const instructors = enrollments.map((enrollment) => ({
            instructor: enrollment.course.instructor,
            course: {
                _id: enrollment.course._id,
                title: enrollment.course.title,
                thumbnail: enrollment.course.image.url,
            },
        }));
        // Remove duplicates based on instructor ID
        const uniqueInstructors = instructors.filter((item, index, self) => index ===
            self.findIndex((t) => t.instructor._id.toString() === item.instructor._id.toString()));
        res.json({
            success: true,
            instructors: uniqueInstructors,
        });
    }
    catch (error) {
        console.error("Error getting enrolled instructors:", error);
        res.status(500).json({ error: "Failed to get instructors" });
    }
};
