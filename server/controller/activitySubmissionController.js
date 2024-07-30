import mongoose from "mongoose";
import CourseModel from "../models/courseModel.js";
import UserModel from "../models/userModel.js";
import ActivitySubmissionModel from "../models/activityModels/activitySubmissionModel.js";

const getActivitySubmissions = async (req, res) => {
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    const activitySubmissions = await ActivitySubmissionModel.findOne({ userId });

    if (!activitySubmissions) {
      return res
        .status(404)
        .json({ message: "No activity submissions found for the user" });
    }
    res.json(activitySubmissions);
  } catch (error) {
    console.error("Error fetching activity submissions: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createActivitySubmissions = async (req, res) => {
  const { userId } = req.body;

  try {
    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user already has an activity submission
    const existingActivitySubmission = await ActivitySubmissionModel.findOne({ userId });
    if (existingActivitySubmission) {
      return res
        .status(400)
        .json({ message: "Activity submission already exists for this user" });
    }

    // Fetch all courses with populated lessons and activities
    const courses = await CourseModel.find()
      .populate({
        path: "lessons",
        populate: {
          path: "activities",
          model: "Activity",
        },
      })
      .exec();

    const courseSubmissions = courses.map(course => ({
      courseId: course._id,
      lessons: course.lessons.map(lesson => ({
        lessonId: lesson._id,
        activities: lesson.activities.map(activity => ({
          activityId: activity._id,
          html: "",
          css: "",
          js: "",
          passed: false,
          pointsEarned: 0,
          timeTaken: 0,
          tries: 3,
          timestamp: new Date()
        }))
      }))
    }));

    // Create a new activity submission document
    const newActivitySubmission = new ActivitySubmissionModel({
      userId,
      courses: courseSubmissions,
    });

    await newActivitySubmission.save();

    res.status(201).json(newActivitySubmission);
  } catch (error) {
    console.error("Error creating activity submissions: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateActivitySubmission = async (req, res) => {
  const { userId, activityId, html, css, js, passed, pointsEarned, timeTaken, tries } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(activityId)
  ) {
    return res.status(400).json({ message: "Invalid userId or activityId" });
  }

  try {
    const updatedSubmission = await ActivitySubmissionModel.findOneAndUpdate(
      { userId, "courses.lessons.activities.activityId": activityId },
      {
        $set: {
          "courses.$[course].lessons.$[lesson].activities.$[activity].html": html,
          "courses.$[course].lessons.$[lesson].activities.$[activity].css": css,
          "courses.$[course].lessons.$[lesson].activities.$[activity].js": js,
          "courses.$[course].lessons.$[lesson].activities.$[activity].passed": passed,
          "courses.$[course].lessons.$[lesson].activities.$[activity].pointsEarned": pointsEarned,
          "courses.$[course].lessons.$[lesson].activities.$[activity].timeTaken": timeTaken,
          "courses.$[course].lessons.$[lesson].activities.$[activity].tries": tries,
          "courses.$[course].lessons.$[lesson].activities.$[activity].timestamp": new Date(),
        },
      },
      {
        arrayFilters: [
          { "course._id": { $exists: true } },
          { "lesson._id": { $exists: true } },
          { "activity.activityId": new mongoose.Types.ObjectId(activityId) },
        ],
        new: true,
      }
    );

    if (!updatedSubmission) {
      return res.status(404).json({ message: "Activity submission not found" });
    }

    return res.status(200).json(updatedSubmission);
  } catch (error) {
    console.error("Error updating activity submission: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { createActivitySubmissions, getActivitySubmissions, updateActivitySubmission };