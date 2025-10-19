export interface IAnnouncement {
  _id: string;
  title: string;
  content: string;
  course: string;
  instructor: string;
  isPublished: boolean;
  publishedAt: Date;
  priority: "low" | "medium" | "high" | "urgent";
  targetAudience: "all" | "enrolled" | "completed";
  readBy: Array<{
    user: string;
    readAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  course: string;
  priority?: "low" | "medium" | "high" | "urgent";
  targetAudience?: "all" | "enrolled" | "completed";
  isPublished?: boolean;
}

export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  targetAudience?: "all" | "enrolled" | "completed";
  isPublished?: boolean;
  publishedAt?: Date;
}

export interface AnnouncementQuery {
  page?: number;
  limit?: number;
  course?: string;
  instructor?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  targetAudience?: "all" | "enrolled" | "completed";
  isPublished?: boolean;
  search?: string;
  sortBy?: "createdAt" | "publishedAt" | "title" | "priority";
  sortOrder?: "asc" | "desc";
}

export interface AnnouncementResponse {
  success: boolean;
  data: IAnnouncement;
  message?: string;
}

export interface AnnouncementsResponse {
  success: boolean;
  data: IAnnouncement[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalAnnouncements: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  message?: string;
}
