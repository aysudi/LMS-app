import mongoose, { Schema, Document } from "mongoose";

export interface IInstructorApplication extends Document {
  user: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio: string;
  expertise: string[];
  experience: string;
  education: string;
  motivation: string;
  sampleCourseTitle?: string;
  sampleCourseDescription?: string;
  portfolio?: string;
  linkedIn?: string;
  website?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  adminFeedback?: string;
  rejectionReason?: string;
}

const instructorApplicationSchema = new Schema<IInstructorApplication>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One application per user
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      required: true,
      maxlength: 500,
    },
    expertise: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return v && v.length > 0 && v.length <= 10;
        },
        message: "Please select 1-10 areas of expertise",
      },
    },
    experience: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    education: {
      type: String,
      required: true,
      maxlength: 500,
    },
    motivation: {
      type: String,
      required: true,
      maxlength: 500,
    },
    sampleCourseTitle: {
      type: String,
      maxlength: 100,
    },
    sampleCourseDescription: {
      type: String,
      maxlength: 500,
    },
    portfolio: {
      type: String,
      trim: true,
    },
    linkedIn: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    adminFeedback: {
      type: String,
      maxlength: 1000,
    },
    rejectionReason: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

instructorApplicationSchema.index({ status: 1 });
instructorApplicationSchema.index({ submittedAt: -1 });

const InstructorApplication = mongoose.model<IInstructorApplication>(
  "InstructorApplication",
  instructorApplicationSchema
);

export default InstructorApplication;
