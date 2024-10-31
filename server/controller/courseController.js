import asyncHandler from "express-async-handler";

import CourseModel from "../models/courseModel.js";

const getAllCourse = asyncHandler(async (req, res) => {
  
  try {
    const courses = await CourseModel.find({});
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

export { getAllCourse };
