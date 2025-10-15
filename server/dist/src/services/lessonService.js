import Course from "../models/Course";
import Section from "../models/Section";
import Lesson from "../models/Lesson";
import UserNote from "../models/UserNote";
import UserProgress from "../models/UserProgress";
import { deleteFromCloudinary } from "../middlewares/course-upload.middleware";
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
    // Handle uploaded files
    const lessonPayload = { ...lessonData };
    // Parse quiz data if it's a JSON string
    if (lessonData.quiz && typeof lessonData.quiz === "string") {
        try {
            lessonPayload.quiz = JSON.parse(lessonData.quiz);
        }
        catch (error) {
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
        lessonPayload.resources = lessonData.uploadedFiles.resources.map((resource) => ({
            url: resource.url,
            publicId: resource.publicId,
            name: resource.name,
        }));
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
        }
        catch (error) {
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
    let finalResources = [];
    const payload = updatePayload;
    if (payload.existingResources && Array.isArray(payload.existingResources)) {
        const existingResourcesFromDB = lesson.resources?.filter((dbResource) => payload.existingResources.some((clientResource) => clientResource.url === dbResource.url)) || [];
        finalResources = [...existingResourcesFromDB];
    }
    if (updatePayload.uploadedFiles?.resources) {
        const newUploadedResources = updatePayload.uploadedFiles.resources.map((resource) => ({
            name: resource.name,
            url: resource.url,
            publicId: resource.publicId,
            type: resource.name.split(".").pop()?.toLowerCase()
                ? "pdf"
                : "other",
        }));
        finalResources = [...finalResources, ...newUploadedResources];
    }
    if (lesson.resources?.length) {
        const resourcesToDelete = lesson.resources.filter((oldResource) => !finalResources.some((newResource) => newResource.url === oldResource.url));
        if (resourcesToDelete.length > 0) {
            await Promise.all(resourcesToDelete.map((resource) => deleteFromCloudinary(resource.publicId, "raw")));
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
export const deleteLessonService = async (courseId, lessonId, instructorId) => {
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
