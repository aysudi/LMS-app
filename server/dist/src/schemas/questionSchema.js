import mongoose from "mongoose";
const questionSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
        index: true,
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
        index: true, // Optional: specific lesson
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000,
    },
    tags: [
        {
            type: String,
            trim: true,
            lowercase: true,
        },
    ],
    acceptedAnswer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Answer",
        default: undefined, // undefined means no accepted answer yet
    },
    upvotes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    downvotes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    answersCount: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Virtual field: is this question answered?
questionSchema.virtual("isAnswered").get(function () {
    return this.acceptedAnswer !== undefined && this.acceptedAnswer !== null;
});
// Virtual field: vote score
questionSchema.virtual("voteScore").get(function () {
    return this.upvotes.length - this.downvotes.length;
});
// Method: check if user has voted
questionSchema.methods.getUserVoteType = function (userId) {
    if (this.upvotes.includes(userId))
        return "upvote";
    if (this.downvotes.includes(userId))
        return "downvote";
    return null;
};
// Indexes for better query performance
questionSchema.index({ course: 1, createdAt: -1 });
questionSchema.index({ lesson: 1, createdAt: -1 });
questionSchema.index({ user: 1, createdAt: -1 });
questionSchema.index({ title: "text", content: "text" }); // Text search
questionSchema.index({ tags: 1 });
export default questionSchema;
