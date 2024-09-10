import express from "express";
import { upload } from "../../sandboxUserFiles/gridFs.js";
import {
  createAssignment,
  deleteAssignment,
  editAssignment,
  getAssignmentById,
  getAssignmentsByClassId,
  getImageById,
} from "../../controller/teacherFunction/teacherAssignmentController.js";

const router = express.Router();

// Route for creating an assignment (with image upload)
router.post("/create", upload.single("image"), createAssignment);

// Route for retrieving an assignment by ID
router.get("/get/class/:classId", getAssignmentsByClassId);
router.get("/get/assignment/:assignmentId", getAssignmentById);
// Route for retrieving an image from GridFS by file ID
router.get("/images/:fileId", getImageById);
router.delete("/delete/:assignmentId",deleteAssignment)
router.put("/edit/:assignmentId",upload.single('image'),editAssignment)
export { router as assignmentRouter };
