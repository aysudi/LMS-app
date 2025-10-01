import { Response } from "express";
import { AuthRequest } from "../types/common.types.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Order from "../models/Order.js";
import UserProgress from "../models/UserProgress.js";
import InstructorEarnings from "../models/InstructorEarnings.js";
import InstructorAnalytics from "../models/InstructorAnalytics.js";

// Get instructor dashboard overview
export const getInstructorOverview = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const instructorId = req.user?.id;

    if (!instructorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get instructor's courses
    const courses = await Course.find({
      instructor: instructorId,
      isPublished: true,
    });

    const courseIds = courses.map((course) => course._id);

    // Get total students
    const totalStudents = await Enrollment.countDocuments({
      course: { $in: courseIds },
      status: "active",
    });

    // Get total revenue
    const earnings = await InstructorEarnings.aggregate([
      { $match: { instructor: instructorId } },
      { $group: { _id: null, total: { $sum: "$instructorShare" } } },
    ]);

    const totalRevenue = earnings[0]?.total || 0;

    // Get monthly revenue
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const monthlyEarnings = await InstructorEarnings.aggregate([
      {
        $match: {
          instructor: instructorId,
          month: currentMonth,
          year: currentYear,
        },
      },
      { $group: { _id: null, total: { $sum: "$instructorShare" } } },
    ]);

    const monthlyRevenue = monthlyEarnings[0]?.total || 0;

    // Get course completions
    const completions = await Enrollment.countDocuments({
      course: { $in: courseIds },
      status: "completed",
    });

    // Get average rating
    const avgRatingData = await Course.aggregate([
      { $match: { instructor: instructorId, isPublished: true } },
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
          instructor: instructorId,
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$courseViews" },
          totalEnrollments: { $sum: "$newEnrollments" },
          totalWatchTime: { $sum: "$totalWatchTime" },
          avgConversion: { $avg: "$conversionRate" },
        },
      },
    ]);

    const performance = performanceData[0] || {
      totalViews: 0,
      totalEnrollments: 0,
      totalWatchTime: 0,
      avgConversion: 0,
    };

    res.json({
      success: true,
      data: {
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
          conversionRate: Number(performance.avgConversion.toFixed(1)),
        },
        courses: courses.map((course) => ({
          _id: course._id,
          title: course.title,
          studentsCount: course.studentsEnrolled?.length || 0,
          rating: course.rating,
          isPublished: course.isPublished,
        })),
      },
    });
  } catch (error: any) {
    console.error("Get instructor overview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get instructor overview",
    });
  }
};

// Get instructor courses with detailed stats
export const getInstructorCoursesWithStats = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const instructorId = req.user?.id;
    const { page = 1, limit = 10, status = "all" } = req.query;

    if (!instructorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    let filter: any = { instructor: instructorId };
    if (status === "published") filter.isPublished = true;
    if (status === "draft") filter.isPublished = false;

    const courses = await Course.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const totalCourses = await Course.countDocuments(filter);

    // Get detailed stats for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        // Get enrollments count
        const enrollmentsCount = await Enrollment.countDocuments({
          course: course._id,
          status: "active",
        });

        // Get revenue for this course
        const revenue = await InstructorEarnings.aggregate([
          { $match: { instructor: instructorId, course: course._id } },
          { $group: { _id: null, total: { $sum: "$instructorShare" } } },
        ]);

        // Get completion rate
        const completions = await Enrollment.countDocuments({
          course: course._id,
          status: "completed",
        });

        const completionRate =
          enrollmentsCount > 0
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
      })
    );

    res.json({
      success: true,
      data: {
        courses: coursesWithStats,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalCourses / Number(limit)),
          totalCourses,
          hasNext: Number(page) * Number(limit) < totalCourses,
          hasPrev: Number(page) > 1,
        },
      },
    });
  } catch (error: any) {
    console.error("Get instructor courses with stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get instructor courses",
    });
  }
};

// Get instructor students for a specific course
export const getCourseStudents = async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user?.id;
    const { courseId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!instructorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Verify course ownership
    const course = await Course.findOne({
      _id: courseId,
      instructor: instructorId,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or access denied",
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Get enrollments with student details
    const enrollments = await Enrollment.find({ course: courseId })
      .populate("user", "firstName lastName email avatar createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalStudents = await Enrollment.countDocuments({ course: courseId });

    // Get additional stats for each student
    const studentsWithStats = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Get user progress
        const progress = await UserProgress.find({
          user: enrollment.user,
          course: courseId,
        });

        const completedLessons = progress.filter((p) => p.completed).length;
        const totalWatchTime = progress.reduce(
          (sum, p) => sum + (p.watchTime || 0),
          0
        );

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
      })
    );

    res.json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title,
          totalLessons: course.totalLessons,
        },
        students: studentsWithStats,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalStudents / Number(limit)),
          totalStudents,
          hasNext: Number(page) * Number(limit) < totalStudents,
          hasPrev: Number(page) > 1,
        },
      },
    });
  } catch (error: any) {
    console.error("Get course students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get course students",
    });
  }
};

export default {
  getInstructorOverview,
  getInstructorCoursesWithStats,
  getCourseStudents,
};
