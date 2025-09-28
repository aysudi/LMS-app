import type {
  AddNoteRequest,
  AddNoteResponse,
  AddReviewRequest,
  AddReviewResponse,
  EnrollmentDetailsResponse,
  EnrollmentListResponse,
  LearningStatsResponse,
  UpdateProgressRequest,
  UpdateProgressResponse,
} from "../types/enrollment.type";
import { api } from "./api";

class EnrollmentService {
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

    const response = await api.get(
      `/api/enrollments?${queryParams.toString()}`
    );
    return response.data;
  }

  async getEnrollmentById(
    enrollmentId: string
  ): Promise<EnrollmentDetailsResponse> {
    const response = await api.get(`/api/enrollments/${enrollmentId}`);
    return response.data;
  }

  async updateEnrollmentProgress(
    enrollmentId: string,
    progressData: UpdateProgressRequest
  ): Promise<UpdateProgressResponse> {
    const response = await api.patch(
      `/api/enrollments/${enrollmentId}/progress`,
      progressData
    );
    return response.data;
  }

  async addEnrollmentNote(
    enrollmentId: string,
    noteData: AddNoteRequest
  ): Promise<AddNoteResponse> {
    const response = await api.post(
      `/api/enrollments/${enrollmentId}/notes`,
      noteData
    );
    return response.data;
  }

  async toggleLessonBookmark(enrollmentId: string, lessonId: string) {
    const response = await api.patch(
      `/api/enrollments/${enrollmentId}/bookmark`,
      {
        lessonId,
      }
    );
    return response.data;
  }

  async addCourseReview(
    enrollmentId: string,
    reviewData: AddReviewRequest
  ): Promise<AddReviewResponse> {
    const response = await api.post(
      `/api/enrollments/${enrollmentId}/review`,
      reviewData
    );
    return response.data;
  }

  async getLearningStats(): Promise<LearningStatsResponse> {
    const response = await api.get("/api/enrollments/stats");
    return response.data;
  }
}

export default new EnrollmentService();
