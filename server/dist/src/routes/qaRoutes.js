import express from "express";
import { authenticateToken, optionalAuth, } from "../middlewares/auth.middleware.js";
import { createQuestionController, getQuestionsController, getQuestionController, updateQuestionController, deleteQuestionController, voteQuestionController, createAnswerController, updateAnswerController, deleteAnswerController, voteAnswerController, acceptAnswerController, } from "../controllers/qaController.js";
const qaRouter = express.Router();
// Question Routes
// GET /api/courses/:courseId/questions - Get all questions for a course
qaRouter.get("/courses/:courseId/questions", optionalAuth, (req, res) => getQuestionsController(req, res));
// POST /api/courses/:courseId/questions - Create new question
qaRouter.post("/courses/:courseId/questions", authenticateToken, (req, res) => createQuestionController(req, res));
// GET /api/questions/:questionId - Get specific question with answers
qaRouter.get("/questions/:questionId", optionalAuth, (req, res) => getQuestionController(req, res));
// PUT /api/questions/:questionId - Update question (author only)
qaRouter.put("/questions/:questionId", authenticateToken, (req, res) => updateQuestionController(req, res));
// DELETE /api/questions/:questionId - Delete question (author only)
qaRouter.delete("/questions/:questionId", authenticateToken, (req, res) => deleteQuestionController(req, res));
// POST /api/questions/:questionId/vote - Vote on question
qaRouter.post("/questions/:questionId/vote", authenticateToken, (req, res) => voteQuestionController(req, res));
// Answer Routes
// POST /api/questions/:questionId/answers - Create new answer
qaRouter.post("/questions/:questionId/answers", authenticateToken, (req, res) => createAnswerController(req, res));
// PUT /api/answers/:answerId - Update answer (author only)
qaRouter.put("/answers/:answerId", authenticateToken, (req, res) => updateAnswerController(req, res));
// DELETE /api/answers/:answerId - Delete answer (author only)
qaRouter.delete("/answers/:answerId", authenticateToken, (req, res) => deleteAnswerController(req, res));
// POST /api/answers/:answerId/vote - Vote on answer
qaRouter.post("/answers/:answerId/vote", authenticateToken, (req, res) => voteAnswerController(req, res));
// POST /api/questions/:questionId/answers/:answerId/accept - Accept answer (question author only)
qaRouter.post("/questions/:questionId/answers/:answerId/accept", authenticateToken, (req, res) => acceptAnswerController(req, res));
export default qaRouter;
