import { Response } from "express";
import {
  createSection,
  getSectionsByCourse,
  getSectionById,
  updateSection as updateSectionService,
  deleteSection as deleteSectionService,
  getSectionsWithLessonCount,
} from "../services/sectionService";
import { AuthRequest } from "../types/common.types";

// Get all sections for a course
export const getSections = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;

    const sections = await getSectionsByCourse(courseId);

    res.status(200).json({
      success: true,
      data: sections,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get sections with lesson count
export const getSectionsWithCount = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;

    const sections = await getSectionsWithLessonCount(courseId);

    res.status(200).json({
      success: true,
      data: sections,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get section by ID
export const getSection = async (req: AuthRequest, res: Response) => {
  try {
    const { sectionId } = req.params;

    const section = await getSectionById(sectionId);

    res.status(200).json({
      success: true,
      data: section,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Add section to course
export const addSection = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user!.userId;
    const sectionData = { ...req.body, courseId };

    const section = await createSection(sectionData, instructorId);

    res.status(201).json({
      success: true,
      message: "Section added successfully",
      data: section,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update section
export const updateSection = async (req: AuthRequest, res: Response) => {
  try {
    const { sectionId } = req.params;
    const instructorId = req.user!.userId;
    const sectionData = req.body;

    const section = await updateSectionService(
      sectionId,
      sectionData,
      instructorId
    );

    res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: section,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete section
export const deleteSection = async (req: AuthRequest, res: Response) => {
  try {
    const { sectionId } = req.params;
    const instructorId = req.user!.userId;

    const result = await deleteSectionService(sectionId, instructorId);

    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
