import mongoose from "mongoose";
const conversationSchema = new mongoose.Schema({
    participants: {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Student ID is required"],
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Instructor ID is required"],
        },
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "Course ID is required"],
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
conversationSchema.index({ "participants.student": 1, "participants.instructor": 1, courseId: 1 }, { unique: true });
conversationSchema.index({ "participants.student": 1 });
conversationSchema.index({ "participants.instructor": 1 });
conversationSchema.index({ courseId: 1 });
conversationSchema.index({ updatedAt: -1 });
export default conversationSchema;
