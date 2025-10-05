import Course from "../models/Course";
import Section from "../models/Section";
import Lesson from "../models/Lesson";
import UserNote from "../models/UserNote";
import {
  ILesson,
  CreateLessonData,
  UpdateLessonData,
} from "../types/lesson.types";
import UserProgress from "../models/UserProgress";
import { deleteFromCloudinary } from "../middlewares/course-upload.middleware";

export const getAllLessons = async (): Promise<ILesson[]> => {
  const lessons = await Lesson.find({})
    .populate("course", "title instructor")
    .populate("section", "title")
    .sort({ createdAt: -1 })
    .lean();

  return lessons;
};

export const createLessonService = async (
  courseId: string,
  sectionId: string,
  lessonData: CreateLessonData,
  instructorId: string
): Promise<ILesson> => {
  const course = await Course.findOne({
    _id: courseId,
    instructor: instructorId,
  });

  if (!course) {
    throw new Error("Course not found or you are not authorized to modify it");
  }

  const section = await Section.findOne({
    _id: sectionId,
    course: courseId,
  });

  if (!section) {
    throw new Error("Section not found");
  }

  if (!lessonData.order) {
    const lastLesson = await Lesson.findOne({
      section: sectionId,
    })
      .sort({ order: -1 })
      .populate("section")
      .populate("course");
    lessonData.order = lastLesson ? lastLesson.order + 1 : 1;
  }

  // Handle uploaded files
  const lessonPayload = { ...lessonData };

  if (lessonData.uploadedFiles?.video) {
    lessonPayload.video = {
      url: lessonData.uploadedFiles.video.url,
      publicId: lessonData.uploadedFiles.video.publicId,
    };
  }

  if (lessonData.uploadedFiles?.resources) {
    lessonPayload.resources = lessonData.uploadedFiles.resources.map(
      (resource: any) => ({
        url: resource.url,
        publicId: resource.publicId,
        name: resource.name,
      })
    );
  }

  // Remove uploadedFiles from payload before saving
  delete lessonPayload.uploadedFiles;

  const lesson = new Lesson({
    ...lessonPayload,
    course: courseId,
    section: sectionId,
  });

  await lesson.save();

  course.lastUpdated = new Date();
  await course.save();

  return lesson;
};

export const getLessonsBySectionService = async (
  sectionId: string
): Promise<ILesson[]> => {
  const lessons = await Lesson.find({
    section: sectionId,
  })
    .sort({ order: 1 })
    .populate("section")
    .populate("course");

  return lessons;
};

export const getLessonByIdService = async (
  lessonId: string
): Promise<ILesson> => {
  const lesson = await Lesson.findById(lessonId)
    .populate("section")
    .populate("course");

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  return lesson;
};

export const updateLessonService = async (
  courseId: string,
  lessonId: string,
  lessonData: UpdateLessonData,
  instructorId: string
): Promise<ILesson> => {
  const course = await Course.findOne({
    _id: courseId,
    instructor: instructorId,
  });

  if (!course) {
    throw new Error("Course not found or you are not authorized to modify it");
  }

  const lesson = await Lesson.findOne({
    _id: lessonId,
    course: courseId,
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // Handle file updates
  const updatePayload = { ...lessonData };

  // Handle video update
  if (updatePayload.uploadedFiles?.video) {
    // Delete old video if exists
    if (lesson.video?.publicId) {
      await deleteFromCloudinary(lesson.video.publicId, "video");
    }

    updatePayload.video = {
      url: updatePayload.uploadedFiles.video.url,
      publicId: updatePayload.uploadedFiles.video.publicId,
    };
  }

  // Handle resources update
  if (updatePayload.uploadedFiles?.resources) {
    // Delete old resources if they're being replaced
    if (lesson.resources?.length) {
      await Promise.all(
        lesson.resources.map((resource) =>
          deleteFromCloudinary(resource.publicId, "raw")
        )
      );
    }

    updatePayload.resources = updatePayload.uploadedFiles.resources.map(
      (resource) => ({
        name: resource.name,
        url: resource.url,
        publicId: resource.publicId,
        type: (resource.name.split(".").pop()?.toLowerCase() as any) || "other",
      })
    );
  }

  // Remove uploadedFiles from payload before saving
  delete updatePayload.uploadedFiles;

  // Update lesson
  Object.assign(lesson, updatePayload);
  await lesson.save();

  course.lastUpdated = new Date();
  await course.save();

  return lesson;
};

export const deleteLessonService = async (
  courseId: string,
  lessonId: string,
  instructorId: string
): Promise<{ message: string }> => {
  const course = await Course.findOne({
    _id: courseId,
    instructor: instructorId,
  });

  if (!course) {
    throw new Error("Course not found or you are not authorized to modify it");
  }

  const lesson = await Lesson.findOne({
    _id: lessonId,
    course: courseId,
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // Delete files from Cloudinary
  const deletionPromises = [];

  // Delete video
  if (lesson.video?.publicId) {
    deletionPromises.push(deleteFromCloudinary(lesson.video.publicId, "video"));
  }

  // Delete resources
  if (lesson.resources?.length) {
    lesson.resources.forEach((resource) => {
      deletionPromises.push(deleteFromCloudinary(resource.publicId, "raw"));
    });
  }

  // Wait for all Cloudinary deletions to complete
  await Promise.allSettled(deletionPromises);

  // Delete related data
  await UserNote.deleteMany({ lesson: lessonId });
  await UserProgress.deleteMany({ lesson: lessonId });

  // Delete lesson
  await lesson.deleteOne();

  course.lastUpdated = new Date();
  await course.save();

  return { message: "Lesson and all related files deleted successfully" };
};

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

export const getUserNotesForLessonService = async (
  courseId: string,
  sectionId: string,
  lessonId: string,
  userId: string
) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.studentsEnrolled.includes(userId as any)) {
    throw new Error("You must be enrolled in this course to view notes");
  }

  const lesson = await Lesson.findOne({
    _id: lessonId,
    section: sectionId,
    course: courseId,
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  const notes = await UserNote.find({
    user: userId,
    lesson: lessonId,
  }).sort({ timestamp: 1 });

  return notes;
};
