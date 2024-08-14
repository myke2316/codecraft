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
router.get("/questions/:questionId/answers/:answerId", getAnswerById);
export { router as questionRouter };
