import { FilterQuery } from "mongoose";
import Course from "../models/Course";
import Section from "../models/Section";
import Lesson from "../models/Lesson";
import {
  CourseQuery,
  CreateCourseData,
  ICourse,
  UpdateCourseData,
} from "../types/course.types";
import UserNote from "../models/UserNote";
import UserProgress from "../models/UserProgress";

// Get all courses with filtering, pagination, and search
export const getAllCoursesService = async (query: CourseQuery = {}) => {
  const {
    page = 1,
    limit = 10,
    category,
    level,
    search,
    instructor,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  // Build filter query
  const filter: FilterQuery<ICourse> = {};

  if (category) filter.category = category;
  if (level) filter.level = level;
  if (instructor) filter.instructor = instructor;

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.originalPrice = {};
    if (minPrice !== undefined) filter.originalPrice.$gte = minPrice;
    if (maxPrice !== undefined) filter.originalPrice.$lte = maxPrice;
  }

  // Text search
  if (search) {
    filter.$text = { $search: search };
  }

  // Only show published courses by default
  filter.isPublished = true;

  // Build sort object
  const sort: any = {};
  if (sortBy === "studentsCount") {
    // Sort by number of enrolled students
    sort["studentsEnrolled"] = sortOrder === "asc" ? 1 : -1;
  } else {
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
  }

  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("instructor", "firstName lastName email avatar")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments(filter),
  ]);

  return {
    courses,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

export const getCourseByIdService = async (
  id: string,
  includeUnpublished = false
) => {
  const filter: FilterQuery<ICourse> = { _id: id };
  if (!includeUnpublished) {
    filter.isPublished = true;
  }

  const course = await Course.findOne(filter)
    .populate("instructor", "firstName lastName email avatar bio")
    .populate("reviews.user", "firstName lastName avatar")
    .lean();

  if (!course) {
    throw new Error("Course not found");
  }

  const sections = await Section.find({ course: id }).sort({ order: 1 }).lean();

  const sectionsWithLessons = await Promise.all(
    sections.map(async (section) => {
      const lessons = await Lesson.find({ section: section._id })
        .sort({ order: 1 })
        .lean();
      return {
        ...section,
        lessons,
        lessonCount: lessons.length,
      };
    })
  );

  return {
    ...course,
    sections: sectionsWithLessons,
  };
};

export const createCourseService = async (
  courseData: CreateCourseData,
  instructorId: string
) => {
  const course = new Course({
    ...courseData,
    instructor: instructorId,
  });

  await course.save();
  return course.populate("instructor", "firstName lastName email avatar");
};

export const updateCourseService = async (
  id: string,
  updateData: UpdateCourseData,
  instructorId: string
) => {
  const course = await Course.findOne({
    _id: id,
    instructor: instructorId,
  });

  if (!course) {
    throw new Error("Course not found or you are not authorized to update it");
  }

  Object.assign(course, updateData);

  if (updateData.isPublished && !course.publishedAt) {
    course.publishedAt = new Date();
  }

  course.lastUpdated = new Date();
  await course.save();

  return course.populate("instructor", "firstName lastName email avatar");
};

export const deleteCourseService = async (id: string, instructorId: string) => {
  const course = await Course.findOne({
    _id: id,
    instructor: instructorId,
  });

  if (!course) {
    throw new Error("Course not found or you are not authorized to delete it");
  }

  await Lesson.deleteMany({ course: id });

  await Section.deleteMany({ course: id });

  await UserNote.deleteMany({ course: id });

  await UserProgress.deleteMany({ course: id });

  await Course.deleteOne({ _id: id });

  return { message: "Course and all related data deleted successfully" };
};

// Get user's courses (for students)
export const getUserCoursesService = async (userId: string) => {
  const courses = await Course.find({
    studentsEnrolled: userId,
    isPublished: true,
  })
    .populate("instructor", "firstName lastName avatar")
    .select(
      "title description image price level rating totalDuration totalLessons"
    )
    .lean();

  // Get user progress for each course using UserProgress model
  const coursesWithProgress = await Promise.all(
    courses.map(async (course) => {
      // Import UserProgress here to avoid circular dependencies
      const UserProgress = require("../models/UserProgress").default;

      const userProgress = await UserProgress.find({
        user: userId,
        course: course._id,
      }).lean();

      const totalLessons = await Lesson.countDocuments({ course: course._id });
      const completedLessons = userProgress.filter(
        (p: any) => p.isCompleted
      ).length;
      const progressPercentage =
        totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      return {
        ...course,
        totalLessons,
        userProgress: {
          progressPercentage,
          completedLessons,
          totalLessons,
        },
      };
    })
  );

  return coursesWithProgress;
};

// Get instructor's courses
export const getInstructorCoursesService = async (instructorId: string) => {
  return Course.find({ instructor: instructorId })
    .populate("instructor", "firstName lastName avatar")
    .sort({ createdAt: -1 })
    .lean();
};

// Get course statistics for instructor
export const getCourseStatisticsService = async (
  courseId: string,
  instructorId: string
) => {
  // Verify course ownership
  const course = await Course.findOne({
    _id: courseId,
    instructor: instructorId,
  });

  if (!course) {
    throw new Error("Course not found or you are not authorized to view it");
  }

  // Get course sections and lessons count
  const sectionsCount = await Section.countDocuments({ course: courseId });
  const lessonsCount = await Lesson.countDocuments({ course: courseId });

  // Import UserProgress to get completion statistics
  const UserProgress = require("../models/UserProgress").default;
  const totalEnrollments = course.studentsEnrolled.length;
  const completedStudents = await UserProgress.distinct("user", {
    course: courseId,
    isCompleted: true,
  });

  return {
    course: {
      id: course._id,
      title: course.title,
      isPublished: course.isPublished,
      studentsEnrolled: totalEnrollments,
      rating: course.rating,
      totalEarnings: course.originalPrice * totalEnrollments,
    },
    statistics: {
      sectionsCount,
      lessonsCount,
      totalEnrollments,
      completedStudents: completedStudents.length,
      completionRate:
        totalEnrollments > 0
          ? (completedStudents.length / totalEnrollments) * 100
          : 0,
    },
  };
};

// Enroll user in course
export const enrollUserInCourseService = async (
  courseId: string,
  userId: string
) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.isPublished) {
    throw new Error("Cannot enroll in unpublished course");
  }

  if (course.studentsEnrolled.includes(userId as any)) {
    throw new Error("User is already enrolled in this course");
  }

  course.studentsEnrolled.push(userId as any);
  await course.save();

  return { message: "Successfully enrolled in course" };
};
