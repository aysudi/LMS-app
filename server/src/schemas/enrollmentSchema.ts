import mongoose from "mongoose";
import { EnrollmentStatus } from "../types/enrollment.types";

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
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
      required: false, // Optional for free courses
    },
    status: {
      type: String,
      enum: Object.values(EnrollmentStatus),
      default: EnrollmentStatus.ACTIVE,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateIssuedAt: {
      type: Date,
    },
    certificateId: {
      type: String,
      sparse: true,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalWatchTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastAccessedAt: {
      type: Date,
    },
    currentLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    bookmarkedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    notes: [
      {
        lesson: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Lesson",
        },
        content: {
          type: String,
          required: true,
          maxlength: 1000,
        },
        timestamp: {
          type: Number, // Video timestamp in seconds
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reviews: [
      {
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: true,
          maxlength: 500,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundRequested: {
      type: Boolean,
      default: false,
    },
    refundRequestedAt: {
      type: Date,
    },
    refundReason: {
      type: String,
      maxlength: 500,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ user: 1, status: 1 });
enrollmentSchema.index({ course: 1, status: 1 });
enrollmentSchema.index({ user: 1, lastAccessedAt: -1 });
enrollmentSchema.index({ user: 1, progressPercentage: -1 });

enrollmentSchema.virtual("isCompleted").get(function () {
  return (
    this.progressPercentage === 100 &&
    this.status === EnrollmentStatus.COMPLETED
  );
});

enrollmentSchema.virtual("isInProgress").get(function () {
  return (
    this.progressPercentage > 0 &&
    this.progressPercentage < 100 &&
    this.status === EnrollmentStatus.ACTIVE
  );
});

enrollmentSchema.methods.updateProgress = async function (
  completedLessonsCount: number,
  totalLessonsCount: number
) {
  const wasCompleted = this.progressPercentage === 100;

  this.progressPercentage = Math.round(
    (completedLessonsCount / totalLessonsCount) * 100
  );

  if (
    this.progressPercentage === 100 &&
    this.status === EnrollmentStatus.ACTIVE &&
    !wasCompleted
  ) {
    this.status = EnrollmentStatus.COMPLETED;
    this.completedAt = new Date();

    // Track course completion for analytics
    try {
      const { trackCourseCompletion } = await import(
        "../services/analyticsService.js"
      );
      await trackCourseCompletion(this.course.toString(), this.user.toString());
    } catch (error) {
      console.error("Error tracking course completion:", error);
      // Don't fail the update if analytics fails
    }
  }

  this.lastAccessedAt = new Date();
  return this.save();
};

enrollmentSchema.methods.recalculateProgress = async function () {
  const UserProgress = mongoose.model("UserProgress");
  const Course = mongoose.model("Course");

  // Get course to know total lessons
  const course = await Course.findById(this.course);
  if (!course) return this;

  // Get completed lessons count from UserProgress
  const completedCount = await UserProgress.countDocuments({
    user: this.user,
    course: this.course,
    completed: true,
  });

  // Get all user progress for this course to update completedLessons array
  const allProgress = await UserProgress.find({
    user: this.user,
    course: this.course,
    completed: true,
  });

  // Update completedLessons array
  this.completedLessons = allProgress.map((p) => p.lesson);

  // Calculate and update progress
  return this.updateProgress(completedCount, course.totalLessons || 0);
};

enrollmentSchema.methods.addNote = function (
  lessonId: string,
  content: string,
  timestamp: number
) {
  this.notes.push({
    lesson: lessonId,
    content: content.trim(),
    timestamp,
    createdAt: new Date(),
  });
  return this.save();
};

enrollmentSchema.methods.toggleBookmark = function (lessonId: string) {
  const bookmarkIndex = this.bookmarkedLessons.indexOf(lessonId);

  if (bookmarkIndex > -1) {
    this.bookmarkedLessons.splice(bookmarkIndex, 1);
  } else {
    this.bookmarkedLessons.push(lessonId);
  }

  return this.save();
};

enrollmentSchema.methods.addReview = async function (
  rating: number,
  comment: string
) {
  // Add review to enrollment reviews array
  this.reviews.push({
    rating: rating,
    comment: comment.trim(),
    createdAt: new Date(),
  });

  // Recalculate enrollment average rating
  this.calculateAverageRating();

  // Save enrollment first
  await this.save();

  // Also add review to course reviews array
  const Course = mongoose.model("Course");
  const course = await Course.findById(this.course);

  if (course) {
    // Add new review to course (each enrollment can add multiple reviews)
    const reviewData = {
      user: this.user,
      rating: rating,
      comment: comment.trim(),
      date: new Date(),
    };

    course.reviews.push(reviewData);

    // Recalculate course rating
    course.calculateAverageRating();
    await course.save();
  }

  return this;
};

// Method to calculate average rating for enrollment
enrollmentSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
    return;
  }

  const sum = this.reviews.reduce(
    (acc: number, review: any) => acc + review.rating,
    0
  );
  this.averageRating = Number((sum / this.reviews.length).toFixed(1));
  this.totalRatings = this.reviews.length;
};

enrollmentSchema.set("toJSON", { virtuals: true });
enrollmentSchema.set("toObject", { virtuals: true });

export default enrollmentSchema;
