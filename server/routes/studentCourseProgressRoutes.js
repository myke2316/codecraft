import express from "express";

import {
  createUserProgress,
  getAllProgress,
  getUserProgress,
  updateUserProgress,
} from "../controller/studentCourseProgressController.js";

const router = express.Router();

router.post("/fetch", getUserProgress);
router.post("/create", createUserProgress);
router.post("/update", updateUserProgress);
router.get("/getAllProgress", getAllProgress);
export { router as progressRouter };
