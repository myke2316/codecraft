import express from "express";
import { deleteSubmission, submitAssignment } from "../../controller/teacherFunction/submissionController";

const router = express.Router();

// Route for submitting an assignment
router.post("/submit", submitAssignment);

// Route for deleting a submission
router.delete("/delete/:submissionId", deleteSubmission);

export default router;
