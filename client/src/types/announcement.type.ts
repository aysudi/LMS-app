// Base announcement interface
export interface Announcement {
  _id: string;
  id: string;
  title: string;
  content: string;
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
  };
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  isPublished: boolean;
  publishedAt?: Date;
  priority: "low" | "medium" | "high" | "urgent";
  targetAudience: "all" | "enrolled" | "completed";
  readBy: Array<{
    user: string;
    readAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for creating announcements
export interface CreateAnnouncementData {
  title: string;
  content: string;
  course: string;
  priority?: "low" | "medium" | "high" | "urgent";
  targetAudience?: "all" | "enrolled" | "completed";
  isPublished?: boolean;
}

// DTO for updating announcements
export interface UpdateAnnouncementData {
  title?: string;
  content?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  targetAudience?: "all" | "enrolled" | "completed";
  isPublished?: boolean;
}

// Query parameters for getting announcements
export interface GetAnnouncementsQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  course?: string;
  instructor?: string;
  priority?: string;
  targetAudience?: string;
  isPublished?: boolean;
}

// API response types
export interface AnnouncementResponse {
  success: boolean;
  message: string;
  data: Announcement;
}

export interface AnnouncementListResponse {
  success: boolean;
  message: string;
  data: {
    announcements: Announcement[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalAnnouncements: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface AnnouncementStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalAnnouncements: number;
    publishedAnnouncements: number;
    draftAnnouncements: number;
    announcementsByCourse: Array<{
      course: {
        _id: string;
        title: string;
      };
      count: number;
    }>;
    announcementsByPriority: Array<{
      priority: string;
      count: number;
    }>;
    recentAnnouncements: Announcement[];
  };
}

// Form validation types
export interface AnnouncementFormData {
  title: string;
  content: string;
  course: string;
  priority: "low" | "medium" | "high" | "urgent";
  targetAudience: "all" | "enrolled" | "completed";
  isPublished: boolean;
}

// Hook return types
export interface UseAnnouncementsReturn {
  announcements: Announcement[];
  isLoading: boolean;
  error: Error | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UseAnnouncementMutationsReturn {
  createAnnouncement: {
    mutate: (data: CreateAnnouncementData) => void;
    isLoading: boolean;
    error: Error | null;
  };
  updateAnnouncement: {
    mutate: (data: { id: string; data: UpdateAnnouncementData }) => void;
    isLoading: boolean;
    error: Error | null;
  };
  deleteAnnouncement: {
    mutate: (id: string) => void;
    isLoading: boolean;
    error: Error | null;
  };
  markAsRead: {
    mutate: (id: string) => void;
    isLoading: boolean;
    error: Error | null;
  };
}
