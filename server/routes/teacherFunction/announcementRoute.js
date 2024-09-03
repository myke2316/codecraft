import express from "express";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  getAnnouncementsByClass,
  updateAnnouncement,
} from "../../controller/teacherFunction/announcementController.js";

const router = express.Router();

// Route to create a new announcement
router.post("/createAnnouncement", createAnnouncement);

// Route to get all announcements for a specific class
router.get("/class/:classId/announcement", getAnnouncementsByClass);

// Route to get a specific announcement by ID
router.get("/:id/announcement", getAnnouncementById);

// Route to update an announcement by ID
router.put("/:id/update/announcement", updateAnnouncement);

// Route to delete an announcement by ID
router.delete("/:id/delete/announcement", deleteAnnouncement);

export { router as announcementRouter };
