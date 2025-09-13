import { Response } from "express";
import { AuthRequest } from "../types/common.types";
import {
  createLessonService,
  getLessonsBySectionService,
  getLessonByIdService,
  updateLessonService,
  deleteLessonService,
  addNoteToLessonService,
  getUserNotesForLessonService,
} from "../services/lessonService";

export const addLesson = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, sectionId } = req.params;
    const instructorId = req.user!.userId;
    const lessonData = req.body;

    const lesson = await createLessonService(
      courseId,
      sectionId,
      lessonData,
      instructorId
    );

    res.status(201).json({
      success: true,
      message: "Lesson added successfully",
      data: lesson,
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
    const { courseId, sectionId, lessonId } = req.params;
    const instructorId = req.user!.userId;
    const lessonData = req.body;

    const lesson = await updateLessonService(
      courseId,
      sectionId,
      lessonId,
      lessonData,
      instructorId
    );

    res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      data: lesson,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteLesson = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, sectionId, lessonId } = req.params;
    const instructorId = req.user!.userId;

    const result = await deleteLessonService(
      courseId,
      sectionId,
      lessonId,
      instructorId
    );

    res.status(200).json({
      success: true,
      message: "Lesson deleted successfully",
      data: result,
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
      data: note,
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
    const { courseId, sectionId } = req.params;
    const userId = req.user?.userId;

    const lessons = await getLessonsBySectionService(
      courseId,
      sectionId,
      userId
    );

    res.status(200).json({
      success: true,
      data: lessons,
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
    const { courseId, sectionId, lessonId } = req.params;
    const userId = req.user?.userId;

    const lesson = await getLessonByIdService(
      courseId,
      sectionId,
      lessonId,
      userId
    );

    res.status(200).json({
      success: true,
      data: lesson,
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
      data: notes,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
