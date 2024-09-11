import express from "express";
import File from "./fileModel.js"; // Update with the correct path to your File model
import mongoose from "mongoose";
import { gfs, sandboxUpload, upload } from "./gridFs.js";
import { uploadFile } from "./fileController.js";

const router = express.Router();



router.post("/upload", sandboxUpload.single("file"), uploadFile);

export { router as fileRoutes };
