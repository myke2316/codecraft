import express from "express";
import {
  addAnswer,
  createQuestion,
  getQuestionById,
  getQuestions,
  updateAnswer,
  updateQuestion,
  deleteAnswer,
  deleteQuestion,
  getAnswerById,
  voteAnswer,
  voteQuestion,
  getQuestionVotes,
  getAnswerVotes,
  getUserVotes,
  updateAnswerStatus,
  fetchAnswers,
} from "../../controller/QnAController/questionsController.js";

const router = express.Router();

// Route to fetch all questions
router.get("/fetch", getQuestions);

// Route to fetch a single question by ID
router.get("/fetch/:id", getQuestionById);

// Route to create a new question
router.post("/create", createQuestion);

// Route to update an existing question
router.put("/update/:questionId", updateQuestion);

// Route to add an answer to a question
router.post("/answer/:questionId", addAnswer);

//Route to update an answer
router.put("/update/answer/:questionId/:answerId", updateAnswer);

// Route to delete a question
router.delete("/delete/:id", deleteQuestion);

// Route to delete an answer
router.delete("/delete/:questionId/:answerId", deleteAnswer);

//get an answer by id
router.get("/questions/:questionId/answers/:answerId", getAnswerById);

//VOTING ROUTERS
router.post("/questions/:questionId/vote", voteQuestion);
router.get("/questions/:questionId/allVote", getQuestionVotes);
router.post("/questions/:questionId/answers/:answerId/vote", voteAnswer);
router.get("/questions/:questionId/answers/:answerId/allVote", getAnswerVotes);
router.get("/questions/answer/:userId/allVote", getUserVotes);
router.put(
  "/answers/:answerId/status",
  updateAnswerStatus
);
router.get("/question-answers", fetchAnswers);
export { router as questionRouter };
