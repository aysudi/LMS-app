import Course from "../models/Course";
import Enrollment from "../models/Enrollment";
import InstructorEarnings from "../models/InstructorEarnings";
import InstructorAnalytics from "../models/InstructorAnalytics";
import UserProgress from "../models/UserProgress";
import mongoose from "mongoose";
// Get instructor dashboard overview
export const getInstructorOverviewService = async (instructorId) => {
    const courses = await Course.find({
        instructor: instructorId,
        isPublished: true,
    });
    const courseIds = courses.map((course) => course._id);
    const totalStudents = await Enrollment.countDocuments({
        course: { $in: courseIds },
        status: "active",
    });
    const earnings = await InstructorEarnings.aggregate([
        { $match: { instructor: new mongoose.Types.ObjectId(instructorId) } },
        { $group: { _id: null, total: { $sum: "$instructorShare" } } },
    ]);
    const totalRevenue = earnings[0]?.total || 0;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const monthlyEarnings = await InstructorEarnings.aggregate([
        {
            $match: {
                instructor: new mongoose.Types.ObjectId(instructorId),
                month: currentMonth,
                year: currentYear,
            },
        },
        { $group: { _id: null, total: { $sum: "$instructorShare" } } },
    ]);
    const monthlyRevenue = monthlyEarnings[0]?.total || 0;
    const completions = await Enrollment.countDocuments({
        course: { $in: courseIds },
        status: "completed",
    });
    const avgRatingData = await Course.aggregate([
        {
            $match: {
                instructor: new mongoose.Types.ObjectId(instructorId),
                isPublished: true,
            },
        },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);
    const averageRating = avgRatingData[0]?.avgRating || 0;
    // Get recent enrollments (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentEnrollments = await Enrollment.countDocuments({
        course: { $in: courseIds },
        createdAt: { $gte: sevenDaysAgo },
    });
    // Get performance metrics for last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const performanceData = await InstructorAnalytics.aggregate([
        {
            $match: {
                instructor: new mongoose.Types.ObjectId(instructorId),
                date: { $gte: thirtyDaysAgo },
            },
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$courseViews" },
                totalEnrollments: { $sum: "$newEnrollments" },
                totalWatchTime: { $sum: "$totalWatchTime" },
                totalCompletions: { $sum: "$completions" },
            },
        },
    ]);
    const performance = performanceData[0] || {
        totalViews: 0,
        totalEnrollments: 0,
        totalWatchTime: 0,
        totalCompletions: 0,
    };
    // Calculate conversion rate: (enrollments / views) * 100
    const conversionRate = performance.totalViews > 0
        ? (performance.totalEnrollments / performance.totalViews) * 100
        : 0;
    return {
        overview: {
            totalCourses: courses.length,
            totalStudents,
            totalRevenue,
            monthlyRevenue,
            completions,
            averageRating: Number(averageRating.toFixed(1)),
            recentEnrollments,
        },
        performance: {
            views: performance.totalViews,
            enrollments: performance.totalEnrollments,
            watchTime: Math.round(performance.totalWatchTime / 3600), // Convert to hours
            conversionRate: Number(conversionRate.toFixed(1)),
        },
        courses: courses.map((course) => ({
            _id: course._id,
            title: course.title,
            studentsCount: course.studentsEnrolled?.length || 0,
            rating: course.rating,
            isPublished: course.isPublished,
        })),
    };
};
// Get instructor courses with detailed stats
export const getInstructorCoursesWithStatsService = async (instructorId, queryParams = {}) => {
    const { page = 1, limit = 10, status = "all", search, category, level, minPrice, maxPrice, minRating, sortBy = "createdAt", sortOrder = "desc", } = queryParams;
    const skip = (page - 1) * limit;
    let filter = { instructor: instructorId };
    if (status === "published") {
        filter.isPublished = true;
        filter.status = { $ne: "rejected" };
    }
    else if (status === "draft") {
        filter.$and = [
            { isPublished: false },
            { $or: [{ status: { $exists: false } }, { status: "draft" }] },
        ];
    }
    else if (status === "pending") {
        filter.status = "pending";
    }
    else if (status === "rejected") {
        filter.status = "rejected";
    }
    // If status is "all", no additional filtering needed
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { tags: { $in: [new RegExp(search, "i")] } },
        ];
    }
    if (category) {
        filter.category = { $regex: category, $options: "i" };
    }
    if (level) {
        filter.level = level;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.originalPrice = {};
        if (minPrice !== undefined)
            filter.originalPrice.$gte = minPrice;
        if (maxPrice !== undefined)
            filter.originalPrice.$lte = maxPrice;
    }
    if (minRating !== undefined) {
        filter.rating = { $gte: minRating };
    }
    let sort = {};
    switch (sortBy) {
        case "title":
            sort.title = sortOrder === "asc" ? 1 : -1;
            break;
        case "rating":
            sort.rating = sortOrder === "asc" ? 1 : -1;
            break;
        case "originalPrice":
            sort.originalPrice = sortOrder === "asc" ? 1 : -1;
            break;
        case "studentsCount":
            sort.studentsEnrolled = sortOrder === "asc" ? 1 : -1;
            break;
        default:
            sort.createdAt = sortOrder === "asc" ? 1 : -1;
    }
    const courses = await Course.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();
    const totalCourses = await Course.countDocuments(filter);
    const coursesWithStats = await Promise.all(courses.map(async (course) => {
        const enrollmentsCount = await Enrollment.countDocuments({
            course: course._id,
            status: "active",
        });
        const revenue = await InstructorEarnings.aggregate([
            {
                $match: {
                    instructor: new mongoose.Types.ObjectId(instructorId),
                    course: course._id,
                },
            },
            { $group: { _id: null, total: { $sum: "$instructorShare" } } },
        ]);
        const completions = await Enrollment.countDocuments({
            course: course._id,
            status: "completed",
        });
        const completionRate = enrollmentsCount > 0
            ? Math.round((completions / enrollmentsCount) * 100)
            : 0;
        return {
            ...course,
            stats: {
                enrollments: enrollmentsCount,
                revenue: revenue[0]?.total || 0,
                completionRate,
                completions,
            },
        };
    }));
    return {
        courses: coursesWithStats,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalCourses / limit),
            totalCourses,
            hasNext: page * limit < totalCourses,
            hasPrev: page > 1,
        },
    };
};
// Get instructor students for a specific course
export const getCourseStudentsService = async (instructorId, courseId, page = 1, limit = 20) => {
    const course = await Course.findOne({
        _id: courseId,
        instructor: instructorId,
    });
    if (!course) {
        throw new Error("Course not found or access denied");
    }
    const skip = (page - 1) * limit;
    const enrollments = await Enrollment.find({ course: courseId })
        .populate("user", "firstName lastName email avatar createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const totalStudents = await Enrollment.countDocuments({ course: courseId });
    const studentsWithStats = await Promise.all(enrollments.map(async (enrollment) => {
        const progress = await UserProgress.find({
            user: enrollment.user,
            course: courseId,
        });
        const completedLessons = progress.filter((p) => p.completed).length;
        const totalWatchTime = progress.reduce((sum, p) => sum + (p.watchTime || 0), 0);
        return {
            enrollment: {
                _id: enrollment._id,
                enrolledAt: enrollment.enrolledAt,
                progressPercentage: enrollment.progressPercentage,
                status: enrollment.status,
                lastAccessedAt: enrollment.lastAccessedAt,
            },
            student: enrollment.user,
            progress: {
                completedLessons,
                totalWatchTime: Math.round(totalWatchTime / 60), // Convert to minutes
                progressPercentage: enrollment.progressPercentage,
            },
        };
    }));
    return {
        course: {
            _id: course._id,
            title: course.title,
            totalLessons: course.totalLessons,
        },
        students: studentsWithStats,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalStudents / limit),
            totalStudents,
            hasNext: page * limit < totalStudents,
            hasPrev: page > 1,
        },
    };
};
