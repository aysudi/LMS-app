import { Response } from "express";
import { AuthRequest } from "../types/common.types";
import UserProgress from "../models/UserProgress";
import Enrollment from "../models/Enrollment";
import Course from "../models/Course";
import Section from "../models/Section";
import Lesson from "../models/Lesson";
import User from "../models/User";
import type {
  UserProgressResponse,
  UpdateUserProgressRequest,
  UpdateUserProgressResponse,
  CourseProgressResponse,
  LearningAnalyticsResponse,
} from "../types/userProgress.types";

// Get user progress for a specific course
export const getCourseProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get course and its sections with lessons
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Get all lessons from sections
    const sections = await Section.find({ course: courseId }).sort({
      order: 1,
    });
    const allLessons = [];

    for (const section of sections) {
      const lessons = await Lesson.find({ section: section._id }).sort({
        order: 1,
      });
      allLessons.push(...lessons);
    }

    // Get user progress for all lessons in the course
    const userProgresses = await UserProgress.find({
      user: userId,
      course: courseId,
      lesson: { $in: allLessons.map((lesson: any) => lesson._id) },
    });

    const completedLessons = userProgresses.filter(
      (progress) => progress.completed
    ).length;
    const totalLessons = allLessons.length;
    const progressPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;
    const totalWatchTime = userProgresses.reduce(
      (sum, progress) => sum + progress.watchTime,
      0
    );

    const lessonsProgress = allLessons.map((lesson: any) => {
      const progress = userProgresses.find(
        (p) => p.lesson.toString() === lesson._id.toString()
      );

      return {
        lessonId: lesson._id.toString(),
        completed: progress ? progress.completed : false,
        watchTime: progress ? progress.watchTime : 0,
      };
    });

    const response: CourseProgressResponse = {
      success: true,
      data: {
        courseId,
        totalLessons,
        completedLessons,
        progressPercentage,
        totalWatchTime,
        lessons: lessonsProgress,
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error("Get course progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get course progress",
    });
  }
};

// Update user progress for a specific lesson
export const updateLessonProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;
    const {
      lesson,
      completed,
      watchTime = 0,
    }: UpdateUserProgressRequest = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find or create user progress
    let userProgress = await UserProgress.findOne({
      user: userId,
      course: courseId,
      lesson: lesson,
    });

    if (!userProgress) {
      userProgress = new UserProgress({
        user: userId,
        course: courseId,
        lesson: lesson,
        completed: false,
        watchTime: 0,
      });
    }

    // Update progress
    if (completed !== undefined) {
      userProgress.completed = completed;
      if (completed && !userProgress.completedAt) {
        userProgress.completedAt = new Date();
      } else if (!completed) {
        userProgress.completedAt = undefined;
      }
    }

    if (watchTime !== undefined && watchTime > 0) {
      userProgress.watchTime = Math.max(userProgress.watchTime, watchTime);
    }

    await userProgress.save();

    // Update enrollment progress
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    let enrollmentProgress = {
      progressPercentage: 0,
      isCompleted: false,
    };

    if (enrollment) {
      // Recalculate progress based on actual UserProgress records
      await (enrollment as any).recalculateProgress();

      enrollmentProgress = {
        progressPercentage: enrollment.progressPercentage,
        isCompleted: enrollment.status === "completed",
      };
    }

    // Update user's total learning time
    if (watchTime > 0) {
      await User.findByIdAndUpdate(userId, {
        $inc: { totalLearningTime: watchTime / 60 }, // Convert seconds to minutes
      });
    }

    const response: UpdateUserProgressResponse = {
      success: true,
      data: {
        userProgress: userProgress as any,
        enrollmentProgress,
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error("Update lesson progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update lesson progress",
    });
  }
};

// Get user's learning analytics
export const getLearningAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get all user progress
    const userProgresses = await UserProgress.find({ user: userId }).populate(
      "course",
      "category title"
    );

    const totalWatchTime = userProgresses.reduce(
      (sum, progress) => sum + progress.watchTime,
      0
    );
    const totalLessonsCompleted = userProgresses.filter(
      (progress) => progress.completed
    ).length;

    // Calculate average session time (rough estimate)
    const sessionsCount = userProgresses.filter(
      (progress) => progress.watchTime > 0
    ).length;
    const averageSessionTime =
      sessionsCount > 0 ? totalWatchTime / sessionsCount : 0;

    // Calculate learning streak (consecutive days with activity)
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentProgress = userProgresses.filter(
      (progress) => progress.updatedAt >= sevenDaysAgo
    );

    // Group by date
    const dailyActivity = new Map<
      string,
      { watchTime: number; lessonsCompleted: number }
    >();

    recentProgress.forEach((progress) => {
      const date = progress.updatedAt.toISOString().split("T")[0];
      const existing = dailyActivity.get(date) || {
        watchTime: 0,
        lessonsCompleted: 0,
      };

      existing.watchTime += progress.watchTime;
      if (progress.completed) {
        existing.lessonsCompleted += 1;
      }

      dailyActivity.set(date, existing);
    });

    // Convert to array and sort
    const weeklyProgress = Array.from(dailyActivity.entries())
      .map(([date, activity]) => ({
        date,
        watchTime: activity.watchTime,
        lessonsCompleted: activity.lessonsCompleted,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate learning streak
    let learningStreak = 0;
    const now = new Date();
    let currentDate = new Date(now.getTime());

    while (currentDate >= sevenDaysAgo) {
      const dateStr = currentDate.toISOString().split("T")[0];
      if (dailyActivity.has(dateStr)) {
        learningStreak++;
      } else {
        break;
      }
      currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    }

    // Group by category
    const categoryStats = new Map<
      string,
      { watchTime: number; coursesCount: number }
    >();

    userProgresses.forEach((progress) => {
      const course = progress.course as any;
      if (course && course.category) {
        const existing = categoryStats.get(course.category) || {
          watchTime: 0,
          coursesCount: 0,
        };
        existing.watchTime += progress.watchTime;
        categoryStats.set(course.category, existing);
      }
    });

    // Get unique courses per category
    const uniqueCourses = new Set();
    userProgresses.forEach((progress) => {
      const course = progress.course as any;
      if (course && course.category) {
        const key = `${course.category}-${course._id}`;
        if (!uniqueCourses.has(key)) {
          uniqueCourses.add(key);
          const existing = categoryStats.get(course.category);
          if (existing) {
            existing.coursesCount++;
          }
        }
      }
    });

    const topCategories = Array.from(categoryStats.entries())
      .map(([category, stats]) => ({
        category,
        watchTime: stats.watchTime,
        coursesCount: stats.coursesCount,
      }))
      .sort((a, b) => b.watchTime - a.watchTime)
      .slice(0, 5);

    const response: LearningAnalyticsResponse = {
      success: true,
      data: {
        totalWatchTime,
        totalLessonsCompleted,
        averageSessionTime: Math.round(averageSessionTime),
        learningStreak,
        weeklyProgress,
        topCategories,
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error("Get learning analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get learning analytics",
    });
  }
};

// Get all user progress
export const getUserProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const filter: any = { user: userId };
    if (courseId) {
      filter.course = courseId;
    }

    const userProgresses = await UserProgress.find(filter)
      .populate("course", "title image category")
      .populate("lesson", "title order duration")
      .sort({ updatedAt: -1 });

    const response: UserProgressResponse = {
      success: true,
      data: userProgresses as any,
    };

    res.json(response);
  } catch (error: any) {
    console.error("Get user progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user progress",
    });
  }
};
