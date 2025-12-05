import Course from "../models/Course";
import User from "../models/User";
import Section from "../models/Section";
import Lesson from "../models/Lesson";
import UserNote from "../models/UserNote";
import UserProgress from "../models/UserProgress";
import { deleteFromCloudinary, } from "../middlewares/course-upload.middleware.js";
export const getAllCoursesService = async (query = {}) => {
    const { page = 1, limit = 10, category, level, search, instructor, minPrice, maxPrice, sortBy = "createdAt", sortOrder = "desc", } = query;
    const filter = {};
    if (category)
        filter.category = category;
    if (level)
        filter.level = level;
    if (instructor)
        filter.instructor = instructor;
    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.originalPrice = {};
        if (minPrice !== undefined)
            filter.originalPrice.$gte = minPrice;
        if (maxPrice !== undefined)
            filter.originalPrice.$lte = maxPrice;
    }
    if (search) {
        filter.$text = { $search: search };
    }
    filter.isPublished = true;
    const sort = {};
    if (sortBy === "studentsCount") {
        sort["studentsEnrolled"] = sortOrder === "asc" ? 1 : -1;
    }
    else {
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
export const getCourseByIdService = async (id) => {
    const filter = { _id: id };
    const course = await Course.findOne(filter)
        .populate("instructor", "firstName lastName email avatar bio instructorApplication instructorProfile")
        .populate("sections")
        .populate("reviews.user", "firstName lastName avatar")
        .lean();
    if (!course) {
        throw new Error("Course not found");
    }
    const sections = await Section.find({ course: id }).sort({ order: 1 }).lean();
    const sectionsWithLessons = await Promise.all(sections.map(async (section) => {
        const lessons = await Lesson.find({ section: section._id })
            .sort({ order: 1 })
            .lean();
        return {
            ...section,
            lessons,
            lessonCount: lessons.length,
        };
    }));
    return {
        ...course,
        sections: sectionsWithLessons,
    };
};
export const createCourseService = async (courseData, instructorId) => {
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
    // Set status based on what was explicitly provided, or use default logic
    if (coursePayload.status) {
        // If status is explicitly provided, use it
        if (coursePayload.status === "draft") {
            coursePayload.isPublished = false;
        }
        else if (coursePayload.status === "pending") {
            coursePayload.isPublished = false;
            coursePayload.submittedAt = new Date();
        }
    }
    else {
        // Fallback to original logic if no status provided
        if (coursePayload.isPublished) {
            coursePayload.status = "pending";
            coursePayload.submittedAt = new Date();
            coursePayload.isPublished = false; // Don't publish until approved
        }
        else {
            coursePayload.status = "draft";
        }
    }
    const course = new Course(coursePayload);
    await course.save();
    return course.populate("instructor", "firstName lastName email avatar");
};
export const updateCourseService = async (id, updateData, instructorId) => {
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
export const submitCourseForApprovalService = async (id, instructorId) => {
    const course = await Course.findOne({
        _id: id,
        instructor: instructorId,
    });
    if (!course) {
        throw new Error("Course not found or you are not authorized to submit it");
    }
    if (course.status !== "draft") {
        throw new Error("Only draft courses can be submitted for approval");
    }
    course.status = "pending";
    course.submittedAt = new Date();
    course.lastUpdated = new Date();
    await course.save();
    return course.populate("instructor", "firstName lastName email avatar");
};
export const deleteCourseService = async (id, instructorId) => {
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
        deletionPromises.push(deleteFromCloudinary(course.videoPromo.publicId, "video"));
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
export const getUserCoursesService = async (userId) => {
    const courses = await Course.find({
        studentsEnrolled: userId,
        isPublished: true,
    })
        .populate("instructor", "firstName lastName avatar")
        .populate("sections")
        .select("title description image price level rating totalDuration totalLessons")
        .lean();
    return courses;
};
// Get instructor's courses
export const getInstructorCoursesService = async (instructorId) => {
    return Course.find({ instructor: instructorId })
        .populate("instructor", "firstName lastName avatar")
        .sort({ createdAt: -1 })
        .lean();
};
// Get course statistics for instructor
export const getCourseStatisticsService = async (courseId, instructorId) => {
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
            completionRate: totalEnrollments > 0
                ? (completedStudents.length / totalEnrollments) * 100
                : 0,
        },
    };
};
// Toggle course publish status
export const toggleCourseStatusService = async (id, instructorId) => {
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
export const enrollUserInCourseService = async (courseId, userId) => {
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
    if (course.studentsEnrolled.includes(userId)) {
        throw new Error("User is already enrolled in this course");
    }
    course.studentsEnrolled.push(userId);
    await course.save();
    if (!user.enrolledCourses.includes(courseId)) {
        user.enrolledCourses.push(courseId);
        await user.save();
    }
    return { message: "Successfully enrolled in course" };
};
// Add review to course
export const addReviewToCourseService = async (courseId, userId, rating, comment) => {
    const course = await Course.findById(courseId);
    if (!course) {
        throw new Error("Course not found");
    }
    // Check if user is enrolled in the course
    if (!course.studentsEnrolled.includes(userId)) {
        throw new Error("You must be enrolled in this course to leave a review");
    }
    // Check if user has already reviewed this course
    const existingReview = course.reviews.find((review) => review.user.toString() === userId);
    if (existingReview) {
        throw new Error("You have already reviewed this course");
    }
    // Add the new review
    course.reviews.push({
        user: userId,
        rating,
        comment,
        date: new Date(),
    });
    // Recalculate average rating
    course.calculateAverageRating();
    await course.save();
    // Populate the new review and return the course
    const updatedCourse = await Course.findById(courseId)
        .populate("reviews.user", "firstName lastName avatar")
        .lean();
    return updatedCourse;
};
// Get course reviews with pagination
export const getCourseReviewsService = async (courseId, page = 1, limit = 10) => {
    const course = await Course.findById(courseId)
        .select("reviews rating ratingsCount")
        .populate("reviews.user", "firstName lastName avatar")
        .lean();
    if (!course) {
        throw new Error("Course not found");
    }
    // Sort reviews by date (newest first)
    const sortedReviews = course.reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedReviews = sortedReviews.slice(skip, skip + limit);
    return {
        reviews: paginatedReviews,
        totalReviews: course.reviews.length,
        averageRating: course.rating,
        ratingsCount: course.ratingsCount,
        pagination: {
            current: page,
            pages: Math.ceil(course.reviews.length / limit),
            total: course.reviews.length,
            hasNext: page < Math.ceil(course.reviews.length / limit),
            hasPrev: page > 1,
        },
    };
};
// Update user's review
export const updateReviewService = async (courseId, userId, rating, comment) => {
    const course = await Course.findById(courseId);
    if (!course) {
        throw new Error("Course not found");
    }
    // Find the user's existing review
    const reviewIndex = course.reviews.findIndex((review) => review.user.toString() === userId);
    if (reviewIndex === -1) {
        throw new Error("Review not found");
    }
    // Update the review
    course.reviews[reviewIndex].rating = rating;
    course.reviews[reviewIndex].comment = comment;
    course.reviews[reviewIndex].date = new Date();
    // Recalculate average rating
    course.calculateAverageRating();
    await course.save();
    // Return updated course with populated reviews
    const updatedCourse = await Course.findById(courseId)
        .populate("reviews.user", "firstName lastName avatar")
        .lean();
    return updatedCourse;
};
// Delete user's review
export const deleteReviewService = async (courseId, userId) => {
    const course = await Course.findById(courseId);
    if (!course) {
        throw new Error("Course not found");
    }
    // Find and remove the user's review
    const reviewIndex = course.reviews.findIndex((review) => review.user.toString() === userId);
    if (reviewIndex === -1) {
        throw new Error("Review not found");
    }
    course.reviews.splice(reviewIndex, 1);
    // Recalculate average rating
    course.calculateAverageRating();
    await course.save();
    return { message: "Review deleted successfully" };
};
