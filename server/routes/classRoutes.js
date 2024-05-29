import express from "express";
import { createClass, fetchClass } from "../controller/classController.js";

const router = express.Router();

router.post("/createClass", createClass);
router.get("/fetchClass/:teacherId", fetchClass);
export { router as classRouter };
