import mongoose from "mongoose";

export interface ICourse extends Document {
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  instructor: mongoose.Types.ObjectId;
  price: number;
  discountPrice?: number;
  rating: number;
  ratingsCount: number;
  studentsEnrolled: mongoose.Types.ObjectId[];
  image: string;
  videoPromo?: string;
  tags: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  language: string;
  sections: any[]; // Will be typed by the schema
  learningObjectives: string[];
  requirements: string[];
  targetAudience: string[];
  totalDuration: number;
  totalLessons: number;
  certificateProvided: boolean;
  isPublished: boolean;
  publishedAt?: Date;
  lastUpdated: Date;
  reviews: {
    user: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    date: Date;
  }[];
  progress: {
    user: mongoose.Types.ObjectId;
    completedLessons: mongoose.Types.ObjectId[];
    progressPercentage: number;
    lastAccessedLesson?: mongoose.Types.ObjectId;
    enrollmentDate: Date;
  }[];
  calculateAverageRating(): void;
}

export interface CourseQuery {
  page?: number;
  limit?: number;
  category?: string;
  level?: string;
  search?: string;
  instructor?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "rating" | "price" | "createdAt" | "studentsCount";
  sortOrder?: "asc" | "desc";
}

export interface CreateCourseData {
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  instructor: string;
  price: number;
  discountPrice?: number;
  image?: string;
  videoPromo?: string;
  tags?: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  language?: string;
  learningObjectives?: string[];
  requirements?: string[];
  targetAudience?: string[];
  certificateProvided?: boolean;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  isPublished?: boolean;
}
