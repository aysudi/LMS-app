import { createCourseService, deleteCourseService, getAllCoursesService, getCourseByIdService, getInstructorCoursesService, getUserCoursesService, updateCourseService, toggleCourseStatusService, } from "../services/courseService";
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
// Toggle course status (instructor only)
export const toggleCourseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const instructorId = req.user.userId;
        const course = await toggleCourseStatusService(id, instructorId);
        res.status(200).json({
            success: true,
            message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
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
