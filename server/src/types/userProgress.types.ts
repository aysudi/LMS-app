import { Document, Types } from "mongoose";

export interface IUserProgress extends Document {
  user: Types.ObjectId | string;
  course: Types.ObjectId | string;
  lesson: Types.ObjectId | string;
  completed: boolean;
  completedAt?: Date;
  watchTime: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgressResponse {
  success: boolean;
  data?: IUserProgress[];
  message?: string;
}

export interface UpdateUserProgressRequest {
  lesson: string;
  completed?: boolean;
  watchTime?: number;
}

export interface UpdateUserProgressResponse {
  success: boolean;
  data?: {
    userProgress: IUserProgress;
    enrollmentProgress: {
      progressPercentage: number;
      isCompleted: boolean;
    };
  };
  message?: string;
}

export interface CourseProgressResponse {
  success: boolean;
  data?: {
    courseId: string;
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    totalWatchTime: number;
    lessons: Array<{
      lessonId: string;
      completed: boolean;
      watchTime: number;
    }>;
  };
  message?: string;
}

export interface LearningAnalyticsResponse {
  success: boolean;
  data?: {
    totalWatchTime: number;
    totalLessonsCompleted: number;
    averageSessionTime: number;
    learningStreak: number;
    weeklyProgress: Array<{
      date: string;
      watchTime: number;
      lessonsCompleted: number;
    }>;
    topCategories: Array<{
      category: string;
      watchTime: number;
      coursesCount: number;
    }>;
  };
  message?: string;
}
