// Instructor Dashboard Overview Types
export interface InstructorOverview {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  monthlyRevenue: number;
  completions: number;
  averageRating: number;
  recentEnrollments: number;
}

export interface InstructorPerformance {
  views: number;
  enrollments: number;
  watchTime: number; // in hours
  conversionRate: number;
}

export interface InstructorCourseOverview {
  _id: string;
  title: string;
  studentsCount: number;
  rating: number;
  isPublished: boolean;
}

export interface InstructorOverviewResponse {
  success: boolean;
  data: {
    overview: InstructorOverview;
    performance: InstructorPerformance;
    courses: InstructorCourseOverview[];
  };
  message?: string;
}

// Instructor Courses with Stats Types
export interface InstructorCourseWithStats {
  _id: string;
  title: string;
  description: string;
  image: string;
  isPublished: boolean;
  createdAt: string;
  enrollmentsCount: number;
  revenue: number;
  averageRating: number;
  totalLessons: number;
  totalDuration: number;
  category: string;
  level: string;
}

export interface InstructorCoursesResponse {
  success: boolean;
  data: {
    courses: InstructorCourseWithStats[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCourses: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
}

export interface InstructorCoursesQuery {
  page?: number;
  limit?: number;
  status?: "all" | "published" | "draft";
}

// Course Students Types
export interface CourseStudent {
  enrollment: {
    _id: string;
    enrolledAt: string;
    progressPercentage: number;
    status: string;
    lastAccessedAt?: string;
  };
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  progress: {
    completedLessons: number;
    totalWatchTime: number; // in minutes
    progressPercentage: number;
  };
}

export interface CourseStudentsResponse {
  success: boolean;
  data: {
    course: {
      _id: string;
      title: string;
      totalLessons: number;
    };
    students: CourseStudent[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalStudents: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
}

// Communication Types
export const MessageType = {
  QUESTION: "question",
  SUPPORT: "support",
  FEEDBACK: "feedback",
  GENERAL: "general",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const MessageStatus = {
  UNREAD: "unread",
  READ: "read",
  REPLIED: "replied",
  RESOLVED: "resolved",
} as const;

export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];

export interface InstructorMessage {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  course: {
    _id: string;
    title: string;
  };
  lesson?: {
    _id: string;
    title: string;
  };
  type: MessageType;
  status: MessageStatus;
  subject: string;
  message: string;
  reply?: string;
  createdAt: string;
  updatedAt: string;
  repliedAt?: string;
}

export interface InstructorMessagesResponse {
  success: boolean;
  data: {
    messages: InstructorMessage[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalMessages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
}

export interface InstructorMessagesQuery {
  page?: number;
  limit?: number;
  status?: "all" | "unread" | "read" | "replied" | "resolved";
  type?: "all" | "question" | "support" | "feedback" | "general";
  courseId?: string;
}

export interface ReplyToMessageData {
  message: string;
}

export interface MessageStatsResponse {
  success: boolean;
  data: {
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    recentMessages: number;
  };
  message?: string;
}

// Earnings Types
export interface InstructorEarnings {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingPayouts: number;
  completedPayouts: number;
  earningsThisMonth: number;
  earningsLastMonth: number;
  growthRate: number;
  topPerformingCourse: {
    courseId: string;
    title: string;
    earnings: number;
  };
}

export interface InstructorEarningsResponse {
  success: boolean;
  data: InstructorEarnings;
  message?: string;
}

export interface CourseEarning {
  _id: string;
  course: {
    _id: string;
    title: string;
  };
  order: {
    _id: string;
    orderNumber: string;
  };
  grossAmount: number;
  platformFee: number;
  instructorShare: number;
  payoutStatus: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  paidAt?: string;
}

export interface InstructorEarningsByCourseResponse {
  success: boolean;
  data: CourseEarning[];
  message?: string;
}

export interface UpdatePayoutStatusData {
  earningIds: string[];
  status: "pending" | "processing" | "completed" | "failed";
}

// Section Management Types (for instructor course creation)
export interface CreateSectionData {
  title: string;
  description?: string;
  course: string;
  order?: number;
}

export interface UpdateSectionData {
  title?: string;
  description?: string;
  order?: number;
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
  createdAt: string;
  updatedAt: string;
  lessonCount?: number;
}

// Lesson Management Types (for instructor course creation)
export interface CreateLessonData {
  title: string;
  description?: string;
  videoUrl: string;
  duration: number;
  order?: number;
  isPreview?: boolean;
  course: string;
  section: string;
  resources?: Array<{
    name: string;
    url: string;
    type?: "pdf" | "zip" | "doc" | "other";
  }>;
  quiz?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}

export interface UpdateLessonData {
  title?: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  order?: number;
  isPreview?: boolean;
  resources?: Array<{
    name: string;
    url: string;
    type?: "pdf" | "zip" | "doc" | "other";
  }>;
  quiz?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}

export interface LessonResponse {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration: number;
  order: number;
  isPreview: boolean;
  course: {
    _id: string;
    title: string;
  };
  section: {
    _id: string;
    title: string;
  };
  resources: Array<{
    name: string;
    url: string;
    type: "pdf" | "zip" | "doc" | "other";
  }>;
  quiz: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface InstructorApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Query Types
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface InstructorAnalytics {
  totalViews: number;
  totalEnrollments: number;
  conversionRate: number;
  averageWatchTime: number;
  topPerformingCourse: {
    courseId: string;
    title: string;
    enrollments: number;
  };
  recentActivity: Array<{
    type: "enrollment" | "completion" | "message";
    data: any;
    timestamp: string;
  }>;
}
