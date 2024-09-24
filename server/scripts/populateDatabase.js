import mongoose from "mongoose";
import CourseModel  from "../models/courseModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the current file path 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read and parse the JSON file
const jsonData = fs.readFileSync(
  path.resolve(__dirname, "../data/php.json"),//change location if thertes new updated  course data
  "utf-8"
);
const coursesData = JSON.parse(jsonData);

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://codecraft:leianmyke@codecraft.3m6wuiq.mongodb.net/codecraft?retryWrites=true&w=majority"
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", async () => {
  console.log("Connected to MongoDB");

  try {
    // // Clear existing data
    // await CourseModel.deleteMany({});
    // console.log("Existing data cleared");

    // Populate database with course data
    for (const courseData of coursesData.courses) {
      const course = new CourseModel(courseData);
      await course.save();
    }

    console.log("Database populated with course data");
  } catch (error) {
    console.error("Error populating database:", error);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
});
