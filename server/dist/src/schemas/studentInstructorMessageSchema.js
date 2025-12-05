import mongoose from "mongoose";
import { MessageStatus } from "../types/studentInstructorMessage.types";
const studentInstructorMessageSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: Object.values(MessageStatus),
        default: MessageStatus.SENT,
    },
    isStudentMessage: {
        type: Boolean,
        required: true,
    },
    parentMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentInstructorMessage",
        default: null,
    },
    attachments: [
        {
            filename: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
            size: {
                type: Number,
                required: true,
            },
            mimeType: {
                type: String,
                required: true,
            },
        },
    ],
    readAt: {
        type: Date,
        default: null,
    },
    resolvedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});
// Indexes for better query performance
studentInstructorMessageSchema.index({ student: 1, instructor: 1 });
studentInstructorMessageSchema.index({ course: 1 });
studentInstructorMessageSchema.index({ instructor: 1, status: 1 });
studentInstructorMessageSchema.index({ createdAt: -1 });
studentInstructorMessageSchema.index({ parentMessage: 1 });
export default studentInstructorMessageSchema;
