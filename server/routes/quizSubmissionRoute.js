import express from "express";
import {
  createQuizSubmissions,
  getQuizSubmissions,
  updateQuizSubmission,
} from "../controller/quizSubmissionController.js";

const router = express.Router();

router.post("/fetch", getQuizSubmissions);
router.post("/create", createQuizSubmissions);
router.put("/update", updateQuizSubmission);

export { router as quizSubmissionRouter };
