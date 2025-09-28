import { api } from "./api";

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

class EnrollmentService {
  // Get user's enrollments
  async getUserEnrollments(
    params: {
      status?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {}
  ): Promise<EnrollmentListResponse> {
    const queryParams = new URLSearchParams();

    if (params.status) queryParams.append("status", params.status);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const response = await api.get(`/enrollments?${queryParams.toString()}`);
    return response.data;
  }

  // Get specific enrollment details
  async getEnrollmentById(
    enrollmentId: string
  ): Promise<EnrollmentDetailsResponse> {
    const response = await api.get(`/enrollments/${enrollmentId}`);
    return response.data;
  }

  // Update enrollment progress
  async updateEnrollmentProgress(
    enrollmentId: string,
    progressData: UpdateProgressRequest
  ): Promise<UpdateProgressResponse> {
    const response = await api.patch(
      `/enrollments/${enrollmentId}/progress`,
      progressData
    );
    return response.data;
  }

  // Add note to enrollment
  async addEnrollmentNote(
    enrollmentId: string,
    noteData: AddNoteRequest
  ): Promise<AddNoteResponse> {
    const response = await api.post(
      `/enrollments/${enrollmentId}/notes`,
      noteData
    );
    return response.data;
  }

  // Toggle lesson bookmark
  async toggleLessonBookmark(enrollmentId: string, lessonId: string) {
    const response = await api.patch(`/enrollments/${enrollmentId}/bookmark`, {
      lessonId,
    });
    return response.data;
  }

  // Add course review
  async addCourseReview(
    enrollmentId: string,
    reviewData: AddReviewRequest
  ): Promise<AddReviewResponse> {
    const response = await api.post(
      `/enrollments/${enrollmentId}/review`,
      reviewData
    );
    return response.data;
  }

  // Get learning statistics
  async getLearningStats(): Promise<LearningStatsResponse> {
    const response = await api.get("/enrollments/stats");
    return response.data;
  }
}

export default new EnrollmentService();
