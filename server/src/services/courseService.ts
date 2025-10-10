import { FilterQuery } from "mongoose";
import Course from "../models/Course";
import User from "../models/User";
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
import {
  deleteFromCloudinary,
  extractPublicIdFromUrl,
} from "../middlewares/course-upload.middleware.js";

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

  const filter: FilterQuery<ICourse> = {};

  if (category) filter.category = category;
  if (level) filter.level = level;
  if (instructor) filter.instructor = instructor;

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.originalPrice = {};
    if (minPrice !== undefined) filter.originalPrice.$gte = minPrice;
    if (maxPrice !== undefined) filter.originalPrice.$lte = maxPrice;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  filter.isPublished = true;

  const sort: any = {};
  if (sortBy === "studentsCount") {
    sort["studentsEnrolled"] = sortOrder === "asc" ? 1 : -1;
  } else {
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
  }

  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("instructor", "firstName lastName email avatar")
      .populate("sections")
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

export const getCourseByIdService = async (id: string) => {
  const filter: FilterQuery<ICourse> = { _id: id };

  const course = await Course.findOne(filter)
    .populate("instructor", "firstName lastName email avatar bio")
    .populate("sections")
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
  const coursePayload = { ...courseData, instructor: instructorId };

  if (courseData.uploadedFiles?.image) {
    coursePayload.image = {
      url: courseData.uploadedFiles.image.url,
      publicId: courseData.uploadedFiles.image.publicId,
    };
  }

  if (courseData.uploadedFiles?.videoPromo) {
    coursePayload.videoPromo = {
      url: courseData.uploadedFiles.videoPromo.url,
      publicId: courseData.uploadedFiles.videoPromo.publicId,
    };
  }

  delete coursePayload.uploadedFiles;

  const course = new Course(coursePayload);
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

  if (updateData.uploadedFiles?.image) {
    if (course.image?.publicId) {
      await deleteFromCloudinary(course.image.publicId, "image");
    }

    updateData.image = {
      url: updateData.uploadedFiles.image.url,
      publicId: updateData.uploadedFiles.image.publicId,
    };
  }

  if (updateData.uploadedFiles?.videoPromo) {
    if (course.videoPromo?.publicId) {
      await deleteFromCloudinary(course.videoPromo.publicId, "video");
    }

    updateData.videoPromo = {
      url: updateData.uploadedFiles.videoPromo.url,
      publicId: updateData.uploadedFiles.videoPromo.publicId,
    };
  }

  delete updateData.uploadedFiles;

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

  const deletionPromises = [];

  if (course.image?.publicId) {
    deletionPromises.push(deleteFromCloudinary(course.image.publicId, "image"));
  }

  if (course.videoPromo?.publicId) {
    deletionPromises.push(
      deleteFromCloudinary(course.videoPromo.publicId, "video")
    );
  }

  await Promise.allSettled(deletionPromises);

  await Promise.all([
    Lesson.deleteMany({ course: id }),
    Section.deleteMany({ course: id }),
    UserNote.deleteMany({ course: id }),
    UserProgress.deleteMany({ course: id }),
  ]);

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
    .populate("sections")
    .select(
      "title description image price level rating totalDuration totalLessons"
    )
    .lean();

  return courses;
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
  const course = await Course.findOne({
    _id: courseId,
    instructor: instructorId,
  });

  if (!course) {
    throw new Error("Course not found or you are not authorized to view it");
  }

  const sectionsCount = await Section.countDocuments({ course: courseId });
  const lessonsCount = await Lesson.countDocuments({ course: courseId });

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

// Toggle course publish status
export const toggleCourseStatusService = async (
  id: string,
  instructorId: string
) => {
  const course = await Course.findOne({
    _id: id,
    instructor: instructorId,
  });

  if (!course) {
    throw new Error("Course not found or you are not authorized to modify it");
  }

  course.isPublished = !course.isPublished;

  if (course.isPublished && !course.publishedAt) {
    course.publishedAt = new Date();
  }

  course.lastUpdated = new Date();
  await course.save();

  return course.populate("instructor", "firstName lastName email avatar");
};

// Enroll user in course
export const enrollUserInCourseService = async (
  courseId: string,
  userId: string
) => {
  const course = await Course.findById(courseId);
  const user = await User.findById(userId);

  if (!course) {
    throw new Error("Course not found");
  }

  if (!user) {
    throw new Error("User not found");
  }

  if (!course.isPublished) {
    throw new Error("Cannot enroll in unpublished course");
  }

  if (course.studentsEnrolled.includes(userId as any)) {
    throw new Error("User is already enrolled in this course");
  }

  course.studentsEnrolled.push(userId as any);
  await course.save();

  if (!user.enrolledCourses.includes(courseId as any)) {
    user.enrolledCourses.push(courseId as any);
    await user.save();
  }

  return { message: "Successfully enrolled in course" };
};
