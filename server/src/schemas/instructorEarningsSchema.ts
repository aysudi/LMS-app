import mongoose from "mongoose";

const instructorEarningsSchema = new mongoose.Schema(
  {
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
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    grossAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFee: {
      type: Number,
      required: true,
      min: 0,
    },
    instructorShare: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
      uppercase: true,
    },
    payoutStatus: {
      type: String,
      enum: ["pending", "processed", "paid", "failed"],
      default: "pending",
    },
    payoutDate: {
      type: Date,
    },
    transactionId: {
      type: String,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

instructorEarningsSchema.index({ instructor: 1, year: -1, month: -1 });
instructorEarningsSchema.index({ course: 1, createdAt: -1 });
instructorEarningsSchema.index({ payoutStatus: 1 });

export default instructorEarningsSchema;
