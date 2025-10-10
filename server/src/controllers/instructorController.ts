import { Response } from "express";
import { AuthRequest } from "../types/common.types.js";
import {
  getInstructorOverviewService,
  getInstructorCoursesWithStatsService,
  getCourseStudentsService
} from "../services/instructorService.js";

// Get instructor dashboard overview
export const getInstructorOverview = async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user?.id;
    
    if (!instructorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const data = await getInstructorOverviewService(instructorId);

    res.json({
      success: true,
      data
    });

  } catch (error: any) {
    console.error("Get instructor overview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get instructor overview"
    });
  }
};

// Get instructor courses with detailed stats
export const getInstructorCoursesWithStats = async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user?.id;
    const { 
      page = 1, 
      limit = 10, 
      status = "all",
      search,
      category,
      level,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;
    
    if (!instructorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const queryParams = {
      page: Number(page),
      limit: Number(limit),
      status: status as string,
      search: search as string,
      category: category as string,
      level: level as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc"
    };

    const data = await getInstructorCoursesWithStatsService(instructorId, queryParams);

    res.json({
      success: true,
      data
    });

  } catch (error: any) {
    console.error("Get instructor courses with stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get instructor courses"
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

    const data = await getCourseStudentsService(
      instructorId,
      courseId,
      Number(page),
      Number(limit)
    );

    res.json({
      success: true,
      data
    });

  } catch (error: any) {
    console.error("Get course students error:", error);
    
    if (error.message === "Course not found or access denied") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to get course students"
    });
  }
};
