import { FilterQuery } from "mongoose";
import Question from "../models/Question.js";
import Answer from "../models/Answer.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import {
  CreateQuestionRequest,
  UpdateQuestionRequest,
  CreateAnswerRequest,
  UpdateAnswerRequest,
  QuestionsQuery,
  AnswersQuery,
} from "../types/qa.types.js";

// Question Services
export const createQuestion = async (
  courseId: string,
  userId: string,
  questionData: CreateQuestionRequest
) => {
  // Verify course exists and user is enrolled
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.studentsEnrolled.includes(userId as any)) {
    throw new Error("You must be enrolled in this course to ask questions");
  }

  // Verify lesson exists if provided
  if (questionData.lessonId) {
    const lesson = await Lesson.findOne({
      _id: questionData.lessonId,
      course: courseId,
    });
    if (!lesson) {
      throw new Error("Lesson not found in this course");
    }
  }

  const question = new Question({
    course: courseId,
    lesson: questionData.lessonId || null,
    user: userId,
    title: questionData.title,
    content: questionData.content,
    tags: questionData.tags || [],
  });

  await question.save();
  return question.populate([
    { path: "user", select: "firstName lastName avatar" },
    { path: "course", select: "title" },
    { path: "lesson", select: "title" },
  ]);
};

export const getQuestionsByCourse = async (
  courseId: string,
  query: QuestionsQuery = {}
) => {
  const {
    page = 1,
    limit = 10,
    lessonId,
    search,
    tags,
    answered = "all",
    sortBy = "newest",
  } = query;

  const filter: FilterQuery<any> = { course: courseId };

  // Filter by lesson
  if (lessonId) {
    filter.lesson = lessonId;
  }

  // Filter by answered status
  if (answered === "true") {
    filter.acceptedAnswer = { $exists: true, $ne: null };
  } else if (answered === "false") {
    filter.acceptedAnswer = { $exists: false };
  }

  // Text search
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by tags
  if (tags) {
    const tagArray = tags.split(",").map((tag) => tag.trim());
    filter.tags = { $in: tagArray };
  }

  // Sorting
  let sort: any = {};
  switch (sortBy) {
    case "oldest":
      sort = { createdAt: 1 };
      break;
    case "popular":
      sort = { upvotes: -1, createdAt: -1 };
      break;
    case "unanswered":
      sort = { acceptedAnswer: 1, createdAt: -1 };
      break;
    default: // newest
      sort = { createdAt: -1 };
  }

  const skip = (page - 1) * limit;
  const total = await Question.countDocuments(filter);

  const questions = await Question.find(filter)
    .populate([
      { path: "user", select: "firstName lastName avatar" },
      { path: "course", select: "title" },
      { path: "lesson", select: "title" },
    ])
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return {
    questions,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalQuestions: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

export const getQuestionById = async (questionId: string, userId?: string) => {
  const question = await Question.findById(questionId).populate([
    { path: "user", select: "firstName lastName avatar" },
    { path: "course", select: "title" },
    { path: "lesson", select: "title" },
  ]);

  if (!question) {
    throw new Error("Question not found");
  }

  // Get answers for this question
  const answers = await Answer.find({ question: questionId })
    .populate("user", "firstName lastName avatar")
    .sort({ createdAt: -1 });

  // Add user vote information if userId provided
  if (userId) {
    // Add userVoteType to question
    (question as any).userVoteType = question.getUserVoteType(userId);

    // Add userVoteType and isAccepted to answers
    answers.forEach((answer: any) => {
      answer.userVoteType = answer.getUserVoteType(userId);
      const isAccepted =
        question.acceptedAnswer?.toString() === answer._id.toString();

      // Set isAccepted in multiple ways to ensure it's serialized
      answer.isAccepted = isAccepted;
      answer._isAccepted = isAccepted;

      // Force the property to be enumerable for JSON serialization
      Object.defineProperty(answer, "isAccepted", {
        value: isAccepted,
        enumerable: true,
        writable: true,
        configurable: true,
      });
    });
  }

  return {
    question,
    answers,
    totalAnswers: answers.length,
  };
};

export const updateQuestion = async (
  questionId: string,
  userId: string,
  updateData: UpdateQuestionRequest
) => {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.user.toString() !== userId) {
    throw new Error("You can only update your own questions");
  }

  Object.assign(question, updateData);
  await question.save();

  return question.populate([
    { path: "user", select: "firstName lastName avatar" },
    { path: "course", select: "title" },
    { path: "lesson", select: "title" },
  ]);
};

export const deleteQuestion = async (questionId: string, userId: string) => {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.user.toString() !== userId) {
    throw new Error("You can only delete your own questions");
  }

  // Delete all answers for this question
  await Answer.deleteMany({ question: questionId });

  // Delete the question
  await Question.findByIdAndDelete(questionId);

  return { message: "Question deleted successfully" };
};

