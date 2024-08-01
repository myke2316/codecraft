import express from "express";
import {
  createActivitySubmissions,
  decrementTries,
  getActivitySubmissions,
  updateActivitySubmission,
} from "../controller/activitySubmissionController.js";

const router = express.Router();

// Route to fetch activity submissions for a user
router.post("/fetch", getActivitySubmissions);

// Route to create new activity submissions for a user
router.post("/create", createActivitySubmissions);

// Route to update an existing activity submission
router.put("/update", updateActivitySubmission);
router.put("/decrementTries", decrementTries);
export { router as activitySubmissionRouter };
