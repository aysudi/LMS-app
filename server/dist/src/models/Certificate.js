import mongoose, { Schema } from "mongoose";
const certificateSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    studentName: {
        type: String,
        required: true,
        trim: true,
    },
    courseName: {
        type: String,
        required: true,
        trim: true,
    },
    instructorName: {
        type: String,
        required: true,
        trim: true,
    },
    certificateId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    issuedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    emailSent: {
        type: Boolean,
        required: true,
        default: false,
    },
}, {
    timestamps: true,
});
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });
certificateSchema.index({ userId: 1 });
certificateSchema.index({ courseId: 1 });
const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
