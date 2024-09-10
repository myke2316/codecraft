import express from "express";
import {
  deleteSubmission,
  getSubmissionsByAssignmentId,
  getSubmissionByStudentAndAssignment,
  getSubmissionsByClassId,
  submitAssignment,
  downloadSubmissionFile,
  teacherSubmitFeedback,
} from "../../controller/teacherFunction/submissionController.js";
import { assignmentUpload } from "../../sandboxUserFiles/gridFs.js";

const router = express.Router();

// Route for submitting assignments with file upload
router.post("/submit", assignmentUpload.single("zipFile"), submitAssignment);

// Route for deleting submissions
router.delete("/delete/:submissionId", deleteSubmission);

router.get("/submissions/class/:classId", getSubmissionsByClassId);
router.get(
  "/submissions/:assignmentId/:studentId",
  getSubmissionByStudentAndAssignment
);
router.get(
  "/submissions/get/assignment/:assignmentId",
  getSubmissionsByAssignmentId
);
router.get("/download/submission/:submissionId", downloadSubmissionFile);
router.patch("/submissions/:submissionId/feedback", teacherSubmitFeedback);
export { router as submissionRouter };
