import express from "express";
import {
  createClass,
  fetchClass,
  fetchClassById,
  joinClass,
  removeStudentFromClass,
  updateClassName,
} from "../controller/classController.js";

const router = express.Router();

router.post("/createClass", createClass);
router.get("/fetchClass/:userId", fetchClass);
router.get("/fetchClassId/:classId", fetchClassById);
router.post("/joinClass", joinClass);
router.put("/updateClass", updateClassName);
router.delete("/remove-student", removeStudentFromClass);
export { router as classRouter };
