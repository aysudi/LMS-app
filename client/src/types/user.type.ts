export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: "student" | "instructor" | "admin";
  bio: string;
  isEmailVerified: boolean;
  avatar?: string;
  avatarOrInitials: string;
  initials: string;
  fullName: string;
  skills: string[];
  socialLinks: {
    _id: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  wishlist?: string[];
  createdAt: string;
}

export interface GetUsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface GetUserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: "student" | "instructor" | "admin";
  search?: string;
}
