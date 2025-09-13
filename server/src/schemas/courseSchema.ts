import mongoose, { Schema, Document } from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    studentsEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    image: {
      type: String,
      default: "",
    },
    videoPromo: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    language: {
      type: String,
      default: "English",
    },
    learningObjectives: [
      {
        type: String,
        trim: true,
      },
    ],
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    targetAudience: [
      {
        type: String,
        trim: true,
      },
    ],
    totalDuration: {
      type: Number,
      default: 0, // will be calculated
    },
    totalLessons: {
      type: Number,
      default: 0, // will be calculated
    },
    certificateProvided: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: true,
          trim: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Method to calculate average rating
courseSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.ratingsCount = 0;
    return;
  }

  const sum = this.reviews.reduce(
    (acc: number, review: any) => acc + review.rating,
    0
  );
  this.rating = Number((sum / this.reviews.length).toFixed(1));
  this.ratingsCount = this.reviews.length;
};

// Indexes for better performance
courseSchema.index({ title: "text", description: "text", tags: "text" });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ rating: -1 });
courseSchema.index({ createdAt: -1 });

export default courseSchema;
