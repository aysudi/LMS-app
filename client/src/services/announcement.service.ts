import type {
  CreateAnnouncementData,
  UpdateAnnouncementData,
  GetAnnouncementsQuery,
  AnnouncementStatsResponse,
  AnnouncementResponse,
  AnnouncementListResponse,
} from "../types/announcement.type";
import { api } from "./api";

class AnnouncementService {
  // Get all announcements with filtering and pagination
  async getAllAnnouncements(
    params?: GetAnnouncementsQuery
  ): Promise<AnnouncementListResponse> {
    const { data } = await api.get("api/announcements", { params });
    return data;
  }

  // Get announcements for a specific course
  async getAnnouncementsByCourse(
    courseId: string,
    params?: GetAnnouncementsQuery
  ): Promise<AnnouncementListResponse> {
    const { data } = await api.get(`api/announcements/course/${courseId}`, {
      params,
    });
    return data;
  }

  // Get announcements created by instructor
  async getAnnouncementsByInstructor(
    params?: GetAnnouncementsQuery
  ): Promise<AnnouncementListResponse> {
    const { data } = await api.get(`api/announcements/instructor/my`, {
      params,
    });
    return data;
  }

  // Get single announcement by ID
  async getAnnouncementById(id: string): Promise<AnnouncementResponse> {
    const { data } = await api.get(`api/announcements/${id}`);
    return data;
  }

  // Create new announcement
  async createAnnouncement(
    announcementData: CreateAnnouncementData
  ): Promise<AnnouncementResponse> {
    const { data } = await api.post("api/announcements", announcementData);
    return data;
  }

  // Update announcement
  async updateAnnouncement(
    id: string,
    announcementData: UpdateAnnouncementData
  ): Promise<AnnouncementResponse> {
    const { data } = await api.put(`api/announcements/${id}`, announcementData);
    return data;
  }

  // Delete announcement
  async deleteAnnouncement(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`api/announcements/${id}`);
    return data;
  }

  // Mark announcement as read
  async markAnnouncementAsRead(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post(`api/announcements/${id}/read`);
    return data;
  }

  // Get announcement statistics for instructor
  async getAnnouncementStats(
    courseId?: string
  ): Promise<AnnouncementStatsResponse> {
    const params = courseId ? { courseId } : {};
    const { data } = await api.get(`api/announcements/instructor/stats`, {
      params,
    });
    return data;
  }
}

export const announcementService = new AnnouncementService();
