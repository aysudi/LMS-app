import mongoose, { Document } from "mongoose";

export interface ILesson extends Document {
  title: string;
  description?: string;
  video: {
    url: string;
    publicId: string;
  };
  duration: number; // in seconds
  order: number;
  isPreview: boolean;
  course: mongoose.Types.ObjectId;
  section: mongoose.Types.ObjectId;
  resources: {
    name: string;
    url: string;
    publicId: string;
    type: "pdf" | "zip" | "doc" | "other";
  }[];
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLessonData {
  title: string;
  description?: string;
  duration: number;
  order?: number;
  isPreview?: boolean;
  video?: {
    url: string;
    publicId: string;
  };
  resources?: {
    name: string;
    url: string;
    publicId: string;
    type?: "pdf" | "zip" | "doc" | "other";
  }[];
  quiz?: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  uploadedFiles?: {
    video?: {
      url: string;
      publicId: string;
    };
    resources?: Array<{
      url: string;
      publicId: string;
      name: string;
    }>;
  };
}

export interface UpdateLessonData {
  title?: string;
  description?: string;
  video?: {
    url: string;
    publicId: string;
  };
  duration?: number;
  order?: number;
  isPreview?: boolean;
  resources?: {
    name: string;
    url: string;
    publicId: string;
    type?: "pdf" | "zip" | "doc" | "other";
  }[];
  quiz?: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  uploadedFiles?: {
    video?: {
      url: string;
      publicId: string;
    };
    resources?: Array<{
      url: string;
      publicId: string;
      name: string;
    }>;
  };
}

export interface LessonQuery {
  courseId: string;
  sectionId?: string;
  includePreview?: boolean;
}

export interface LessonResponse {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration: number;
  order: number;
  isPreview: boolean;
  course: string;
  section: string;
  resources: {
    name: string;
    url: string;
    type: "pdf" | "zip" | "doc" | "other";
  }[];
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
