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

export const getEnrollmentNotes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { enrollmentId } = req.params;
    const { lessonId } = req.query;

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

    let notes = enrollment.notes;
    if (lessonId) {
      notes = notes.filter((note) => note.lesson.toString() === lessonId);
    }

    res.json({
      success: true,
      data: notes,
    });
  } catch (error: any) {
    console.error("Get enrollment notes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get notes",
    });
  }
};

export const addEnrollmentNote = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { enrollmentId } = req.params;
    const { lesson, content, timestamp }: AddNoteRequest = req.body;

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

    await enrollment.addNote(lesson, content, timestamp);

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

export const getEnrollmentReviews = async (req: AuthRequest, res: Response) => {
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
    }).populate("course", "title");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    res.json({
      success: true,
      data: {
        reviews: enrollment.reviews,
        averageRating: enrollment.averageRating,
        totalRatings: enrollment.totalRatings,
        course: enrollment.course,
      },
    });
  } catch (error: any) {
    console.error("Get enrollment reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get reviews",
    });
  }
};

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

    await enrollment.addReview(rating, review || "");

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

export const getLearningStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

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

// Recalculate enrollment progress (for fixing inconsistencies)
export const recalculateEnrollmentProgress = async (
  req: AuthRequest,
  res: Response
) => {
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
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Recalculate progress
    await (enrollment as any).recalculateProgress();

    res.json({
      success: true,
      message: "Progress recalculated successfully",
      data: {
        progressPercentage: enrollment.progressPercentage,
        completedLessons: enrollment.completedLessons.length,
        status: enrollment.status,
      },
    });
  } catch (error: any) {
    console.error("Recalculate progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to recalculate progress",
    });
  }
};

// Recalculate all user enrollments progress
export const recalculateAllUserProgress = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const enrollments = await Enrollment.find({ user: userId });

    let updated = 0;
    for (const enrollment of enrollments) {
      try {
        await (enrollment as any).recalculateProgress();
        updated++;
      } catch (error) {
        console.error(`Error updating enrollment ${enrollment._id}:`, error);
      }
    }

    res.json({
      success: true,
      message: `Successfully updated ${updated} out of ${enrollments.length} enrollments`,
      data: {
        totalEnrollments: enrollments.length,
        updated,
      },
    });
  } catch (error: any) {
    console.error("Recalculate all progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to recalculate progress",
    });
  }
};

// Enroll in a free course
export const enrollInFreeCourse = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { course: courseId } = req.body;
    console.log("courseId:", courseId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!course.isFree) {
      return res.status(400).json({
        success: false,
        message: "This course is not free",
      });
    }

    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
        data: { enrollment: existingEnrollment },
      });
    }

    const enrollment = new Enrollment({
      user: userId,
      course: courseId,
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(),
      lastAccessedAt: new Date(),
      progressPercentage: 0,
      totalWatchTime: 0,
      completedLessons: [],
    });
    console.log("enrollment before save:", enrollment);

    await enrollment.save();

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate("course", "title description instructor image.url")
      .populate("user", "firstName lastName email");

    await User.findByIdAndUpdate(userId, {
      $push: { enrolledCourses: courseId },
    });

    await Course.findByIdAndUpdate(courseId, {
      $push: { studentsEnrolled: userId },
    });

    console.log("populatedEnrollment:", populatedEnrollment);

    res.status(201).json({
      success: true,
      message: "Successfully enrolled in free course",
      data: {
        enrollment: formatMongoData(populatedEnrollment),
      },
    });
  } catch (error: any) {
    console.error("Free enrollment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to enroll in course",
    });
  }
};
