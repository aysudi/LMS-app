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
    originalPrice: {
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
    isFree: {
      type: Boolean,
      required: true,
      default: false,
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
      required: true,
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

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

courseSchema.virtual("currentPrice").get(function () {
  if (this.isFree) return 0;
  if (this.discountPrice > 0 && this.discountPrice < this.originalPrice) {
    return this.discountPrice;
  }
  return this.originalPrice;
});

courseSchema.virtual("hasDiscount").get(function () {
  return this.discountPrice > 0 && this.discountPrice < this.originalPrice;
});

courseSchema.methods.calculateDiscountPercentage = function () {
  if (this.hasDiscount) {
    return Math.round(
      ((this.originalPrice - this.discountPrice) / this.originalPrice) * 100
    );
  }
  return 0;
};

courseSchema.virtual("sections", {
  ref: "Section",
  localField: "_id",
  foreignField: "course",
  options: { sort: { order: 1 } },
});

courseSchema.methods.recalculateStats = async function () {
  const Lesson = mongoose.model("Lesson");

  const lessons = await Lesson.find({ course: this._id });

  this.totalLessons = lessons.length;
  this.totalDuration = lessons.reduce(
    (total, lesson) => total + lesson.duration,
    0
  );

  await this.save();
  return this;
};

courseSchema.index({ title: "text", description: "text", tags: "text" });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ rating: -1 });
courseSchema.index({ createdAt: -1 });

export default courseSchema;
