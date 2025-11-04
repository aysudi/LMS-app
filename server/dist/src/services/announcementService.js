import Announcement from "../models/Announcement";
import Course from "../models/Course";
import formatMongoData from "../utils/formatMongoData";
// Get all announcements with pagination and filtering
export const getAllAnnouncementsService = async (query) => {
    const { page = 1, limit = 10, course, instructor, priority, targetAudience, isPublished, search, sortBy = "createdAt", sortOrder = "desc", } = query;
    // Build filter object
    const filter = {};
    if (course)
        filter.course = course;
    if (instructor)
        filter.instructor = instructor;
    if (priority)
        filter.priority = priority;
    if (targetAudience)
        filter.targetAudience = targetAudience;
    if (isPublished !== undefined)
        filter.isPublished = isPublished;
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } },
        ];
    }
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;
    const [announcements, total] = await Promise.all([
        Announcement.find(filter)
            .populate("instructor", "firstName lastName email avatar")
            .populate("course", "title thumbnail")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Announcement.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        announcements: formatMongoData(announcements),
        pagination: {
            currentPage: page,
            totalPages,
            totalAnnouncements: total,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};
// Get announcements by course ID
export const getAnnouncementsByCourseService = async (courseId, query) => {
    const courseQuery = { ...query, course: courseId };
    return getAllAnnouncementsService(courseQuery);
};
// Get announcements by instructor ID
export const getAnnouncementsByInstructorService = async (instructorId, query) => {
    const instructorQuery = { ...query, instructor: instructorId };
    return getAllAnnouncementsService(instructorQuery);
};
// Get single announcement by ID
export const getAnnouncementByIdService = async (announcementId) => {
    const announcement = await Announcement.findById(announcementId)
        .populate("instructor", "firstName lastName email avatar")
        .populate("course", "title thumbnail")
        .lean();
    if (!announcement) {
        throw new Error("Announcement not found");
    }
    return formatMongoData(announcement);
};
// Create new announcement
export const createAnnouncementService = async (announcementData, instructorId) => {
    // Verify that the course exists and belongs to the instructor
    const course = await Course.findOne({
        _id: announcementData.course,
        instructor: instructorId,
    });
    if (!course) {
        throw new Error("Course not found or you don't have permission to create announcements for this course");
    }
    const announcementPayload = {
        ...announcementData,
        instructor: instructorId,
        publishedAt: announcementData.isPublished !== false ? new Date() : undefined,
    };
    const announcement = new Announcement(announcementPayload);
    await announcement.save();
    return formatMongoData(await announcement.populate("instructor", "firstName lastName email avatar"));
};
// Update announcement
export const updateAnnouncementService = async (announcementId, updateData, instructorId) => {
    // Find announcement and verify ownership
    const announcement = await Announcement.findOne({
        _id: announcementId,
        instructor: instructorId,
    });
    if (!announcement) {
        throw new Error("Announcement not found or you don't have permission to update it");
    }
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(announcementId, updateData, { new: true, runValidators: true })
        .populate("instructor", "firstName lastName email avatar")
        .populate("course", "title thumbnail")
        .lean();
    if (!updatedAnnouncement) {
        throw new Error("Failed to update announcement");
    }
    return formatMongoData(updatedAnnouncement);
};
// Delete announcement
export const deleteAnnouncementService = async (announcementId, instructorId) => {
    const announcement = await Announcement.findOne({
        _id: announcementId,
        instructor: instructorId,
    });
    if (!announcement) {
        throw new Error("Announcement not found or you don't have permission to delete it");
    }
    await Announcement.findByIdAndDelete(announcementId);
};
// Mark announcement as read
export const markAnnouncementAsReadService = async (announcementId, userId) => {
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
        throw new Error("Announcement not found");
    }
    // Check if user already marked as read
    const alreadyRead = announcement.readBy.some((read) => read.user && read.user.toString() === userId);
    if (!alreadyRead) {
        announcement.readBy.push({
            user: userId,
            readAt: new Date(),
        });
        await announcement.save();
    }
    const populatedAnnouncement = await Announcement.findById(announcementId)
        .populate("instructor", "firstName lastName email avatar")
        .populate("course", "title thumbnail")
        .lean();
    return formatMongoData(populatedAnnouncement);
};
// Get announcement statistics for instructor
export const getAnnouncementStatsService = async (instructorId) => {
    const stats = await Announcement.aggregate([
        { $match: { instructor: instructorId } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                published: {
                    $sum: { $cond: [{ $eq: ["$isPublished", true] }, 1, 0] },
                },
                draft: {
                    $sum: { $cond: [{ $eq: ["$isPublished", false] }, 1, 0] },
                },
                highPriority: {
                    $sum: { $cond: [{ $in: ["$priority", ["high", "urgent"]] }, 1, 0] },
                },
                totalReads: { $sum: { $size: "$readBy" } },
            },
        },
    ]);
    const priorityStats = await Announcement.aggregate([
        { $match: { instructor: instructorId } },
        {
            $group: {
                _id: "$priority",
                count: { $sum: 1 },
            },
        },
    ]);
    const audienceStats = await Announcement.aggregate([
        { $match: { instructor: instructorId } },
        {
            $group: {
                _id: "$targetAudience",
                count: { $sum: 1 },
            },
        },
    ]);
    return {
        overall: stats[0] || {
            total: 0,
            published: 0,
            draft: 0,
            highPriority: 0,
            totalReads: 0,
        },
        byPriority: priorityStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
        }, {}),
        byAudience: audienceStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
        }, {}),
    };
};
