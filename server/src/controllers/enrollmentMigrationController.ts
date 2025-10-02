import { Request, Response } from "express";
import {
  performFullEnrollmentSync,
  syncEnrollmentData,
  syncFromUserEnrolledCourses,
  syncFromCourseStudentsEnrolled,
} from "../services/enrollmentMigrationService";

// Admin function to sync all enrollment data
export const syncAllEnrollments = async (req: Request, res: Response) => {
  try {
    console.log("Admin triggered full enrollment sync");

    const results = await performFullEnrollmentSync();

    res.json({
      success: true,
      message: "Enrollment data synchronization completed",
      data: results,
    });
  } catch (error: any) {
    console.error("Sync enrollments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync enrollment data",
      error: error.message,
    });
  }
};

// Sync only from Enrollment model
export const syncFromEnrollmentModel = async (req: Request, res: Response) => {
  try {
    const result = await syncEnrollmentData();

    res.json({
      success: true,
      message: "Synced from Enrollment model",
      data: result,
    });
  } catch (error: any) {
    console.error("Sync from enrollment model error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync from enrollment model",
      error: error.message,
    });
  }
};

// Sync from users to courses
export const syncUsersToCoursesOnly = async (req: Request, res: Response) => {
  try {
    const result = await syncFromUserEnrolledCourses();

    res.json({
      success: true,
      message: "Synced from user enrolled courses to course students",
      data: result,
    });
  } catch (error: any) {
    console.error("Sync users to courses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync users to courses",
      error: error.message,
    });
  }
};

// Sync from courses to users
export const syncCoursesToUsersOnly = async (req: Request, res: Response) => {
  try {
    const result = await syncFromCourseStudentsEnrolled();

    res.json({
      success: true,
      message: "Synced from course students to user enrolled courses",
      data: result,
    });
  } catch (error: any) {
    console.error("Sync courses to users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync courses to users",
      error: error.message,
    });
  }
};
