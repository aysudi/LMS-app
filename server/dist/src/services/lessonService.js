import Course from "../models/Course";
import Section from "../models/Section";
import Lesson from "../models/Lesson";
import UserNote from "../models/UserNote";
import UserProgress from "../models/UserProgress";
export const getAllLessons = async () => {
    const lessons = await Lesson.find({})
        .populate("course", "title instructor")
        .populate("section", "title")
        .sort({ createdAt: -1 })
        .lean();
    return lessons;
};
export const createLessonService = async (courseId, sectionId, lessonData, instructorId) => {
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
    const lesson = new Lesson({
        ...lessonData,
        course: courseId,
        section: sectionId,
    });
    await lesson.save();
    course.lastUpdated = new Date();
    await course.save();
    return lesson;
};
export const getLessonsBySectionService = async (sectionId) => {
    const lessons = await Lesson.find({
        section: sectionId,
    })
        .sort({ order: 1 })
        .populate("section")
        .populate("course");
    return lessons;
};
export const getLessonByIdService = async (lessonId) => {
    const lesson = await Lesson.findById(lessonId)
        .populate("section")
        .populate("course");
    if (!lesson) {
        throw new Error("Lesson not found");
    }
    return lesson;
};
export const updateLessonService = async (courseId, lessonId, lessonData, instructorId) => {
    const course = await Course.findOne({
        _id: courseId,
        instructor: instructorId,
    });
    if (!course) {
        throw new Error("Course not found or you are not authorized to modify it");
    }
    const lesson = await Lesson.findOneAndUpdate({
        _id: lessonId,
        course: courseId,
    }, lessonData, { new: true, runValidators: true });
    if (!lesson) {
        throw new Error("Lesson not found");
    }
    course.lastUpdated = new Date();
    await course.save();
    return lesson;
};
export const deleteLessonService = async (courseId, lessonId, instructorId) => {
    const course = await Course.findOne({
        _id: courseId,
        instructor: instructorId,
    });
    if (!course) {
        throw new Error("Course not found or you are not authorized to modify it");
    }
    await UserNote.deleteMany({ lesson: lessonId });
    await UserProgress.deleteMany({ lesson: lessonId });
    const lesson = await Lesson.findOneAndDelete({
        _id: lessonId,
        course: courseId,
    });
    if (!lesson) {
        throw new Error("Lesson not found");
    }
    course.lastUpdated = new Date();
    await course.save();
    return { message: "Lesson deleted successfully" };
};
export const addNoteToLessonService = async (courseId, sectionId, lessonId, noteData, userId) => {
    // Verify course exists and user is enrolled
    const course = await Course.findById(courseId);
    if (!course) {
        throw new Error("Course not found");
    }
    if (!course.studentsEnrolled.includes(userId)) {
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
export const getUserNotesForLessonService = async (courseId, sectionId, lessonId, userId) => {
    const course = await Course.findById(courseId);
    if (!course) {
        throw new Error("Course not found");
    }
    if (!course.studentsEnrolled.includes(userId)) {
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