export const voteOnQuestion = async (
  questionId: string,
  userId: string,
  voteType: "upvote" | "downvote"
) => {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.user.toString() === userId) {
    throw new Error("You cannot vote on your own question");
  }

  // Remove any existing vote
  question.upvotes = question.upvotes.filter((id) => id.toString() !== userId);
  question.downvotes = question.downvotes.filter(
    (id) => id.toString() !== userId
  );

  // Add new vote
  if (voteType === "upvote") {
    question.upvotes.push(userId as any);
  } else {
    question.downvotes.push(userId as any);
  }

  await question.save();

  return {
    voteScore: question.voteScore,
    userVoteType: voteType,
  };
};

// Answer Services
export const createAnswer = async (
  questionId: string,
  userId: string,
  answerData: CreateAnswerRequest
) => {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new Error("Question not found");
  }

  // Verify user is enrolled in the course
  const course = await Course.findById(question.course);
  if (!course || !course.studentsEnrolled.includes(userId as any)) {
    throw new Error("You must be enrolled in this course to answer questions");
  }

  const answer = new Answer({
    question: questionId,
    user: userId,
    content: answerData.content,
  });

  await answer.save();
  return answer.populate("user", "firstName lastName avatar");
};

export const updateAnswer = async (
  answerId: string,
  userId: string,
  updateData: UpdateAnswerRequest
) => {
  const answer = await Answer.findById(answerId);

  if (!answer) {
    throw new Error("Answer not found");
  }

  if (answer.user.toString() !== userId) {
    throw new Error("You can only update your own answers");
  }

  answer.content = updateData.content;
  await answer.save();

  return answer.populate("user", "firstName lastName avatar");
};

export const deleteAnswer = async (answerId: string, userId: string) => {
  const answer = await Answer.findById(answerId);

  if (!answer) {
    throw new Error("Answer not found");
  }

  if (answer.user.toString() !== userId) {
    throw new Error("You can only delete your own answers");
  }

  // If this was the accepted answer, remove it from question
  const question = await Question.findById(answer.question);
  if (question?.acceptedAnswer?.toString() === answerId) {
    question.acceptedAnswer = undefined;
    await question.save();
  }

  await Answer.findByIdAndDelete(answerId);

  return { message: "Answer deleted successfully" };
};

export const voteOnAnswer = async (
  answerId: string,
  userId: string,
  voteType: "upvote" | "downvote"
) => {
  const answer = await Answer.findById(answerId);

  if (!answer) {
    throw new Error("Answer not found");
  }

  if (answer.user.toString() === userId) {
    throw new Error("You cannot vote on your own answer");
  }

  // Remove any existing vote
  answer.upvotes = answer.upvotes.filter((id) => id.toString() !== userId);
  answer.downvotes = answer.downvotes.filter((id) => id.toString() !== userId);

  // Add new vote
  if (voteType === "upvote") {
    answer.upvotes.push(userId as any);
  } else {
    answer.downvotes.push(userId as any);
  }

  await answer.save();

  return {
    voteScore: answer.voteScore,
    userVoteType: voteType,
  };
};

export const acceptAnswer = async (
  questionId: string,
  answerId: string,
  userId: string
) => {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.user.toString() !== userId) {
    throw new Error("Only the question author can accept answers");
  }

  const answer = await Answer.findById(answerId);

  if (!answer || answer.question.toString() !== questionId) {
    throw new Error("Answer not found for this question");
  }

  if (question.acceptedAnswer?.toString() === answerId) {
    question.acceptedAnswer = undefined;
  } else {
    question.acceptedAnswer = answerId as any;
  }

  await question.save();

  return {
    acceptedAnswer: question.acceptedAnswer?.toString() || null,
    message: question.acceptedAnswer ? "Answer accepted" : "Answer unaccepted",
  };
};
