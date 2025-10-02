import mongoose, { Schema, Document } from "mongoose";

export interface IAnswer extends Document {
  _id: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;

  // Virtual properties
  voteScore: number;
  isAccepted: boolean;

  // Methods
  getUserVoteType(userId: string): "upvote" | "downvote" | null;
}

const answerSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field: vote score
answerSchema.virtual("voteScore").get(function () {
  return this.upvotes.length - this.downvotes.length;
});

// Virtual field: is this the accepted answer?
answerSchema.virtual("isAccepted").get(function () {
  // This will be populated when we fetch with question data
  return false; // Will be set dynamically
});

// Method: check if user has voted
answerSchema.methods.getUserVoteType = function (userId: string) {
  if (this.upvotes.includes(userId)) return "upvote";
  if (this.downvotes.includes(userId)) return "downvote";
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

answerSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    const Question = mongoose.model("Question");
    const count = await mongoose.model("Answer").countDocuments({
      question: this.question,
    });

    await Question.findByIdAndUpdate(this.question, {
      answersCount: count,
    });
  }
);

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
