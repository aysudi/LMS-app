import { Request, Response } from "express";
import { AuthRequest } from "../types/common.types";
import {
  CourseQuery,
  CreateCourseData,
  UpdateCourseData,
} from "../types/course.types";
import {
  createCourseService,
  deleteCourseService,
  getAllCoursesService,
  getCourseByIdService,
  getInstructorCoursesService,
  getUserCoursesService,
  updateCourseService,
} from "../services/courseService";
import formatMongoData from "../utils/formatMongoData";

// Get all courses with filtering and pagination
export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const query: CourseQuery = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      category: req.query.category as string,
      level: req.query.level as string,
      search: req.query.search as string,
      instructor: req.query.instructor as string,
      minPrice: req.query.minPrice
        ? parseFloat(req.query.minPrice as string)
        : undefined,
      maxPrice: req.query.maxPrice
        ? parseFloat(req.query.maxPrice as string)
        : undefined,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as "asc" | "desc",
    };

    const result = await getAllCoursesService(query);

    res.status(200).json({
      success: true,
      data: formatMongoData(result.courses),
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching courses",
      error: error.message,
    });
  }
};

// Get course by ID
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await getCourseByIdService(id);

    res.status(200).json({
      success: true,
      data: formatMongoData(course),
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new course (instructor only)
export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user!.userId;
    const courseData: CreateCourseData = req.body;

    const course = await createCourseService(courseData, instructorId);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Error creating course",
      error: error.message,
    });
  }
};

// Update course (instructor only)
export const updateCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const instructorId = req.user!.userId;
    const updateData: UpdateCourseData = req.body;

    const course = await updateCourseService(id, updateData, instructorId);

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete course (instructor only)
export const deleteCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const instructorId = req.user!.userId;

    const result = await deleteCourseService(id, instructorId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user's enrolled courses
export const getUserCourses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    // console.log("Fetching courses for user:", userId);
    const courses = await getUserCoursesService(userId);

    res.status(200).json({
      success: true,
      data: formatMongoData(courses),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching user courses",
      error: error.message,
    });
  }
};

// Get instructor's courses
export const getInstructorCourses = async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user!.userId;
    const courses = await getInstructorCoursesService(instructorId);

    res.status(200).json({
      success: true,
      data: formatMongoData(courses),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching instructor courses",
      error: error.message,
    });
  }
};
