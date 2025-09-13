import Course from "../models/Course";
import Section from "../models/Section";
import Lesson from "../models/Lesson";
import UserNote from "../models/UserNote";
import {
  ILesson,
  CreateLessonData,
  UpdateLessonData,
  LessonQuery,
} from "../types/lesson.types";

// Create lesson
export const createLessonService = async (
  courseId: string,
  sectionId: string,
  lessonData: CreateLessonData,
  instructorId: string
): Promise<ILesson> => {
  // Verify course ownership
  const course = await Course.findOne({
    _id: courseId,
    instructor: instructorId,
  });

  if (!course) {
    throw new Error("Course not found or you are not authorized to modify it");
  }

  // Verify section exists and belongs to course
  const section = await Section.findOne({
    _id: sectionId,
    course: courseId,
  });

  if (!section) {
    throw new Error("Section not found");
  }

  // Set order if not provided
  if (!lessonData.order) {
    const lastLesson = await Lesson.findOne({
      section: sectionId,
    }).sort({ order: -1 });
    lessonData.order = lastLesson ? lastLesson.order + 1 : 1;
  }

  // Create lesson
  const lesson = new Lesson({
    ...lessonData,
    course: courseId,
    section: sectionId,
  });

  await lesson.save();

  // Update course lastUpdated
  course.lastUpdated = new Date();
  await course.save();

  return lesson;
};

// Get all lessons for a section
export const getLessonsBySectionService = async (
  courseId: string,
  sectionId: string,
  userId?: string
): Promise<ILesson[]> => {
  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  // Verify section exists and belongs to course
  const section = await Section.findOne({
    _id: sectionId,
    course: courseId,
  });

  if (!section) {
    throw new Error("Section not found");
  }

  // Get lessons for this section
  const lessons = await Lesson.find({
    section: sectionId,
  }).sort({ order: 1 });

  return lessons;
};

// Get lesson by ID
export const getLessonByIdService = async (
  courseId: string,
  sectionId: string,
  lessonId: string,
  userId?: string
): Promise<ILesson> => {
  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  // Verify section exists and belongs to course
  const section = await Section.findOne({
    _id: sectionId,
    course: courseId,
  });

  if (!section) {
    throw new Error("Section not found");
  }

  // Get lesson
  const lesson = await Lesson.findOne({
    _id: lessonId,
    section: sectionId,
    course: courseId,
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  return lesson;
};

// Update lesson
export const updateLessonService = async (
  courseId: string,
  sectionId: string,
  lessonId: string,
  lessonData: UpdateLessonData,
  instructorId: string
): Promise<ILesson> => {
  // Verify course ownership
  const course = await Course.findOne({
    _id: courseId,
    instructor: instructorId,
  });

  if (!course) {
    throw new Error("Course not found or you are not authorized to modify it");
  }

  // Verify section exists and belongs to course
  const section = await Section.findOne({
    _id: sectionId,
    course: courseId,
  });

  if (!section) {
    throw new Error("Section not found");
  }

  // Update lesson
  const lesson = await Lesson.findOneAndUpdate(
    {
      _id: lessonId,
      section: sectionId,
      course: courseId,
    },
    lessonData,
    { new: true, runValidators: true }
  );

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // Update course lastUpdated
  course.lastUpdated = new Date();
  await course.save();

  return lesson;
};

// Delete lesson
export const deleteLessonService = async (
  courseId: string,
  sectionId: string,
  lessonId: string,
  instructorId: string
): Promise<{ message: string }> => {
  // Verify course ownership
  const course = await Course.findOne({
    _id: courseId,
    instructor: instructorId,
  });

  if (!course) {
    throw new Error("Course not found or you are not authorized to modify it");
  }

  // Verify section exists and belongs to course
  const section = await Section.findOne({
    _id: sectionId,
    course: courseId,
  });

  if (!section) {
    throw new Error("Section not found");
  }

  // Delete lesson
  const lesson = await Lesson.findOneAndDelete({
    _id: lessonId,
    section: sectionId,
    course: courseId,
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // Update course lastUpdated
  course.lastUpdated = new Date();
  await course.save();

  return { message: "Lesson deleted successfully" };
};

// Add note to lesson
export const addNoteToLessonService = async (
  courseId: string,
  sectionId: string,
  lessonId: string,
  noteData: any,
  userId: string
) => {
  // Verify course exists and user is enrolled
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.studentsEnrolled.includes(userId as any)) {
    throw new Error("You must be enrolled in this course to add notes");
  }

  // Verify section exists and belongs to course
  const section = await Section.findOne({
    _id: sectionId,
    course: courseId,
  });

  if (!section) {
    throw new Error("Section not found");
  }

  // Verify lesson exists
  const lesson = await Lesson.findOne({
    _id: lessonId,
    section: sectionId,
    course: courseId,
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // Create user note
  const userNote = new UserNote({
    user: userId,
    course: courseId,
    lesson: lessonId,
    content: noteData.content,
    timestamp: noteData.timestamp || 0,
  });

  await userNote.save();
  return userNote;
};

// Get user notes for a lesson
export const getUserNotesForLessonService = async (
  courseId: string,
  sectionId: string,
  lessonId: string,
  userId: string
) => {
  // Verify course exists and user is enrolled
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.studentsEnrolled.includes(userId as any)) {
    throw new Error("You must be enrolled in this course to view notes");
  }

  // Verify lesson exists
  const lesson = await Lesson.findOne({
    _id: lessonId,
    section: sectionId,
    course: courseId,
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // Get user notes for this lesson
  const notes = await UserNote.find({
    user: userId,
    lesson: lessonId,
  }).sort({ timestamp: 1 });

  return notes;
};
