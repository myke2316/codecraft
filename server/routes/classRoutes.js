import express from "express";
import {
  createClass,
  deleteClass,
  fetchAllClass,
  fetchClass,
  fetchClassById,
  fetchCompletedStudents,
  joinClass,
  removeStudentFromClass,
  updateClassName,
  updateInviteCode,
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
router.get("/completed-students/:classId?", fetchCompletedStudents);
router.put("/class/update-invite-code", updateInviteCode);
export { router as classRouter };
