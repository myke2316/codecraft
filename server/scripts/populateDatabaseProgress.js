import mongoose from "mongoose";
import UserProgressModel from "../models/studentCourseProgressModel.js"; // Adjust the path
import CourseModel from "../models/courseModel.js"; // Adjust the path
import UserModel from "../models/userModel.js"; // Adjust the path

mongoose.connect(
  "mongodb+srv://codecraft:leianmyke@codecraft.3m6wuiq.mongodb.net/codecraft?retryWrites=true&w=majority"
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", async () => {
  console.log("Connected to MongoDB");

  try {
    const courses = await CourseModel.find().exec();
    const users = await UserModel.find().exec();

    for (const user of users) {
      if (user.role === "teacher") continue;

      const userProgress = new UserProgressModel({
        userId: user._id,
        coursesProgress: [],
      });

      courses.forEach((course) => {
        const courseProgress = {
          courseId: course._id,
          lessonsProgress: [],
          totalPointsEarned: 0,
          completed: false,
        };

        course.lessons.forEach((lesson) => {
          const lessonProgress = {
            lessonId: lesson._id,
            documentsProgress: [],
            quizzesProgress: [],
            codingActivitiesProgress: [],
            totalPointsEarned: 0,
            completed: false,
          };

          lesson.documents.forEach((document) => {
            lessonProgress.documentsProgress.push({
              documentId: document._id,
              completed: false,
            });
          });

          lesson.quiz.forEach((quiz) => {
            lessonProgress.quizzesProgress.push({
              quizId: quiz._id,
              completed: false,
              pointsEarned: 0,
            });
          });

          lesson.codingActivity.forEach((activity) => {
            lessonProgress.codingActivitiesProgress.push({
              activityId: activity._id,
              completed: false,
              pointsEarned: 0,
            });
          });

          courseProgress.lessonsProgress.push(lessonProgress);
        });

        userProgress.coursesProgress.push(courseProgress);
      });

      await userProgress.save();
      console.log(`User progress created for user ${user._id}`);
    }
  } catch (err) {
    console.error("Error creating user progress:", err);
  } finally {
    mongoose.connection.close();
  }
});
