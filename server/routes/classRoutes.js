import express from "express";
import {
  createClass,
  fetchClass,
  joinClass,
} from "../controller/classController.js";

const router = express.Router();

router.post("/createClass", createClass);
router.get("/fetchClass/:userId", fetchClass);
router.post("/joinClass", joinClass);
export { router as classRouter };
