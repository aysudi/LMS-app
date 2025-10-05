import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
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
    order: {
      type: Number,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    thumbnail: {
      url: String,
      publicId: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

sectionSchema.virtual("lessons", {
  ref: "Lesson",
  localField: "_id",
  foreignField: "section",
  options: { sort: { order: 1 } },
});

sectionSchema.virtual("lessonCount", {
  ref: "Lesson",
  localField: "_id",
  foreignField: "section",
  count: true,
});

sectionSchema.set("toObject", { virtuals: true });
sectionSchema.set("toJSON", { virtuals: true });

sectionSchema.index({ course: 1, order: 1 });

export default sectionSchema;
