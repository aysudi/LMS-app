import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
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
    video: {
      url: String,
      publicId: String,
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
        publicId: {
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
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

lessonSchema.index({ course: 1, section: 1, order: 1 });
lessonSchema.index({ section: 1, order: 1 });

// Hook to update course stats after saving a lesson
lessonSchema.post("save", async function () {
  try {
    const Course = mongoose.model("Course");
    const course = await Course.findById(this.course);
    if (course && course.recalculateStats) {
      await course.recalculateStats();
    }
  } catch (error) {
    console.error("Error updating course stats after lesson save:", error);
  }
});

// Hook to update course stats after removing a lesson
lessonSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    try {
      const Course = mongoose.model("Course");
      const course = await Course.findById(this.course);
      if (course && course.recalculateStats) {
        await course.recalculateStats();
      }
    } catch (error) {
      console.error(
        "Error updating course stats after lesson deletion:",
        error
      );
    }
  }
);

// Hook to update course stats after removing multiple lessons
lessonSchema.post("deleteMany", async function () {
  try {
    // This hook is triggered after deleteMany, but we don't have access to the documents
    // We'll need to handle this in the controller when we know which course was affected
  } catch (error) {
    console.error(
      "Error updating course stats after lesson deleteMany:",
      error
    );
  }
});

export default lessonSchema;
