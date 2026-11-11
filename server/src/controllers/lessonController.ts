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
import Enrollment from "../models/Enrollment";
import { EnrollmentStatus } from "../types/enrollment.types";
import { UserRole } from "../types/user.types";

const getCourseId = (lesson: any): string =>
  lesson.course?._id?.toString() || lesson.course?.toString();

const hasFullLessonAccess = async (lesson: any, req: AuthRequest) => {
  if (!req.user) return false;
  if (req.user.role === UserRole.ADMIN) return true;

  const courseId = getCourseId(lesson);
  const instructorId =
    lesson.course?.instructor?._id?.toString() ||
    lesson.course?.instructor?.toString();

  if (instructorId === req.user.userId) return true;

  return Boolean(
    await Enrollment.exists({
      user: req.user.userId,
      course: courseId,
      status: EnrollmentStatus.ACTIVE,
    }),
  );
};

const isPublishedPreview = (lesson: any) =>
  lesson.isPreview === true &&
  lesson.course?.isPublished === true &&
  lesson.course?.status === "approved";

const redactLessonContent = (lesson: any) => {
  const safeLesson = lesson.toObject ? lesson.toObject() : { ...lesson };
  safeLesson.video = undefined;
  safeLesson.resources = [];
  safeLesson.quiz = [];
  return safeLesson;
};

export const getAllLessonsController = async (
  req: AuthRequest,
  res: Response,
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
      instructorId,
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
    const { courseId, lessonId }: any = req.params;
    const instructorId = req.user!.userId;
    const lessonData = req.body;

    const lesson = await updateLessonService(
      courseId,
      lessonId,
      lessonData,
      instructorId,
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
    const { courseId, lessonId }: any = req.params;
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
    const { courseId, sectionId, lessonId }: any = req.params;
    const userId = req.user!.userId;
    const noteData = req.body;

    const note = await addNoteToLessonService(
      courseId,
      sectionId,
      lessonId,
      noteData,
      userId,
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
    const { sectionId }: any = req.params;

    const lessons = await getLessonsBySectionService(sectionId);
    const safeLessons = await Promise.all(
      lessons.map(async (lesson) => {
        if (await hasFullLessonAccess(lesson, req)) return lesson;
        return isPublishedPreview(lesson) ? lesson : redactLessonContent(lesson);
      }),
    );

    res.status(200).json({
      success: true,
      data: formatMongoData(safeLessons),
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
    const { lessonId }: any = req.params;

    const lesson = await getLessonByIdService(lessonId);

    if (
      !(await hasFullLessonAccess(lesson, req)) &&
      !isPublishedPreview(lesson)
    ) {
      return res.status(req.user ? 403 : 401).json({
        success: false,
        message: "Enrollment is required to access this lesson",
      });
    }

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
  res: Response,
) => {
  try {
    const { courseId, sectionId, lessonId }: any = req.params;
    const userId = req.user!.userId;

    const notes = await getUserNotesForLessonService(
      courseId,
      sectionId,
      lessonId,
      userId,
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
