export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "student" | "instructor" | "admin";
  status: "active" | "suspended" | "pending";
  createdAt: string;
  lastActive: string;
  avatar?: string;
  coursesEnrolled?: number;
  coursesCreated?: number;
  totalSpent?: number;
  totalEarned?: number;
  isBanned?: boolean;
  banReason?: string;
  bannedAt?: string;
  bannedBy?: string;
  banExpiresAt?: string;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdminUsersResponse {
  success: boolean;
  data: {
    users: AdminUser[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface AdminUserUpdateData {
  status?: "active" | "suspended" | "pending";
  role?: "student" | "instructor" | "admin";
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalInstructors: number;
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeStudents: number;
  completedCourses: number;
  certificatesIssued: number;
  revenueGrowth: number;
  userGrowth: number;
  courseGrowth: number;
}

export interface AdminCourse {
  id: string;
  title: string;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: "pending" | "approved" | "rejected" | "draft";
  studentsEnrolled: number;
  revenue: number;
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
  image?: string;
  category: string;
  level: string;
  price: number;
}

export interface AdminCoursesResponse {
  success: boolean;
  data: {
    courses: AdminCourse[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCourses: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface AdminAnalytics {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    byMonth: Array<{ month: string; revenue: number }>;
  };
  users: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    byMonth: Array<{ month: string; users: number }>;
  };
  courses: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    byCategory: Array<{ category: string; count: number }>;
  };
  enrollments: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    completionRate: number;
  };
}

export interface RecentActivity {
  id: string;
  type: "new_user" | "course_approval" | "course_submission" | "user_action";
  user: string;
  action: string;
  time: string;
  metadata?: any;
}

export interface AdminCertificate {
  id: string;
  certificateId: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  course: {
    id: string;
    title: string;
    category: string;
    instructor?: {
      name: string;
    };
  };
  issuedAt: string;
  completedAt: string;
  enrolledAt: string;
  progress: number;
  grade: string;
}

export interface AdminCertificatesStats {
  totalCertificates: number;
  issuedThisMonth: number;
  averageCompletionTime: number;
}

export interface AdminCertificatesResponse {
  success: boolean;
  data: {
    certificates: AdminCertificate[];
    stats: AdminCertificatesStats;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCertificates: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}
