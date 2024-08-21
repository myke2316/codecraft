import express from "express";
import {
  createClass,
  deleteClass,
  fetchAllClass,
  fetchClass,
  fetchClassById,
  joinClass,
  removeStudentFromClass,
  updateClassName,
} from "../controller/classController.js";

const router = express.Router();

router.post("/createClass", createClass);
router.get("/fetchAllClass", fetchAllClass);
router.get("/fetchClass/:userId", fetchClass);
router.get("/fetchClassId/:classId", fetchClassById);
router.post("/joinClass", joinClass);
router.put("/updateClass", updateClassName);
router.delete("/remove-student", removeStudentFromClass);
router.delete("/delete-class/:classId", deleteClass);
export { router as classRouter };
