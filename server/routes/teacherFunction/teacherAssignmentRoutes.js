import express from "express";
import { upload } from "../../sandboxUserFiles/gridFs.js";
import {
  createAssignment,
  getAssignmentById,
  getImageById,
} from "../../controller/teacherFunction/teacherAssignmentController.js";

const router = express.Router();

// Route for creating an assignment (with image upload)
router.post("/create", upload.single("image"), createAssignment);

// Route for retrieving an assignment by ID
router.get("/get/:id", getAssignmentById);

// Route for retrieving an image from GridFS by file ID
router.get("/images/:fileId", getImageById);

export { router as assignmentRouter };
