import { Response } from "express";
import { AuthRequest } from "../types/common.types";
import Enrollment from "../models/Enrollment";
import Course from "../models/Course";
import User from "../models/User";
import { EnrollmentStatus } from "../types/enrollment.types";
import type {
  EnrollmentListResponse,
  EnrollmentDetailsResponse,
  UpdateProgressRequest,
  UpdateProgressResponse,
  AddNoteRequest,
  AddNoteResponse,
  AddReviewRequest,
  AddReviewResponse,
  LearningStatsResponse,
} from "../types/enrollment.types";
import formatMongoData from "../utils/formatMongoData";

// Get user's enrollments with optional filtering
export const getUserEnrollments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      status,
      page = "1",
      limit = "10",
      sortBy = "lastAccessedAt",
      sortOrder = "desc",
    } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { user: userId };
    if (status && status !== "all") {
      filter.status = status;
    }

    const sortObj: any = {};
    sortObj[sortBy as string] = sortOrder === "desc" ? -1 : 1;

    const [enrollments, total] = await Promise.all([
      Enrollment.find(filter)
        .populate({
          path: "course",
          select:
            "title description image instructor category originalPrice discountPrice totalLessons totalDuration rating studentsEnrolled",
          populate: {
            path: "instructor",
            select: "firstName lastName avatar",
          },
        })
        .populate({
          path: "currentLesson",
          select: "title order duration",
        })
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Enrollment.countDocuments(filter),
    ]);

    const response: EnrollmentListResponse = {
      success: true,
      data: {
        enrollments: formatMongoData(enrollments),
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error("Get user enrollments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get enrollments",
    });
  }
};

// Get specific enrollment details
export const getEnrollmentById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { enrollmentId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      user: userId,
    })
      .populate({
        path: "course",
        select:
          "title description image instructor category originalPrice discountPrice totalLessons totalDuration rating studentsEnrolled",
        populate: {
          path: "instructor",
          select: "firstName lastName avatar",
        },
      })
      .populate({
        path: "completedLessons",
        select: "title order",
      })
      .populate({
        path: "currentLesson",
        select: "title order duration",
      });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    const response: EnrollmentDetailsResponse = {
      success: true,
      data: formatMongoData(enrollment),
    };

    res.json(response);
  } catch (error: any) {
    console.error("Get enrollment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get enrollment details",
    });
  }
};

// Update enrollment progress (lesson completion)
export const updateEnrollmentProgress = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { enrollmentId } = req.params;
    const {
      lessonId,
      completed,
      watchTime = 0,
    }: UpdateProgressRequest = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      user: userId,
    }).populate("course");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Update lesson completion status
    if (completed) {
      if (!enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId);
      }
      if (!enrollment.startedAt) {
        enrollment.startedAt = new Date();
      }
    } else {
      const index = enrollment.completedLessons.indexOf(lessonId);
      if (index > -1) {
        enrollment.completedLessons.splice(index, 1);
      }
    }

    // Update current lesson
    enrollment.currentLesson = lessonId;

    // Update watch time
    if (watchTime > 0) {
      enrollment.totalWatchTime += watchTime;
    }

    // Calculate progress percentage based on course lessons
    const course = enrollment.course as any;
    const totalLessons = course.totalLessons || 0;
    const completedLessons = enrollment.completedLessons.length;

    await enrollment.updateProgress(completedLessons, totalLessons);

    const response: UpdateProgressResponse = {
      success: true,
      data: {
        enrollment,
        progressPercentage: enrollment.progressPercentage,
        isCompleted: enrollment.status === EnrollmentStatus.COMPLETED,
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error("Update enrollment progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
    });
  }
};

// Add note to enrollment
export const addEnrollmentNote = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { enrollmentId } = req.params;
    const { lessonId, content, timestamp }: AddNoteRequest = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note content is required",
      });
    }

    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      user: userId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    await enrollment.addNote(lessonId, content, timestamp);

    const addedNote = enrollment.notes[enrollment.notes.length - 1];

    const response: AddNoteResponse = {
      success: true,
      data: {
        note: addedNote,
        enrollment,
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error("Add enrollment note error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add note",
    });
  }
};

// Toggle bookmark for lesson
export const toggleLessonBookmark = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { enrollmentId } = req.params;
    const { lessonId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      user: userId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    await enrollment.toggleBookmark(lessonId);

    res.json({
      success: true,
      data: enrollment,
      message: "Bookmark toggled successfully",
    });
  } catch (error: any) {
    console.error("Toggle bookmark error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle bookmark",
    });
  }
};

// Add course review
export const addCourseReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { enrollmentId } = req.params;
    const { rating, review }: AddReviewRequest = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      user: userId,
    }).populate("course");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    const reviewRes = await enrollment.addReview(rating, review || "");

    const response: AddReviewResponse = {
      success: true,
      data: enrollment,
    };

    res.json(response);
  } catch (error: any) {
    console.error("Add course review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add review",
    });
  }
};

// Get learning statistics
export const getLearningStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get all user enrollments
    const enrollments = await Enrollment.find({ user: userId }).populate(
      "course",
      "category"
    );

    const totalEnrolledCourses = enrollments.length;
    const totalCompletedCourses = enrollments.filter(
      (e) => e.status === EnrollmentStatus.COMPLETED
    ).length;
    const totalInProgressCourses = enrollments.filter(
      (e) => e.status === EnrollmentStatus.ACTIVE && e.progressPercentage > 0
    ).length;

    const totalWatchTime = enrollments.reduce(
      (sum, e) => sum + e.totalWatchTime,
      0
    );

    const averageProgress =
      totalEnrolledCourses > 0
        ? enrollments.reduce((sum, e) => sum + e.progressPercentage, 0) /
          totalEnrolledCourses
        : 0;

    const certificatesEarned = enrollments.filter(
      (e) => e.certificateIssued
    ).length;

    // Get recent activity (last 5 accessed courses)
    const recentActivity = enrollments
      .filter((e) => e.lastAccessedAt)
      .sort((a, b) => b.lastAccessedAt!.getTime() - a.lastAccessedAt!.getTime())
      .slice(0, 5);

    const response: LearningStatsResponse = {
      success: true,
      data: {
        totalEnrolledCourses,
        totalCompletedCourses,
        totalInProgressCourses,
        totalWatchTime,
        averageProgress: Math.round(averageProgress),
        certificatesEarned,
        recentActivity,
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error("Get learning stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get learning statistics",
    });
  }
};
