import mongoose from "mongoose";
const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    description: {
        type: String,
        trim: true,
    },
    videoUrl: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
        min: 0, // duration in seconds
    },
    order: {
        type: Number,
        required: true,
    },
    isPreview: {
        type: Boolean,
        default: false,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
        required: true,
    },
    resources: [
        {
            name: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                enum: ["pdf", "zip", "doc", "other"],
                default: "other",
            },
        },
    ],
    quiz: [
        {
            question: {
                type: String,
                required: true,
            },
            options: [String],
            correctAnswer: {
                type: Number,
                required: true,
            },
        },
    ],
}, {
    versionKey: false,
    timestamps: true,
});
lessonSchema.index({ course: 1, section: 1, order: 1 });
lessonSchema.index({ section: 1, order: 1 });
export default lessonSchema;
