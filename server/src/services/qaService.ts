import { FilterQuery } from "mongoose";
import Question from "../models/Question";
import Answer from "../models/Answer";
import Course from "../models/Course";
import Lesson from "../models/Lesson";
import {
  CreateQuestionRequest,
  UpdateQuestionRequest,
  CreateAnswerRequest,
  UpdateAnswerRequest,
  QuestionsQuery,
  AnswersQuery,
} from "../types/qa.types";

// Question Services
export const createQuestion = async (
  courseId: string | string[],
  userId: string,
  questionData: CreateQuestionRequest,
) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.studentsEnrolled.includes(userId as any)) {
    throw new Error("You must be enrolled in this course to ask questions");
  }

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
  courseId: string | string[],
  query: QuestionsQuery = {},
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

  if (lessonId) {
    filter.lesson = lessonId;
  }

  if (answered === "true") {
    filter.acceptedAnswer = { $exists: true, $ne: null };
  } else if (answered === "false") {
    filter.acceptedAnswer = { $exists: false };
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  if (tags) {
    const tagArray = tags.split(",").map((tag) => tag.trim());
    filter.tags = { $in: tagArray };
  }

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

export const getQuestionById = async (
  questionId: string | string[],
  userId?: string,
) => {
  const question = await Question.findById(questionId).populate([
    { path: "user", select: "firstName lastName avatar" },
    { path: "course", select: "title" },
    { path: "lesson", select: "title" },
  ]);

  if (!question) {
    throw new Error("Question not found");
  }

  const answers = await Answer.find({ question: questionId })
    .populate("user", "firstName lastName avatar")
    .sort({ createdAt: -1 });

  if (userId) {
    (question as any).userVoteType = question.getUserVoteType(userId);

    answers.forEach((answer: any) => {
      answer.userVoteType = answer.getUserVoteType(userId);
      const isAccepted =
        question.acceptedAnswer?.toString() === answer._id.toString();

      answer.isAccepted = isAccepted;
      answer._isAccepted = isAccepted;

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
  questionId: string | string[],
  userId: string,
  updateData: UpdateQuestionRequest,
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

export const deleteQuestion = async (
  questionId: string | string[],
  userId: string,
) => {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.user.toString() !== userId) {
    throw new Error("You can only delete your own questions");
  }

  await Answer.deleteMany({ question: questionId });

  await Question.findByIdAndDelete(questionId);

  return { message: "Question deleted successfully" };
};

export const voteOnQuestion = async (
  questionId: string | string[],
  userId: string,
  voteType: "upvote" | "downvote",
) => {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.user.toString() === userId) {
    throw new Error("You cannot vote on your own question");
  }

  question.upvotes = question.upvotes.filter((id) => id.toString() !== userId);
  question.downvotes = question.downvotes.filter(
    (id) => id.toString() !== userId,
  );

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
  questionId: string | string[],
  userId: string,
  answerData: CreateAnswerRequest,
) => {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new Error("Question not found");
  }

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
  answerId: string | string[],
  userId: string,
  updateData: UpdateAnswerRequest,
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

export const deleteAnswer = async (
  answerId: string | string[],
  userId: string,
) => {
  const answer = await Answer.findById(answerId);

  if (!answer) {
    throw new Error("Answer not found");
  }

  if (answer.user.toString() !== userId) {
    throw new Error("You can only delete your own answers");
  }

  const question = await Question.findById(answer.question);
  if (question?.acceptedAnswer?.toString() === answerId) {
    question.acceptedAnswer = undefined;
    await question.save();
  }

  await Answer.findByIdAndDelete(answerId);

  return { message: "Answer deleted successfully" };
};

export const voteOnAnswer = async (
  answerId: string | string[],
  userId: string,
  voteType: "upvote" | "downvote",
) => {
  const answer = await Answer.findById(answerId);

  if (!answer) {
    throw new Error("Answer not found");
  }

  if (answer.user.toString() === userId) {
    throw new Error("You cannot vote on your own answer");
  }

  answer.upvotes = answer.upvotes.filter((id) => id.toString() !== userId);
  answer.downvotes = answer.downvotes.filter((id) => id.toString() !== userId);

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
  questionId: string | string[],
  answerId: string | string[],
  userId: string,
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
