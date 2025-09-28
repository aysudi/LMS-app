import type {
  CourseProgressResponse,
  LearningAnalyticsResponse,
  UpdateUserProgressRequest,
  UpdateUserProgressResponse,
  UserProgressResponse,
} from "../types/user-progress.type";
import { api } from "./api";

class UserProgressService {
  async getUserProgress(courseId?: string): Promise<UserProgressResponse> {
    const params = courseId ? `?courseId=${courseId}` : "";
    const response = await api.get(`/api/user-progress${params}`);
    return response.data;
  }

  async getCourseProgress(courseId: string): Promise<CourseProgressResponse> {
    const response = await api.get(`/api/user-progress/course/${courseId}`);
    return response.data;
  }

  async updateLessonProgress(
    courseId: string,
    progressData: UpdateUserProgressRequest
  ): Promise<UpdateUserProgressResponse> {
    const response = await api.patch(
      `/api/user-progress/course/${courseId}`,
      progressData
    );
    return response.data;
  }

  async getLearningAnalytics(): Promise<LearningAnalyticsResponse> {
    const response = await api.get("/api/user-progress/analytics");
    return response.data;
  }
}

export default new UserProgressService();
