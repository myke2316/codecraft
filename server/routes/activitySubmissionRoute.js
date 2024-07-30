import express from "express";
import { createActivitySubmissions, getActivitySubmissions, updateActivitySubmission } from "../controller/activitySubmissionController.js";




const router = express.Router();

// Route to fetch activity submissions for a user
router.post("/fetch", getActivitySubmissions);

// Route to create new activity submissions for a user
router.post("/create", createActivitySubmissions);

// Route to update an existing activity submission
router.put("/update", updateActivitySubmission);

export { router as activitySubmissionRouter };
 