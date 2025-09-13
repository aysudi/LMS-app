import Section from "../models/Section";
import Lesson from "../models/Lesson";
import Course from "../models/Course";
import mongoose from "mongoose";
import {
  ISection,
  CreateSectionData,
  UpdateSectionData,
  SectionWithLessonCount,
  SectionQuery,
} from "../types/section.types";

// Get all sections for a course
export const getSectionsByCourse = async (
  courseId: string
): Promise<ISection[]> => {
  const sections = await Section.find({ course: courseId })
    .sort({ order: 1 })
    .lean();

  return sections;
};

// Get section by ID
export const getSectionById = async (sectionId: string): Promise<ISection> => {
  const section = await Section.findById(sectionId)
    .populate("course", "title instructor")
    .lean();

  if (!section) {
    throw new Error("Section not found");
  }

  return section;
};

// Create new section
export const createSection = async (
  sectionData: CreateSectionData,
  instructorId: string
): Promise<ISection> => {
  // Verify course exists and instructor owns it
  const course = await Course.findOne({
    _id: sectionData.courseId,
    instructor: instructorId,
  });

  if (!course) {
    throw new Error("Course not found or you are not authorized to modify it");
  }

  // Set order if not provided
  let order = sectionData.order;
  if (!order) {
    const lastSection = await Section.findOne({ course: sectionData.courseId })
      .sort({ order: -1 })
      .select("order");
    order = lastSection ? lastSection.order + 1 : 1;
  }

  const section = new Section({
    title: sectionData.title,
    description: sectionData.description,
    order,
    course: sectionData.courseId,
  });

  await section.save();
  return section.populate("course", "title instructor");
};

// Update section
export const updateSection = async (
  sectionId: string,
  updateData: UpdateSectionData,
  instructorId: string
): Promise<ISection> => {
  const section = await Section.findById(sectionId).populate("course");

  if (!section) {
    throw new Error("Section not found");
  }

  // Check if instructor owns the course
  if ((section.course as any).instructor.toString() !== instructorId) {
    throw new Error("You are not authorized to update this section");
  }

  Object.assign(section, updateData);
  await section.save();

  return section;
};

// Delete section
export const deleteSection = async (
  sectionId: string,
  instructorId: string
): Promise<{ message: string }> => {
  const section = await Section.findById(sectionId).populate("course");

  if (!section) {
    throw new Error("Section not found");
  }

  // Check if instructor owns the course
  if ((section.course as any).instructor.toString() !== instructorId) {
    throw new Error("You are not authorized to delete this section");
  }

  // Delete all lessons in this section first
  await Lesson.deleteMany({ section: sectionId });

  // Delete the section
  await Section.deleteOne({ _id: sectionId });

  return { message: "Section and its lessons deleted successfully" };
};

// Get sections with lesson counts
export const getSectionsWithLessonCount = async (
  courseId: string
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
        lessons: 0, // Remove the lessons array, keep only count
      },
    },
    { $sort: { order: 1 } },
  ]);

  return sections;
};

// Legacy functions for backward compatibility (will be removed)
export const addSectionService = createSection;
export const updateSectionService = updateSection;
export const deleteSectionService = deleteSection;
