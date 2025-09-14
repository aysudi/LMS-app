import mongoose, { Document } from "mongoose";
import { ILesson } from "./lesson.types";

export interface ISection extends Document {
  title: string;
  description?: string;
  order: number;
  course: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // Virtual fields
  lessons?: ILesson[]; // Virtual field populated from Lesson collection
  lessonCount?: number; // Virtual field for lesson count
}

export interface CreateSectionData {
  title: string;
  description?: string;
  order?: number;
  course: string;
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
  lessons?: ILesson[];
  lessonCount?: number;
}
