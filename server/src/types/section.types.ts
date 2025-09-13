import mongoose, { Document } from "mongoose";

export interface ISection extends Document {
  title: string;
  description?: string;
  order: number;
  course: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSectionData {
  title: string;
  description?: string;
  order?: number;
  courseId: string;
}

export interface UpdateSectionData {
  title?: string;
  description?: string;
  order?: number;
}

export interface SectionWithLessonCount extends ISection {
  lessonCount: number;
}

export interface SectionQuery {
  courseId: string;
  includeLessonCount?: boolean;
}

export interface SectionResponse {
  _id: string;
  title: string;
  description?: string;
  order: number;
  course: {
    _id: string;
    title: string;
    instructor: string;
  };
  createdAt: Date;
  updatedAt: Date;
  lessonCount?: number;
}
