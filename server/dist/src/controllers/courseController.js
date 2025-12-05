import { createCourseService, deleteCourseService, getAllCoursesService, getCourseByIdService, getInstructorCoursesService, getUserCoursesService, updateCourseService, toggleCourseStatusService, submitCourseForApprovalService, } from "../services/courseService";
import formatMongoData from "../utils/formatMongoData";
// Get all courses with filtering and pagination
export const getAllCourses = async (req, res) => {
    try {
        const query = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            category: req.query.category,
            level: req.query.level,
            search: req.query.search,
            instructor: req.query.instructor,
            minPrice: req.query.minPrice
                ? parseFloat(req.query.minPrice)
                : undefined,
            maxPrice: req.query.maxPrice
                ? parseFloat(req.query.maxPrice)
                : undefined,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
        };
        const result = await getAllCoursesService(query);
        res.status(200).json({
            success: true,
            data: formatMongoData(result.courses),
            pagination: result.pagination,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching courses",
            error: error.message,
        });
    }
};
// Get course by ID
export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await getCourseByIdService(id);
        res.status(200).json({
            success: true,
            data: formatMongoData(course),
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};
// Create new course (instructor only)
export const createCourse = async (req, res) => {
    try {
        const instructorId = req.user.userId;
        const courseData = req.body;
        const course = await createCourseService(courseData, instructorId);
        res.status(201).json({
            success: true,
            message: "Course created successfully",
            data: course,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: "Error creating course",
            error: error.message,
        });
    }
};
// Update course (instructor only)
export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const instructorId = req.user.userId;
        const updateData = req.body;
        const course = await updateCourseService(id, updateData, instructorId);
        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: course,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
// Delete course (instructor only)
export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const instructorId = req.user.userId;
        const result = await deleteCourseService(id, instructorId);
        res.status(200).json({
            success: true,
            message: result.message,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
// Get user's enrolled courses
export const getUserCourses = async (req, res) => {
    try {
        const userId = req.user.userId;
        const courses = await getUserCoursesService(userId);
        res.status(200).json({
            success: true,
            data: formatMongoData(courses),
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user courses",
            error: error.message,
        });
    }
};
// Get instructor's courses
export const getInstructorCourses = async (req, res) => {
    try {
        const instructorId = req.user.userId;
        const courses = await getInstructorCoursesService(instructorId);
        res.status(200).json({
            success: true,
            data: formatMongoData(courses),
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching instructor courses",
            error: error.message,
        });
    }
};
// Submit course for approval (instructor only)
export const submitCourseForApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const instructorId = req.user.userId;
        const course = await submitCourseForApprovalService(id, instructorId);
        res.status(200).json({
            success: true,
            message: "Course submitted for approval successfully",
            data: formatMongoData(course),
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
// Toggle course status (instructor only)
export const toggleCourseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const instructorId = req.user.userId;
        const course = await toggleCourseStatusService(id, instructorId);
        res.status(200).json({
            success: true,
            message: `Course ${course.isPublished ? "published" : "unpublished"} successfully`,
            data: formatMongoData(course),
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
// Add review to course
export const addReview = async (req, res) => {
    try {
        const { id } = req.params; // courseId
        const userId = req.user.userId;
        const { rating, comment } = req.body;
        // Validate input
        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: "Rating and comment are required",
            });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
            });
        }
        const { addReviewToCourseService } = await import("../services/courseService");
        const course = await addReviewToCourseService(id, userId, rating, comment);
        res.status(201).json({
            success: true,
            message: "Review added successfully",
            data: formatMongoData(course),
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
// Get course reviews
export const getCourseReviews = async (req, res) => {
    try {
        const { id } = req.params; // courseId
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { getCourseReviewsService } = await import("../services/courseService");
        const result = await getCourseReviewsService(id, page, limit);
        // Transform the response to match client expectations
        const response = {
            reviews: result.reviews.map((review) => ({
                _id: review._id,
                user: {
                    _id: review.user._id,
                    name: `${review.user.firstName} ${review.user.lastName}`,
                    profilePicture: review.user.avatar,
                },
                rating: review.rating,
                comment: review.comment,
                date: review.date,
                updatedAt: review.updatedAt,
            })),
            stats: {
                totalReviews: result.totalReviews,
                averageRating: result.averageRating || 0,
                ratingBreakdown: calculateRatingBreakdown(result.reviews),
            },
            pagination: {
                currentPage: result.pagination.current,
                totalPages: result.pagination.pages,
                hasNext: result.pagination.hasNext,
                hasPrevious: result.pagination.hasPrev,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};
// Helper function to calculate rating breakdown
const calculateRatingBreakdown = (reviews) => {
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
        if (review.rating >= 1 && review.rating <= 5) {
            breakdown[review.rating]++;
        }
    });
    return breakdown;
};
// Update user's review
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params; // courseId
        const userId = req.user.userId;
        const { rating, comment } = req.body;
        // Validate input
        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: "Rating and comment are required",
            });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
            });
        }
        const { updateReviewService } = await import("../services/courseService");
        const course = await updateReviewService(id, userId, rating, comment);
        res.status(200).json({
            success: true,
            message: "Review updated successfully",
            data: formatMongoData(course),
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
// Delete user's review
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params; // courseId
        const userId = req.user.userId;
        const { deleteReviewService } = await import("../services/courseService");
        const result = await deleteReviewService(id, userId);
        res.status(200).json({
            success: true,
            message: result.message,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
