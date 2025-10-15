import mongoose from "mongoose";
const answerSchema = new mongoose.Schema({
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
        index: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000,
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
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            // Ensure isAccepted is included in JSON output
            if (doc._isAccepted !== undefined) {
                ret.isAccepted = doc._isAccepted;
            }
            return ret;
        },
    },
    toObject: { virtuals: true },
});
// Virtual field: vote score
answerSchema.virtual("voteScore").get(function () {
    return this.upvotes.length - this.downvotes.length;
});
// Virtual field: isAccepted (will be set by service layer)
answerSchema.virtual("isAccepted").get(function () {
    // This will be overridden by the service layer
    // Default to false if not set
    return this._isAccepted || false;
});
answerSchema.virtual("isAccepted").set(function (value) {
    this._isAccepted = value;
});
// Method: check if user has voted
answerSchema.methods.getUserVoteType = function (userId) {
    if (this.upvotes.includes(userId))
        return "upvote";
    if (this.downvotes.includes(userId))
        return "downvote";
    return null;
};
// Middleware: Update question's answersCount when answer is created/deleted
answerSchema.post("save", async function () {
    const Question = mongoose.model("Question");
    const count = await mongoose.model("Answer").countDocuments({
        question: this.question,
    });
    await Question.findByIdAndUpdate(this.question, {
        answersCount: count,
    });
});
answerSchema.post("deleteOne", { document: true, query: false }, async function () {
    const Question = mongoose.model("Question");
    const count = await mongoose.model("Answer").countDocuments({
        question: this.question,
    });
    await Question.findByIdAndUpdate(this.question, {
        answersCount: count,
    });
});
answerSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        const Question = mongoose.model("Question");
        const count = await mongoose.model("Answer").countDocuments({
            question: doc.question,
        });
        await Question.findByIdAndUpdate(doc.question, {
            answersCount: count,
        });
    }
});
// Indexes for better performance
answerSchema.index({ question: 1, createdAt: -1 });
answerSchema.index({ user: 1, createdAt: -1 });
export default answerSchema;
