import { Request, Response } from "express";
import { AuthRequest } from "../types/common.types";
import {
  getAllAnnouncementsService,
  getAnnouncementsByCourseService,
  getAnnouncementsByInstructorService,
  getAnnouncementByIdService,
  createAnnouncementService,
  updateAnnouncementService,
  deleteAnnouncementService,
  markAnnouncementAsReadService,
  getAnnouncementStatsService,
} from "../services/announcementService";
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AnnouncementQuery,
} from "../types/announcement.types";

// Get all announcements (admin only)
export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    const query: AnnouncementQuery = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      course: req.query.course as string,
      instructor: req.query.instructor as string,
      priority: req.query.priority as any,
      targetAudience: req.query.targetAudience as any,
      isPublished: req.query.isPublished
        ? req.query.isPublished === "true"
        : undefined,
      search: req.query.search as string,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as "asc" | "desc",
    };

    const result = await getAllAnnouncementsService(query);

    res.status(200).json({
      success: true,
      data: {
        announcements: result.announcements,
        pagination: result.pagination,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching announcements",
      error: error.message,
    });
  }
};

// Get announcements by course ID
export const getAnnouncementsByCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const query: AnnouncementQuery = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      priority: req.query.priority as any,
      targetAudience: req.query.targetAudience as any,
      isPublished: req.query.isPublished
        ? req.query.isPublished === "true"
        : undefined,
      search: req.query.search as string,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as "asc" | "desc",
    };

    const result = await getAnnouncementsByCourseService(courseId, query);

    res.status(200).json({
      success: true,
      data: {
        announcements: result.announcements,
        pagination: result.pagination,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching course announcements",
      error: error.message,
    });
  }
};

// Get announcements by instructor ID (for instructor dashboard)
export const getAnnouncementsByInstructor = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const instructorId = req.user!.userId;
    const query: AnnouncementQuery = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      course: req.query.course as string,
      priority: req.query.priority as any,
      targetAudience: req.query.targetAudience as any,
      isPublished: req.query.isPublished
        ? req.query.isPublished === "true"
        : undefined,
      search: req.query.search as string,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as "asc" | "desc",
    };

    const result = await getAnnouncementsByInstructorService(
      instructorId,
      query
    );

    res.status(200).json({
      success: true,
      data: {
        announcements: result.announcements,
        pagination: result.pagination,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching instructor announcements",
      error: error.message,
    });
  }
};

// Get single announcement by ID
export const getAnnouncementById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const announcement = await getAnnouncementByIdService(id);

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new announcement (instructor only)
export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user!.userId;
    const announcementData: CreateAnnouncementDto = req.body;

    const announcement = await createAnnouncementService(
      announcementData,
      instructorId
    );

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: announcement,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Error creating announcement",
      error: error.message,
    });
  }
};

// Update announcement (instructor only)
export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user!.userId;
    const { id } = req.params;
    const updateData: UpdateAnnouncementDto = req.body;

    const announcement = await updateAnnouncementService(
      id,
      updateData,
      instructorId
    );

    res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      data: announcement,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Error updating announcement",
      error: error.message,
    });
  }
};

// Delete announcement (instructor only)
export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user!.userId;
    const { id } = req.params;

    await deleteAnnouncementService(id, instructorId);

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Error deleting announcement",
      error: error.message,
    });
  }
};

// Mark announcement as read (student only)
export const markAnnouncementAsRead = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const announcement = await markAnnouncementAsReadService(id, userId);

    res.status(200).json({
      success: true,
      message: "Announcement marked as read",
      data: announcement,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Error marking announcement as read",
      error: error.message,
    });
  }
};

// Get announcement statistics (instructor only)
export const getAnnouncementStats = async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user!.userId;
    const stats = await getAnnouncementStatsService(instructorId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching announcement statistics",
      error: error.message,
    });
  }
};
