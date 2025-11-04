import { getAllAnnouncementsService, getAnnouncementsByCourseService, getAnnouncementsByInstructorService, getAnnouncementByIdService, createAnnouncementService, updateAnnouncementService, deleteAnnouncementService, markAnnouncementAsReadService, getAnnouncementStatsService, } from "../services/announcementService";
// Get all announcements (admin only)
export const getAllAnnouncements = async (req, res) => {
    try {
        const query = {
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 10,
            course: req.query.course,
            instructor: req.query.instructor,
            priority: req.query.priority,
            targetAudience: req.query.targetAudience,
            isPublished: req.query.isPublished
                ? req.query.isPublished === "true"
                : undefined,
            search: req.query.search,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
        };
        const result = await getAllAnnouncementsService(query);
        res.status(200).json({
            success: true,
            data: {
                announcements: result.announcements,
                pagination: result.pagination,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching announcements",
            error: error.message,
        });
    }
};
// Get announcements by course ID
export const getAnnouncementsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const query = {
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 10,
            priority: req.query.priority,
            targetAudience: req.query.targetAudience,
            isPublished: req.query.isPublished
                ? req.query.isPublished === "true"
                : undefined,
            search: req.query.search,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
        };
        const result = await getAnnouncementsByCourseService(courseId, query);
        res.status(200).json({
            success: true,
            data: {
                announcements: result.announcements,
                pagination: result.pagination,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching course announcements",
            error: error.message,
        });
    }
};
// Get announcements by instructor ID (for instructor dashboard)
export const getAnnouncementsByInstructor = async (req, res) => {
    try {
        const instructorId = req.user.userId;
        const query = {
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 10,
            course: req.query.course,
            priority: req.query.priority,
            targetAudience: req.query.targetAudience,
            isPublished: req.query.isPublished
                ? req.query.isPublished === "true"
                : undefined,
            search: req.query.search,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
        };
        const result = await getAnnouncementsByInstructorService(instructorId, query);
        res.status(200).json({
            success: true,
            data: {
                announcements: result.announcements,
                pagination: result.pagination,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching instructor announcements",
            error: error.message,
        });
    }
};
// Get single announcement by ID
export const getAnnouncementById = async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await getAnnouncementByIdService(id);
        res.status(200).json({
            success: true,
            data: announcement,
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};
// Create new announcement (instructor only)
export const createAnnouncement = async (req, res) => {
    try {
        const instructorId = req.user.userId;
        const announcementData = req.body;
        const announcement = await createAnnouncementService(announcementData, instructorId);
        res.status(201).json({
            success: true,
            message: "Announcement created successfully",
            data: announcement,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: "Error creating announcement",
            error: error.message,
        });
    }
};
// Update announcement (instructor only)
export const updateAnnouncement = async (req, res) => {
    try {
        const instructorId = req.user.userId;
        const { id } = req.params;
        const updateData = req.body;
        const announcement = await updateAnnouncementService(id, updateData, instructorId);
        res.status(200).json({
            success: true,
            message: "Announcement updated successfully",
            data: announcement,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: "Error updating announcement",
            error: error.message,
        });
    }
};
// Delete announcement (instructor only)
export const deleteAnnouncement = async (req, res) => {
    try {
        const instructorId = req.user.userId;
        const { id } = req.params;
        await deleteAnnouncementService(id, instructorId);
        res.status(200).json({
            success: true,
            message: "Announcement deleted successfully",
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: "Error deleting announcement",
            error: error.message,
        });
    }
};
// Mark announcement as read (student only)
export const markAnnouncementAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const announcement = await markAnnouncementAsReadService(id, userId);
        res.status(200).json({
            success: true,
            message: "Announcement marked as read",
            data: announcement,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: "Error marking announcement as read",
            error: error.message,
        });
    }
};
// Get announcement statistics (instructor only)
export const getAnnouncementStats = async (req, res) => {
    try {
        const instructorId = req.user.userId;
        const stats = await getAnnouncementStatsService(instructorId);
        res.status(200).json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching announcement statistics",
            error: error.message,
        });
    }
};
