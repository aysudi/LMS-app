export interface Announcement {
  id: string;
  title: string;
  content: string;
  course: string;
  instructor: string;
  isPublished: boolean;
  publishedAt: string;
  priority: "low" | "medium" | "high" | "urgent";
  targetAudience: "all" | "enrolled" | "completed";
  readBy: Array<{
    user: string;
    readAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  priority?: "low" | "medium" | "high" | "urgent";
  targetAudience?: "all" | "enrolled" | "completed";
  isPublished?: boolean;
}

export interface UpdateAnnouncementData extends Partial<CreateAnnouncementData> {
  id: string;
}

export interface AnnouncementResponse {
  success: boolean;
  data: Announcement;
  message?: string;
}

export interface AnnouncementListResponse {
  success: boolean;
  data: Announcement[];
}
