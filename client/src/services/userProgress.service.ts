import { api } from "./api";

export interface UserProgress {
  _id: string;
  user: string;
  course: any;
  lesson: any;
  completed: boolean;
  completedAt?: string;
  watchTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProgressResponse {
  success: boolean;
  data?: UserProgress[];
  message?: string;
}

export interface UpdateUserProgressRequest {
  lessonId: string;
  completed?: boolean;
  watchTime?: number;
}

export interface UpdateUserProgressResponse {
  success: boolean;
  data?: {
    userProgress: UserProgress;
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

class UserProgressService {
  async getUserProgress(courseId?: string): Promise<UserProgressResponse> {
    const params = courseId ? `?courseId=${courseId}` : "";
    const response = await api.get(`/user-progress${params}`);
    return response.data;
  }

  async getCourseProgress(courseId: string): Promise<CourseProgressResponse> {
    const response = await api.get(`/user-progress/course/${courseId}`);
    return response.data;
  }

  async updateLessonProgress(
    courseId: string,
    progressData: UpdateUserProgressRequest
  ): Promise<UpdateUserProgressResponse> {
    const response = await api.patch(
      `/user-progress/course/${courseId}`,
      progressData
    );
    return response.data;
  }

  async getLearningAnalytics(): Promise<LearningAnalyticsResponse> {
    const response = await api.get("/user-progress/analytics");
    return response.data;
  }
}

export default new UserProgressService();
