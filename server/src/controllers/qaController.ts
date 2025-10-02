import { Response } from "express";
import { AuthRequest } from "../types/common.types.js";
import {
  createQuestion,
  getQuestionsByCourse,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  voteOnQuestion,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  voteOnAnswer,
  acceptAnswer,
} from "../services/qaService.js";
import {
  CreateQuestionRequest,
  UpdateQuestionRequest,
  CreateAnswerRequest,
  UpdateAnswerRequest,
  QuestionsQuery,
  VoteRequest,
} from "../types/qa.types.js";

// Question Controllers
export const createQuestionController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;
    const questionData: CreateQuestionRequest = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const question = await createQuestion(courseId, userId, questionData);

    res.status(201).json({
      success: true,
      data: {
        question,
        message: "Question created successfully",
      },
    });
  } catch (error: any) {
    console.error("Create question error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create question",
    });
  }
};

export const getQuestionsController = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const query: QuestionsQuery = req.query;

    const result = await getQuestionsByCourse(courseId, query);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Get questions error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to get questions",
    });
  }
};

export const getQuestionController = async (req: AuthRequest, res: Response) => {
  try {
    const { questionId } = req.params;
    const userId = req.user?.id;

    const result = await getQuestionById(questionId, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Get question error:", error);
    res.status(404).json({
      success: false,
      message: error.message || "Question not found",
    });
  }
};

export const updateQuestionController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { questionId } = req.params;
    const updateData: UpdateQuestionRequest = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const question = await updateQuestion(questionId, userId, updateData);

    res.json({
      success: true,
      data: {
        question,
        message: "Question updated successfully",
      },
    });
  } catch (error: any) {
    console.error("Update question error:", error);
    const statusCode = error.message.includes("not found") ? 404 : 
                       error.message.includes("only update your own") ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update question",
    });
  }
};

export const deleteQuestionController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { questionId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await deleteQuestion(questionId, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Delete question error:", error);
    const statusCode = error.message.includes("not found") ? 404 : 
                       error.message.includes("only delete your own") ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete question",
    });
  }
};

export const voteQuestionController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { questionId } = req.params;
    const { type }: VoteRequest = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!["upvote", "downvote"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vote type. Must be 'upvote' or 'downvote'",
      });
    }

    const result = await voteOnQuestion(questionId, userId, type);

    res.json({
      success: true,
      data: {
        ...result,
        message: `Question ${type}d successfully`,
      },
    });
  } catch (error: any) {
    console.error("Vote question error:", error);
    const statusCode = error.message.includes("not found") ? 404 : 
                       error.message.includes("cannot vote on your own") ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to vote on question",
    });
  }
};

// Answer Controllers
export const createAnswerController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { questionId } = req.params;
    const answerData: CreateAnswerRequest = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const answer = await createAnswer(questionId, userId, answerData);

    res.status(201).json({
      success: true,
      data: {
        answer,
        message: "Answer created successfully",
      },
    });
  } catch (error: any) {
    console.error("Create answer error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create answer",
    });
  }
};

export const updateAnswerController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { answerId } = req.params;
    const updateData: UpdateAnswerRequest = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const answer = await updateAnswer(answerId, userId, updateData);

    res.json({
      success: true,
      data: {
        answer,
        message: "Answer updated successfully",
      },
    });
  } catch (error: any) {
    console.error("Update answer error:", error);
    const statusCode = error.message.includes("not found") ? 404 : 
                       error.message.includes("only update your own") ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update answer",
    });
  }
};

export const deleteAnswerController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { answerId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await deleteAnswer(answerId, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Delete answer error:", error);
    const statusCode = error.message.includes("not found") ? 404 : 
                       error.message.includes("only delete your own") ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete answer",
    });
  }
};

export const voteAnswerController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { answerId } = req.params;
    const { type }: VoteRequest = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!["upvote", "downvote"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vote type. Must be 'upvote' or 'downvote'",
      });
    }

    const result = await voteOnAnswer(answerId, userId, type);

    res.json({
      success: true,
      data: {
        ...result,
        message: `Answer ${type}d successfully`,
      },
    });
  } catch (error: any) {
    console.error("Vote answer error:", error);
    const statusCode = error.message.includes("not found") ? 404 : 
                       error.message.includes("cannot vote on your own") ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to vote on answer",
    });
  }
};

export const acceptAnswerController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { questionId, answerId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await acceptAnswer(questionId, answerId, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Accept answer error:", error);
    const statusCode = error.message.includes("not found") ? 404 : 
                       error.message.includes("Only the question author") ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to accept answer",
    });
  }
};
