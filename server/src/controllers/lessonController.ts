import { Response } from "express";
import { AuthRequest } from "../types/common.types";
import {
  createLessonService,
  getAllLessons,
  getLessonsBySectionService,
  getLessonByIdService,
  updateLessonService,
  deleteLessonService,
  addNoteToLessonService,
  getUserNotesForLessonService,
} from "../services/lessonService";
import formatMongoData from "../utils/formatMongoData";

export const getAllLessonsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const lessons = await getAllLessons();

    res.status(200).json({
      success: true,
      data: formatMongoData(lessons),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const addLesson = async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user!.userId;
    const lessonData = req.body;

    const lesson = await createLessonService(
      lessonData.course,
      lessonData.section,
      lessonData,
      instructorId
    );

    res.status(201).json({
      success: true,
      message: "Lesson added successfully",
      data: formatMongoData(lesson),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateLesson = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, lessonId } = req.params;
    const instructorId = req.user!.userId;
    const lessonData = req.body;

    const lesson = await updateLessonService(
      courseId,
      lessonId,
      lessonData,
      instructorId
    );

    res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      data: formatMongoData(lesson),
    });
  } catch (error: any) {
    console.error("Error updating lesson:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteLesson = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, lessonId } = req.params;
    const instructorId = req.user!.userId;

    const result = await deleteLessonService(courseId, lessonId, instructorId);

    res.status(200).json({
      success: true,
      message: "Lesson deleted successfully",
      data: formatMongoData(result),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const addNoteToLesson = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, sectionId, lessonId } = req.params;
    const userId = req.user!.userId;
    const noteData = req.body;

    const note = await addNoteToLessonService(
      courseId,
      sectionId,
      lessonId,
      noteData,
      userId
    );

    res.status(201).json({
      success: true,
      message: "Note added successfully",
      data: formatMongoData(note),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLessonsBySection = async (req: AuthRequest, res: Response) => {
  try {
    const { sectionId } = req.params;

    const lessons = await getLessonsBySectionService(sectionId);

    res.status(200).json({
      success: true,
      data: formatMongoData(lessons),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLessonById = async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId } = req.params;

    const lesson = await getLessonByIdService(lessonId);

    res.status(200).json({
      success: true,
      data: formatMongoData(lesson),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserNotesForLesson = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { courseId, sectionId, lessonId } = req.params;
    const userId = req.user!.userId;

    const notes = await getUserNotesForLessonService(
      courseId,
      sectionId,
      lessonId,
      userId
    );

    res.status(200).json({
      success: true,
      data: formatMongoData(notes),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
