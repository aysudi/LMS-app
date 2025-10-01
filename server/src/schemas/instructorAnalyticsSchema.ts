import mongoose from "mongoose";

const instructorAnalyticsSchema = new mongoose.Schema(
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
    // Daily metrics
    date: {
      type: Date,
      required: true,
    },
    newEnrollments: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    completions: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWatchTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    newReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    refunds: {
      type: Number,
      default: 0,
      min: 0,
    },
    courseViews: {
      type: Number,
      default: 0,
      min: 0,
    },
    conversionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

instructorAnalyticsSchema.index({ instructor: 1, date: -1 });
instructorAnalyticsSchema.index({ course: 1, date: -1 });
instructorAnalyticsSchema.index(
  { instructor: 1, course: 1, date: -1 },
  { unique: true }
);

export default instructorAnalyticsSchema;
