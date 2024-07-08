import asyncHandler from "express-async-handler";
import UserProgressModel from "../models/studentCourseProgressModel.js";
import CourseModel from "../models/courseModel.js";
import UserModel from "../models/userModel.js";

// Get user progress by user ID
const getUserProgress = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const userProgress = await UserProgressModel.findOne({ userId });

  if (!userProgress) {
    return res.status(404).json({ message: "User progress not found" });
  }
  res.json(userProgress);
});

// Create User Progress for each student
const createUserProgress = asyncHandler(async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await UserModel.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is a teacher
    if (user.role === "teacher") {
      return res
        .status(400)
        .json({ message: "Teachers do not need progress tracking" });
    }

    // Check if user progress already exists
    const existingUserProgress = await UserProgressModel.findOne({ userId });
    if (existingUserProgress) {
      return res.status(400).json({ message: "User progress already exists" });
    }

    const userProgress = new UserProgressModel({ userId, coursesProgress: [] });

    const courses = await CourseModel.find().exec();
    courses.forEach((course) => {
      const courseProgress = {
        courseId: course._id,
        lessonsProgress: [],
        totalPointsEarned: 0,
        locked: course.locked || false,
      };

      if (Array.isArray(course.lessons)) {
        course.lessons.forEach((lesson) => {
          const lessonProgress = {
            lessonId: lesson._id,
            documentsProgress: [],
            quizzesProgress: [],
            codingActivitiesProgress: [],
            totalPointsEarned: 0,
            locked: lesson.locked,
          };

          if (Array.isArray(lesson.documents)) {
            lesson.documents.forEach((document) => {
              lessonProgress.documentsProgress.push({
                documentId: document._id,
                locked: document.locked,
              });
            });
          }

          if (Array.isArray(lesson.quiz)) {
            // Ensure this is correct
            lesson.quiz.forEach((quiz) => {
              // Ensure this is correct
              lessonProgress.quizzesProgress.push({
                quizId: quiz._id,
                locked: quiz.locked,
                pointsEarned: 0,
              });
            });
          }

          if (Array.isArray(lesson.codingActivity)) {
            // Ensure this is correct
            lesson.codingActivity.forEach((activity) => {
              // Ensure this is correct
              lessonProgress.codingActivitiesProgress.push({
                activityId: activity._id,
                locked: activity.locked,
                pointsEarned: 0,
              });
            });
          }

          courseProgress.lessonsProgress.push(lessonProgress);
        });
      }

      userProgress.coursesProgress.push(courseProgress);
    });

    await userProgress.save();
    res.json(userProgress);
  } catch (err) {
    console.error("Error creating user progress:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user progress
const updateUserProgress = asyncHandler(async (req, res) => {
  try {
    const {
      userId,
      courseId,
      lessonId,
      documentId,
      quizId,
      activityId,
      pointsEarned,
    } = req.body;

    const userProgress = await UserProgressModel.findOne({ userId }).exec();

    if (!userProgress) {
      return res.status(404).json({ message: "User progress not found" });
    }

    const courseIndex = userProgress.coursesProgress.findIndex((course) =>
      course.courseId.equals(courseId)
    );
    if (courseIndex === -1) {
      return res
        .status(404)
        .json({ message: "Course not found in user progress" });
    }

    const courseProgress = userProgress.coursesProgress[courseIndex];
    const lessonIndex = courseProgress.lessonsProgress.findIndex((lesson) =>
      lesson.lessonId.equals(lessonId)
    );
    if (lessonIndex === -1) {
      return res
        .status(404)
        .json({ message: "Lesson not found in course progress" });
    }

    const lessonProgress = courseProgress.lessonsProgress[lessonIndex];

    if (documentId) {
      // Mark the document as completed
      const documentIndex = lessonProgress.documentsProgress.findIndex(
        (document) => document.documentId.equals(documentId)
      );
      if (documentIndex !== -1) {
        lessonProgress.documentsProgress[documentIndex].locked = false;

        // Unlock the next document if exists
        const nextDocumentIndex = documentIndex + 1;
        if (nextDocumentIndex < lessonProgress.documentsProgress.length) {
          lessonProgress.documentsProgress[nextDocumentIndex].locked = false;
        } else if (lessonProgress.quizzesProgress.length > 0) {
          // If no more documents, unlock the first quiz
          lessonProgress.quizzesProgress[0].locked = false;
        } else if (lessonProgress.codingActivitiesProgress.length > 0) {
          // If no quizzes, unlock the first coding activity
          lessonProgress.codingActivitiesProgress[0].locked = false;
        } else {
          // If no more activities, unlock the next lesson
          unlockNextLesson(
            courseProgress,
            lessonIndex,
            userProgress,
            courseIndex
          );
        }
      }
    }

    if (quizId) {
      // Mark the quiz as completed
      const quizIndex = lessonProgress.quizzesProgress.findIndex((quiz) =>
        quiz.quizId.equals(quizId)
      );
      if (quizIndex !== -1) {
        lessonProgress.quizzesProgress[quizIndex].locked = false;
        lessonProgress.quizzesProgress[quizIndex].pointsEarned = pointsEarned;

        // Unlock the next quiz if exists
        const nextQuizIndex = quizIndex + 1;
        if (nextQuizIndex < lessonProgress.quizzesProgress.length) {
          lessonProgress.quizzesProgress[nextQuizIndex].locked = false;
        } else if (lessonProgress.codingActivitiesProgress.length > 0) {
          // If no more quizzes, unlock the first coding activity
          lessonProgress.codingActivitiesProgress[0].locked = false;
        } else {
          // If no more activities, unlock the next lesson
          unlockNextLesson(
            courseProgress,
            lessonIndex,
            userProgress,
            courseIndex
          );
        }
      }
    }

    if (activityId) {
      // Mark the coding activity as completed
      const activityIndex = lessonProgress.codingActivitiesProgress.findIndex(
        (activity) => activity.activityId.equals(activityId)
      );
      if (activityIndex !== -1) {
        lessonProgress.codingActivitiesProgress[activityIndex].locked = false;
        lessonProgress.codingActivitiesProgress[activityIndex].pointsEarned =
          pointsEarned;

        // Unlock the next coding activity if exists
        const nextActivityIndex = activityIndex + 1;
        if (
          nextActivityIndex < lessonProgress.codingActivitiesProgress.length
        ) {
          lessonProgress.codingActivitiesProgress[
            nextActivityIndex
          ].locked = false;
        } else {
          // If no more activities, unlock the next lesson
          unlockNextLesson(
            courseProgress,
            lessonIndex,
            userProgress,
            courseIndex
          );
        }
      }
    }

    await userProgress.save();
    res.json(userProgress);
  } catch (err) {
    console.error("Error updating user progress:", err);
    res.status(500).json({ message: "Server error" });
  }
});

const unlockNextLesson = (
  courseProgress,
  lessonIndex,
  userProgress,
  courseIndex
) => {
  const lessonProgress = courseProgress.lessonsProgress[lessonIndex];

  // Check if all documents, quizzes, and activities in the current lesson are unlocked
  const allDocumentsUnlocked = lessonProgress.documentsProgress.every(
    (doc) => !doc.locked
  );
  const allQuizzesUnlocked = lessonProgress.quizzesProgress.every(
    (quiz) => !quiz.locked
  );
  const allActivitiesUnlocked = lessonProgress.codingActivitiesProgress.every(
    (activity) => !activity.locked
  );

  if (allDocumentsUnlocked && allQuizzesUnlocked && allActivitiesUnlocked) {
    const nextLessonIndex = lessonIndex + 1;
    if (nextLessonIndex < courseProgress.lessonsProgress.length) {
      courseProgress.lessonsProgress[nextLessonIndex].locked = false;
      if (
        courseProgress.lessonsProgress[nextLessonIndex].documentsProgress
          .length > 0
      ) {
        courseProgress.lessonsProgress[
          nextLessonIndex
        ].documentsProgress[0].locked = false;
      }
    } else {
      // If no more lessons, unlock the next course
      const nextCourseIndex = courseIndex + 1;
      if (nextCourseIndex < userProgress.coursesProgress.length) {
        userProgress.coursesProgress[nextCourseIndex].locked = false;
        if (
          userProgress.coursesProgress[nextCourseIndex].lessonsProgress.length >
          0
        ) {
          userProgress.coursesProgress[
            nextCourseIndex
          ].lessonsProgress[0].locked = false;
          if (
            userProgress.coursesProgress[nextCourseIndex].lessonsProgress[0]
              .documentsProgress.length > 0
          ) {
            userProgress.coursesProgress[
              nextCourseIndex
            ].lessonsProgress[0].documentsProgress[0].locked = false;
          }
        }
      }
    }
  }
};

export { getUserProgress, updateUserProgress, createUserProgress };
