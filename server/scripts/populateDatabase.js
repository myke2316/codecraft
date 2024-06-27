import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import CourseModel from "../models/courseModel.js";
dotenv.config();
// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to populate the database
const populateDatabase = async () => {
  const conn = await mongoose.connect(
    "mongodb+srv://codecraft:leianmyke@codecraft.3m6wuiq.mongodb.net/codecraft?retryWrites=true&w=majority"
  );

  try {
    // Read the JSON file
    const dataPath = path.join(__dirname, "../data/courses.json");
    const courseData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

    // Clear the existing data
    await CourseModel.deleteMany({});

    // Insert the new data
    for (const courseName in courseData) {
      if (courseData.hasOwnProperty(courseName)) {
        const course = new CourseModel({
          name: courseName,
          lessons: courseData[courseName].lessons,
        });
        await course.save();
      }
    }

    console.log("Database populated successfully");
  } catch (error) {
    console.error("Error populating database:", error);
  } finally {
    await mongoose.disconnect();
  }
};

// Call the populate function
populateDatabase();
