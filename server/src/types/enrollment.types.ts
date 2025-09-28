import { Document, Types } from "mongoose";

export enum EnrollmentStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  PAUSED = "paused",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export interface EnrollmentNote {
  lesson: Types.ObjectId | string;
  content: string;
  timestamp: number; // Video timestamp in seconds
  createdAt: Date;
}

export interface IEnrollment extends Document {
  user: Types.ObjectId | string;
  course: Types.ObjectId | string;
  order: Types.ObjectId | string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  certificateIssued: boolean;
  certificateIssuedAt?: Date;
  certificateId?: string;
  progressPercentage: number;
  totalWatchTime: number;
  lastAccessedAt?: Date;
  currentLesson?: Types.ObjectId | string;
  completedLessons: (Types.ObjectId | string)[];
  bookmarkedLessons: (Types.ObjectId | string)[];
  notes: EnrollmentNote[];
  rating?: number;
  review?: string;
  reviewedAt?: Date;
  refundRequested: boolean;
  refundRequestedAt?: Date;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;

  // Virtual fields
  isCompleted: boolean;
  isInProgress: boolean;

  // Methods
  updateProgress(
    completedLessonsCount: number,
    totalLessonsCount: number
  ): Promise<IEnrollment>;
  recalculateProgress(): Promise<IEnrollment>;
  addNote(
    lessonId: string,
    content: string,
    timestamp: number
  ): Promise<IEnrollment>;
  toggleBookmark(lessonId: string): Promise<IEnrollment>;
  addReview(rating: number, review: string): Promise<IEnrollment>;
}

// Request/Response types
export interface EnrollmentListResponse {
  success: boolean;
  data?: {
    enrollments: IEnrollment[];
    total: number;
    page: number;
    totalPages: number;
  };
  message?: string;
}

export interface EnrollmentDetailsResponse {
  success: boolean;
  data?: IEnrollment;
  message?: string;
}

export interface UpdateProgressRequest {
  lessonId: string;
  completed: boolean;
  watchTime?: number;
}

export interface UpdateProgressResponse {
  success: boolean;
  data?: {
    enrollment: IEnrollment;
    progressPercentage: number;
    isCompleted: boolean;
  };
  message?: string;
}

export interface AddNoteRequest {
  lessonId: string;
  content: string;
  timestamp: number;
}

export interface AddNoteResponse {
  success: boolean;
  data?: {
    note: EnrollmentNote;
    enrollment: IEnrollment;
  };
  message?: string;
}

export interface AddReviewRequest {
  rating: number;
  comment: string;
}

export interface AddReviewResponse {
  success: boolean;
  data?: IEnrollment;
  message?: string;
}

export interface LearningStatsResponse {
  success: boolean;
  data?: {
    totalEnrolledCourses: number;
    totalCompletedCourses: number;
    totalInProgressCourses: number;
    totalWatchTime: number;
    averageProgress: number;
    certificatesEarned: number;
    recentActivity: IEnrollment[];
  };
  message?: string;
}
