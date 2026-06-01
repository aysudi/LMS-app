import Section from "../models/Section.js";
import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";
import {
  ISection,
  CreateSectionData,
  UpdateSectionData,
  SectionWithLessonCount,
} from "../types/section.types.js";
import UserProgress from "../models/UserProgress.js";
import UserNote from "../models/UserNote.js";

export const getAllSections = async (): Promise<ISection[]> => {
  const sections = await Section.find({})
    .populate("course", "title instructor")
    .populate({
      path: "lessons",
      options: { sort: { order: 1 } },
    })
    .sort({ createdAt: -1 })
    .lean();

  return sections as unknown as ISection[];
};

export const getSectionsByCourse = async (
  courseId: string | string[],
): Promise<ISection[]> => {
  const sections = await Section.find({ course: courseId })
    .populate({
      path: "lessons",
      options: { sort: { order: 1 } },
    })
    .sort({ order: 1 });

  return sections;
};

export const getSectionById = async (
  sectionId: string | string[],
): Promise<ISection> => {
  const section: any = await Section.findById(sectionId)
    .populate("course", "title instructor")
    .populate({
      path: "lessons",
      options: { sort: { order: 1 } },
    })
    .lean();

  if (!section) {
    throw new Error("Section not found");
  }

  return section;
};

import { deleteFromCloudinary } from "../middlewares/course-upload.middleware.js";

export const createSection = async (
  sectionData: CreateSectionData,
  instructorId: string,
): Promise<ISection> => {
  const course = await Course.findOne({
    _id: sectionData.course,
    instructor: instructorId,
  });

  if (!course) {
    throw new Error("Course not found or you are not authorized to modify it");
  }

  let order = sectionData.order;
  if (!order) {
    const lastSection = await Section.findOne({ course: sectionData.course })
      .sort({ order: -1 })
      .select("order");
    order = lastSection ? lastSection.order + 1 : 1;
  }

  const sectionPayload: Partial<ISection> = {
    title: sectionData.title,
    description: sectionData.description,
    order,
    course: new mongoose.Types.ObjectId(sectionData.course),
    thumbnail: undefined,
  };

  if (sectionData.uploadedFiles?.thumbnail) {
    sectionPayload.thumbnail = {
      url: sectionData.uploadedFiles.thumbnail.url,
      publicId: sectionData.uploadedFiles.thumbnail.publicId,
    };
  }

  const section = new Section(sectionPayload);
  await section.save();
  return section.populate("course", "title instructor");
};

export const updateSection = async (
  sectionId: string | string[],
  updateData: UpdateSectionData,
  instructorId: string,
): Promise<ISection> => {
  const section = await Section.findById(sectionId).populate("course");

  if (!section) {
    throw new Error("Section not found");
  }

  if ((section.course as any).instructor.toString() !== instructorId) {
    throw new Error("You are not authorized to update this section");
  }

  const updatePayload = { ...updateData };

  if (updatePayload.uploadedFiles?.thumbnail) {
    if (section.thumbnail?.publicId) {
      await deleteFromCloudinary(section.thumbnail.publicId, "image");
    }

    updatePayload.thumbnail = {
      url: updatePayload.uploadedFiles.thumbnail.url,
      publicId: updatePayload.uploadedFiles.thumbnail.publicId,
    };
  }

  delete updatePayload.uploadedFiles;

  Object.assign(section, updatePayload);
  await section.save();

  return section;
};

export const deleteSection = async (
  sectionId: string | string[],
  instructorId: string,
): Promise<{ message: string }> => {
  const section = await Section.findById(sectionId).populate("course");

  if (!section) {
    throw new Error("Section not found");
  }

  if ((section.course as any).instructor.toString() !== instructorId) {
    throw new Error("You are not authorized to delete this section");
  }

  const lessonIds = await Lesson.find({ section: sectionId }).distinct("_id");

  await UserNote.deleteMany({ lesson: { $in: lessonIds } });

  await UserProgress.deleteMany({ lesson: { $in: lessonIds } });

  await Lesson.deleteMany({ section: sectionId });

  await Section.deleteOne({ _id: sectionId });

  return { message: "Section and its lessons deleted successfully" };
};

export const getSectionsWithLessonCount = async (
  courseId: string,
): Promise<SectionWithLessonCount[]> => {
  const sections = await Section.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    {
      $lookup: {
        from: "lessons",
        localField: "_id",
        foreignField: "section",
        as: "lessons",
      },
    },
    {
      $addFields: {
        lessonCount: { $size: "$lessons" },
      },
    },
    {
      $project: {
        lessons: 0,
      },
    },
    { $sort: { order: 1 } },
  ]);

  return sections;
};

export const addSectionService = createSection;
export const updateSectionService = updateSection;
export const deleteSectionService = deleteSection;
