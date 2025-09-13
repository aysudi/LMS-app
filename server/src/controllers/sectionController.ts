import { Response } from "express";
import {
  createSection,
  getAllSections,
  getSectionsByCourse,
  getSectionById,
  updateSection as updateSectionService,
  deleteSection as deleteSectionService,
  getSectionsWithLessonCount,
} from "../services/sectionService";
import { AuthRequest } from "../types/common.types";
import formatMongoData from "../utils/formatMongoData";

// Get all sections (admin/system use)
export const getAllSectionsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sections = await getAllSections();

    res.status(200).json({
      success: true,
      data: formatMongoData(sections),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSections = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;

    const sections = await getSectionsByCourse(courseId);

    res.status(200).json({
      success: true,
      data: formatMongoData(sections),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSectionsWithCount = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;

    const sections = await getSectionsWithLessonCount(courseId);

    res.status(200).json({
      success: true,
      data: formatMongoData(sections),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSection = async (req: AuthRequest, res: Response) => {
  try {
    const { sectionId } = req.params;

    const section = await getSectionById(sectionId);

    res.status(200).json({
      success: true,
      data: formatMongoData(section),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const addSection = async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user!.userId;
    const sectionData = { ...req.body };

    const section = await createSection(sectionData, instructorId);

    res.status(201).json({
      success: true,
      message: "Section added successfully",
      data: formatMongoData(section),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

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
      data: formatMongoData(section),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteSection = async (req: AuthRequest, res: Response) => {
  try {
    const { sectionId } = req.params;
    const instructorId = req.user!.userId;

    const result = await deleteSectionService(sectionId, instructorId);

    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      data: formatMongoData(result),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
