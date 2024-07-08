import express from "express";

import {
  createUserProgress,
  getUserProgress,
  updateUserProgress,
} from "../controller/studentCourseProgressController.js";

const router = express.Router();

router.post("/fetch", getUserProgress);
router.post("/create", createUserProgress);
router.post("/update", updateUserProgress);

export { router as progressRouter };
