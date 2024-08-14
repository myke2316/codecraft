
import mongoose from "mongoose";
import CourseModel from "../models/courseModel.js";
import QuizSubmissionModel from "../models/quizSubmissionModel.js";
import UserModel from "../models/userModel.js";

const getQuizSubmissions = async (req, res) => {
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    const quizSubmissions = await QuizSubmissionModel.findOne({ userId });

    if (!quizSubmissions) {
      return res
        .status(404)
        .json({ message: "No quiz submissions found for the user" });
    }
    res.json(quizSubmissions);
  } catch (error) {
    console.error("Error fetching quiz submissions: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createQuizSubmissions = async (req, res) => {
  const { userId } = req.body;

  try {
    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user already has a quiz submission
    const existingQuizSubmission = await QuizSubmissionModel.findOne({ userId });
    if (existingQuizSubmission) {
      return res
        .status(400)
        .json({ message: "Quiz submission already exists for this user" });
    }

    // Fetch all courses with populated lessons and quizzes
    const courses = await CourseModel.find()
      .populate({
        path: "lessons",
        populate: {
          path: "quiz",
          model: "Quiz",
        },
      })
      .exec();

    const courseSubmissions = courses.map(course => ({
      courseId: course._id,
      lessons: course.lessons.map(lesson => ({
        lessonId: lesson._id,
        quizzes: lesson.quiz.map(quiz => ({
          quizId: quiz._id,
          question: quiz.question,
          selectedOption: null,
          correct: false,
          pointsEarned: 0,
          correctAnswer: quiz.correctAnswer
        }))
      }))
    }));

    // Create a new quiz submission document
    const newQuizSubmission = new QuizSubmissionModel({
      userId,
      courses: courseSubmissions,
    });

    await newQuizSubmission.save();

    res.status(201).json(newQuizSubmission);
  } catch (error) {
    console.error("Error creating quiz submissions: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateQuizSubmission = async (req, res) => {
  const { userId, quizId, selectedOption, correct, pointsEarned } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(quizId)
  ) {
    return res.status(400).json({ message: "Invalid userId or quizId" });
  }

  try {
    const updatedSubmission = await QuizSubmissionModel.findOneAndUpdate(
      { userId, "courses.lessons.quizzes.quizId": quizId },
      {
        $set: {
          "courses.$[course].lessons.$[lesson].quizzes.$[quiz].selectedOption": selectedOption,
          "courses.$[course].lessons.$[lesson].quizzes.$[quiz].correct": correct,
          "courses.$[course].lessons.$[lesson].quizzes.$[quiz].pointsEarned": pointsEarned,
          "courses.$[course].lessons.$[lesson].quizzes.$[quiz].timestamp": new Date(),
        },
      },
      {
        arrayFilters: [
          { "course._id": { $exists: true } },
          { "lesson._id": { $exists: true } },
          { "quiz.quizId": new mongoose.Types.ObjectId(quizId) },
        ],
        new: true,
      }
    );

    if (!updatedSubmission) {
      return res.status(404).json({ message: "Quiz submission not found" });
    }

    return res.status(200).json(updatedSubmission);
  } catch (error) {
    console.error("Error updating quiz submission: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { createQuizSubmissions, getQuizSubmissions, updateQuizSubmission };
