export interface Enrollment {
  _id: string;
  user: string;
  course: any;
  order: string;
  status: "active" | "completed" | "paused" | "cancelled" | "refunded";
  enrolledAt: string;
  startedAt?: string;
  completedAt?: string;
  certificateIssued: boolean;
  certificateIssuedAt?: string;
  certificateId?: string;
  progressPercentage: number;
  totalWatchTime: number;
  lastAccessedAt?: string;
  currentLesson?: any;
  completedLessons: string[];
  bookmarkedLessons: string[];
  notes: EnrollmentNote[];
  rating?: number;
  review?: string;
  reviewedAt?: string;
  refundRequested: boolean;
  refundRequestedAt?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
  isInProgress: boolean;
}

export interface EnrollmentNote {
  lesson: string;
  content: string;
  timestamp: number;
  createdAt: string;
}

export interface EnrollmentListResponse {
  success: boolean;
  data?: {
    enrollments: Enrollment[];
    total: number;
    page: number;
    totalPages: number;
  };
  message?: string;
}

export interface EnrollmentDetailsResponse {
  success: boolean;
  data?: Enrollment;
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
    enrollment: Enrollment;
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
    enrollment: Enrollment;
  };
  message?: string;
}

export interface AddReviewRequest {
  rating: number;
  review: string;
}

export interface AddReviewResponse {
  success: boolean;
  data?: Enrollment;
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
    recentActivity: Enrollment[];
  };
  message?: string;
}
