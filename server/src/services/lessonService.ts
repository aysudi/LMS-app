import Course from "../models/Course.js";
import Section from "../models/Section.js";
import Lesson from "../models/Lesson.js";
import UserNote from "../models/UserNote.js";
import {
  ILesson,
  CreateLessonData,
  UpdateLessonData,
} from "../types/lesson.types.js";
import UserProgress from "../models/UserProgress.js";
import { deleteFromCloudinary } from "../middlewares/course-upload.middleware.js";

export const getAllLessons = async (): Promise<ILesson[]> => {
  const lessons: any = await Lesson.find({})
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
  instructorId: string,
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

  const lessonPayload = { ...lessonData };

  if (lessonData.quiz && typeof lessonData.quiz === "string") {
    try {
      lessonPayload.quiz = JSON.parse(lessonData.quiz);
    } catch (error) {
      console.error("Error parsing quiz data:", error);
      lessonPayload.quiz = [];
    }
  }

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
      }),
    );
  }

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
  sectionId: string,
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
  lessonId: string,
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
  instructorId: string,
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

  const updatePayload = { ...lessonData };

  if (updatePayload.quiz && typeof updatePayload.quiz === "string") {
    try {
      updatePayload.quiz = JSON.parse(updatePayload.quiz);
    } catch (error) {
      console.error("Error parsing quiz data:", error);
      updatePayload.quiz = [];
    }
  }

  if (updatePayload.uploadedFiles?.video) {
    if (lesson.video?.publicId) {
      await deleteFromCloudinary(lesson.video.publicId, "video");
    }

    updatePayload.video = {
      url: updatePayload.uploadedFiles.video.url,
      publicId: updatePayload.uploadedFiles.video.publicId,
    };
  }

  let finalResources: any[] = [];
  const payload = updatePayload as any;

  if (payload.existingResources && Array.isArray(payload.existingResources)) {
    const existingResourcesFromDB =
      lesson.resources?.filter((dbResource: any) =>
        payload.existingResources.some(
          (clientResource: any) => clientResource.url === dbResource.url,
        ),
      ) || [];

    finalResources = [...existingResourcesFromDB];
  }

  if (updatePayload.uploadedFiles?.resources) {
    const newUploadedResources = updatePayload.uploadedFiles.resources.map(
      (resource) => ({
        name: resource.name,
        url: resource.url,
        publicId: resource.publicId,
        type: (resource.name.split(".").pop()?.toLowerCase() as any)
          ? "pdf"
          : "other",
      }),
    );
    finalResources = [...finalResources, ...newUploadedResources];
  }

  if (lesson.resources?.length) {
    const resourcesToDelete = lesson.resources.filter(
      (oldResource: any) =>
        !finalResources.some(
          (newResource) => newResource.url === oldResource.url,
        ),
    );

    if (resourcesToDelete.length > 0) {
      await Promise.all(
        resourcesToDelete.map((resource: any) =>
          deleteFromCloudinary(resource.publicId, "raw"),
        ),
      );
    }
  }

  updatePayload.resources = finalResources;

  delete updatePayload.uploadedFiles;
  delete payload.existingResources;

  Object.assign(lesson, updatePayload);
  await lesson.save();

  course.lastUpdated = new Date();
  await course.save();

  return lesson;
};

export const deleteLessonService = async (
  courseId: string,
  lessonId: string,
  instructorId: string,
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

  const deletionPromises = [];

  if (lesson.video?.publicId) {
    deletionPromises.push(deleteFromCloudinary(lesson.video.publicId, "video"));
  }

  if (lesson.resources?.length) {
    lesson.resources.forEach((resource: any) => {
      deletionPromises.push(deleteFromCloudinary(resource.publicId, "raw"));
    });
  }

  await Promise.allSettled(deletionPromises);

  await UserNote.deleteMany({ lesson: lessonId });
  await UserProgress.deleteMany({ lesson: lessonId });

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
  userId: string,
) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.studentsEnrolled.includes(userId as any)) {
    throw new Error("You must be enrolled in this course to add notes");
  }

  const section = await Section.findOne({
    _id: sectionId,
    course: courseId,
  });

  if (!section) {
    throw new Error("Section not found");
  }

  const lesson = await Lesson.findOne({
    _id: lessonId,
    section: sectionId,
    course: courseId,
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

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
  userId: string,
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
