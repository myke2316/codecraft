import express from "express";
import { getAllCourse } from "../controller/courseController.js";

const router = express.Router();

router.get("/fetch", getAllCourse);

export { router as courseRouter };
