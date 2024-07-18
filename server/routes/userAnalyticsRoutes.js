import express from "express";
import {
  addBadgeToUser,
  getUserAnalytics,
  getUserBadges,
  updateUserAnalytics,
} from "../controller/userAnalyticsController.js";
import { createUserAnalytics } from "../controller/studentCourseProgressController.js";

const router = express.Router();

router.post("/fetch", getUserAnalytics);
router.post("/create", createUserAnalytics);
router.post("/update", updateUserAnalytics);
router.post("/addBadge", addBadgeToUser);
router.post("/fetchBadge", getUserBadges);

export { router as analyticsRouter };
