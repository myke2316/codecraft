import express from "express";
import {
  addBadgeToUser,
  getAllUserAnalytics,
  getUserAnalytics,
  getUserBadges,
  updateUserAnalytics,
} from "../controller/userAnalyticsController.js";
import { createUserAnalytics } from "../controller/studentCourseProgressController.js";

const router = express.Router();

router.post("/fetch", getUserAnalytics);
router.post("/create", createUserAnalytics);
router.put("/update", updateUserAnalytics);
router.post("/addBadge", addBadgeToUser);
router.post("/fetchBadge", getUserBadges);
router.get("/fetchAllAnalytics", getAllUserAnalytics);
export { router as analyticsRouter };
