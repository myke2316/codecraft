import express from "express";
import {
  getAllCourse,
  updateActivity,
  updateCourseTitle,
  updateDocument,
  updateLessonTitle,
  updateQuiz,
} from "../controller/courseController.js";

const router = express.Router();

router.get("/fetch", getAllCourse);
//Course Management Updating

//Course Updating Routes
router.put("/update-course-title", updateCourseTitle);
router.put("/update-lesson-title", updateLessonTitle);
router.put("/update-quiz", updateQuiz);
router.put("/update-activity", updateActivity);
router.put("/update-document", updateDocument);
//Course Management Adding
//Course Creating/Adding Routes
export { router as courseRouter };
