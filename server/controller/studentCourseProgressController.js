// import asyncHandler from "express-async-handler";
// import UserProgressModel from "../models/studentCourseProgressModel.js";
// import CourseModel from "../models/courseModel.js";
// import UserModel from "../models/userModel.js";
// import UserAnalyticsModel from "../models/UserAnalyticsModel.js";
// // Get user progress by user ID
// const getUserProgress = asyncHandler(async (req, res) => {
//   const { userId } = req.body;
//   const userProgress = await UserProgressModel.findOne({ userId });

//   if (!userProgress) {
//     return res.status(404).json({ message: "User progress not found" });
//   }
//   res.json(userProgress);
// });

// // Create User Progress for each student

// // Update user progress
// const updateUserProgress = asyncHandler(async (req, res) => {
//   try {
//     const { userId, courseId, lessonId, documentId, quizId, activityId } =
//       req.body;

//     const userProgress = await UserProgressModel.findOne({ userId }).exec();

//     if (!userProgress) {
//       return res.status(404).json({ message: "User progress not found" });
//     }

//     const courseIndex = userProgress.coursesProgress.findIndex((course) =>
//       course.courseId.equals(courseId)
//     );
//     if (courseIndex === -1) {
//       return res
//         .status(404)
//         .json({ message: "Course not found in user progress" });
//     }

//     const courseProgress = userProgress.coursesProgress[courseIndex];
//     const lessonIndex = courseProgress.lessonsProgress.findIndex((lesson) =>
//       lesson.lessonId.equals(lessonId)
//     );
//     if (lessonIndex === -1) {
//       return res
//         .status(404)
//         .json({ message: "Lesson not found in course progress" });
//     }

//     const lessonProgress = courseProgress.lessonsProgress[lessonIndex];

//     if (documentId) {
//       // Mark the document as completed
//       const documentIndex = lessonProgress.documentsProgress.findIndex(
//         (document) => document.documentId.equals(documentId)
//       );
//       if (documentIndex !== -1) {
//         lessonProgress.documentsProgress[documentIndex].locked = false;

//         // Unlock the next document if exists
//         const nextDocumentIndex = documentIndex + 1;
//         if (nextDocumentIndex < lessonProgress.documentsProgress.length) {
//           lessonProgress.documentsProgress[nextDocumentIndex].locked = false;
//         } else if (lessonProgress.quizzesProgress.length > 0) {
//           // If no more documents, unlock the first quiz
//           lessonProgress.quizzesProgress[0].locked = false;
//         } else if (lessonProgress.codingActivitiesProgress.length > 0) {
//           // If no quizzes, unlock the first coding activity
//           lessonProgress.codingActivitiesProgress[0].locked = false;
//         } else {
//           // If no more activities, unlock the next lesson
//           unlockNextLesson(
//             courseProgress,
//             lessonIndex,
//             userProgress,
//             courseIndex
//           );
//         }
//       }
//     }

//     if (quizId) {
//       // Mark the quiz as completed
//       const quizIndex = lessonProgress.quizzesProgress.findIndex((quiz) =>
//         quiz.quizId.equals(quizId)
//       );
//       if (quizIndex !== -1) {
//         lessonProgress.quizzesProgress[quizIndex].locked = false;

//         // Unlock the next quiz if exists
//         const nextQuizIndex = quizIndex + 1;
//         if (nextQuizIndex < lessonProgress.quizzesProgress.length) {
//           lessonProgress.quizzesProgress[nextQuizIndex].locked = false;
//         } else if (lessonProgress.codingActivitiesProgress.length > 0) {
//           // If no more quizzes, unlock the first coding activity
//           lessonProgress.codingActivitiesProgress[0].locked = false;
//         } else {
//           // If no more activities, unlock the next lesson
//           unlockNextLesson(
//             courseProgress,
//             lessonIndex,
//             userProgress,
//             courseIndex
//           );
//         }
//       }
//     }

//     if (activityId) {
//       // Mark the coding activity as completed
//       const activityIndex = lessonProgress.codingActivitiesProgress.findIndex(
//         (activity) => activity.activityId.equals(activityId)
//       );
//       if (activityIndex !== -1) {
//         lessonProgress.codingActivitiesProgress[activityIndex].locked = false;

//         // Unlock the next coding activity if exists
//         const nextActivityIndex = activityIndex + 1;
//         if (
//           nextActivityIndex < lessonProgress.codingActivitiesProgress.length
//         ) {
//           lessonProgress.codingActivitiesProgress[
//             nextActivityIndex
//           ].locked = false;
//         } else {
//           // If no more activities, unlock the next lesson
//           unlockNextLesson(
//             courseProgress,
//             lessonIndex,
//             userProgress,
//             courseIndex
//           );
//         }
//       }
//     }

//     await userProgress.save();
//     res.json(userProgress);
//   } catch (err) {
//     console.error("Error updating user progress:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// const unlockNextLesson = (
//   courseProgress,
//   lessonIndex,
//   userProgress,
//   courseIndex
// ) => {
//   const lessonProgress = courseProgress.lessonsProgress[lessonIndex];

//   // Check if all documents, quizzes, and activities in the current lesson are unlocked
//   const allDocumentsUnlocked = lessonProgress.documentsProgress.every(
//     (doc) => !doc.locked
//   );
//   const allQuizzesUnlocked = lessonProgress.quizzesProgress.every(
//     (quiz) => !quiz.locked
//   );
//   const allActivitiesUnlocked = lessonProgress.codingActivitiesProgress.every(
//     (activity) => !activity.locked
//   );

//   if (allDocumentsUnlocked && allQuizzesUnlocked && allActivitiesUnlocked) {
//     const nextLessonIndex = lessonIndex + 1;
//     if (nextLessonIndex < courseProgress.lessonsProgress.length) {
//       courseProgress.lessonsProgress[nextLessonIndex].locked = false;
//       if (
//         courseProgress.lessonsProgress[nextLessonIndex].documentsProgress
//           .length > 0
//       ) {
//         courseProgress.lessonsProgress[
//           nextLessonIndex
//         ].documentsProgress[0].locked = false;
//       }
//     } else {
//       // If no more lessons, unlock the next course
//       const nextCourseIndex = courseIndex + 1;
//       if (nextCourseIndex < userProgress.coursesProgress.length) {
//         userProgress.coursesProgress[nextCourseIndex].locked = false;
//         if (
//           userProgress.coursesProgress[nextCourseIndex].lessonsProgress.length >
//           0
//         ) {
//           userProgress.coursesProgress[
//             nextCourseIndex
//           ].lessonsProgress[0].locked = false;
//           if (
//             userProgress.coursesProgress[nextCourseIndex].lessonsProgress[0]
//               .documentsProgress.length > 0
//           ) {
//             userProgress.coursesProgress[
//               nextCourseIndex
//             ].lessonsProgress[0].documentsProgress[0].locked = false;
//           }
//         }
//       } else {
//         // If no more courses, do something else (e.g., show a completion message)
//         console.log("All courses completed!");
//       }
//     }
//   }
// };

// //CREATE FOR NEW USERS=========================
// const createUserProgress = asyncHandler(async (req, res) => {
//   const userId = req.body.userId;

//   try {
//     const user = await UserModel.findById(userId).exec();
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check if the user is a teacher
//     if (user.role === "teacher") {
//       return res
//         .status(400)
//         .json({ message: "Teachers do not need progress tracking" });
//     }

//     // Check if user progress already exists
//     const existingUserProgress = await UserProgressModel.findOne({ userId });
//     if (existingUserProgress) {
//       return res.status(400).json({ message: "User progress already exists" });
//     }

//     const userProgress = new UserProgressModel({ userId, coursesProgress: [] });

//     const courses = await CourseModel.find().exec();
//     courses.forEach((course) => {
//       const courseProgress = {
//         courseId: course._id,
//         lessonsProgress: [],
//         locked: course.locked || false,
//       };

//       if (Array.isArray(course.lessons)) {
//         course.lessons.forEach((lesson) => {
//           const lessonProgress = {
//             lessonId: lesson._id,
//             documentsProgress: [],
//             quizzesProgress: [],
//             codingActivitiesProgress: [],
//             locked: lesson.locked,
//           };

//           if (Array.isArray(lesson.documents)) {
//             lesson.documents.forEach((document) => {
//               lessonProgress.documentsProgress.push({
//                 documentId: document._id,
//                 locked: document.locked,
//               });
//             });
//           }

//           if (Array.isArray(lesson.quiz)) {
//             lesson.quiz.forEach((quiz) => {
//               lessonProgress.quizzesProgress.push({
//                 quizId: quiz._id,
//                 locked: quiz.locked,
//               });
//             });
//           }

//           if (Array.isArray(lesson.codingActivity)) {
//             lesson.codingActivity.forEach((activity) => {
//               lessonProgress.codingActivitiesProgress.push({
//                 activityId: activity._id,
//                 locked: activity.locked,
//               });
//             });
//           }

//           courseProgress.lessonsProgress.push(lessonProgress);
//         });
//       }

//       userProgress.coursesProgress.push(courseProgress);
//     });

//     await userProgress.save();
//     res.json(userProgress);
//   } catch (err) {
//     console.error("Error creating user progress:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// const createUserAnalytics = async (req, res) => {
//   const { userId } = req.body;

//   try {
//     // Check if user progress already exists
//     const existingUserProgress = await UserAnalyticsModel.findOne({ userId });
//     if (existingUserProgress) {
//       return res.status(400).json({ message: "User progress already exists" });
//     }

//     const courses = await CourseModel.find().populate({
//       path: "lessons",
//       populate: {
//         path: "documents codingActivity quiz",
//       },
//     });

//     const coursesAnalytics = courses.map((course) => ({
//       courseId: course._id,
//       lessonsAnalytics: course.lessons.map((lesson) => ({
//         lessonId: lesson._id,
//         documentsAnalytics: lesson.documents.map((document) => ({
//           documentId: document._id,
//           timeSpent: 0,
//           pointsEarned: 0,
//         })),
//         quizzesAnalytics: lesson.quiz.map((quiz) => ({
//           quizId: quiz._id,
//           timeSpent: 0,
//           pointsEarned: 0,
//         })),
//         codingActivitiesAnalytics: lesson.codingActivity.map((activity) => ({ 
//           activityId: activity._id,
//           timeSpent: 0,
//           pointsEarned: 0,
//         })),
//         totalTimeSpent: 0,
//         totalPointsEarned: 0,
//       })),
//       totalTimeSpent: 0,
//       totalPointsEarned: 0,
//     }));

//     const newUserAnalytics = new UserAnalyticsModel({
//       userId,
//       coursesAnalytics,
//       badges: [],
//     });

//     const savedUserAnalytics = await newUserAnalytics.save();
//     res.status(201).json(savedUserAnalytics);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export {
//   getUserProgress,
//   updateUserProgress,
//   createUserProgress,
//   createUserAnalytics,
// };


import asyncHandler from "express-async-handler";
import UserProgressModel from "../models/studentCourseProgressModel.js";
import CourseModel from "../models/courseModel.js";
import UserModel from "../models/userModel.js";
import UserAnalyticsModel from "../models/UserAnalyticsModel.js";

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

// Update user progress
const updateUserProgress = asyncHandler(async (req, res) => {
  try {
    const { userId, courseId, lessonId, documentId, quizId } = req.body;

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

        // Unlock the next quiz if exists
        const nextQuizIndex = quizIndex + 1;
        if (nextQuizIndex < lessonProgress.quizzesProgress.length) {
          lessonProgress.quizzesProgress[nextQuizIndex].locked = false;
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

  // Check if all documents and quizzes in the current lesson are unlocked
  const allDocumentsUnlocked = lessonProgress.documentsProgress.every(
    (doc) => !doc.locked
  );
  const allQuizzesUnlocked = lessonProgress.quizzesProgress.every(
    (quiz) => !quiz.locked
  );

  if (allDocumentsUnlocked && allQuizzesUnlocked) {
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
      } else {
        // If no more courses, do something else (e.g., show a completion message)
        console.log("All courses completed!");
      }
    }
  }
};

//CREATE FOR NEW USERS=========================
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
        locked: course.locked || false,
      };

      if (Array.isArray(course.lessons)) {
        course.lessons.forEach((lesson) => {
          const lessonProgress = {
            lessonId: lesson._id,
            documentsProgress: [],
            quizzesProgress: [],
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
            lesson.quiz.forEach((quiz) => {
              lessonProgress.quizzesProgress.push({
                quizId: quiz._id,
                locked: quiz.locked,
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

const createUserAnalytics = async (req, res) => {
  const { userId } = req.body;

  try {
    // Check if user progress already exists
    const existingUserProgress = await UserAnalyticsModel.findOne({ userId });
    if (existingUserProgress) {
      return res.status(400).json({ message: "User progress already exists" });
    }

    const courses = await CourseModel.find().populate({
      path: "lessons",
      populate: {
        path: "documents quiz",
      },
    });

    const coursesAnalytics = courses.map((course) => ({
      courseId: course._id,
      lessonsAnalytics: course.lessons.map((lesson) => ({
        lessonId: lesson._id,
        documentsAnalytics: lesson.documents.map((document) => ({
          documentId: document._id,
          timeSpent: 0,
          pointsEarned: 0,
        })),
        quizzesAnalytics: lesson.quiz.map((quiz) => ({
          quizId: quiz._id,
          timeSpent: 0,
          pointsEarned: 0,
        })),
        totalTimeSpent: 0,
        totalPointsEarned: 0,
      })),
      totalTimeSpent: 0,
      totalPointsEarned: 0,
    }));

    const newUserAnalytics = new UserAnalyticsModel({
      userId,
      coursesAnalytics,
      badges: [],
    });

    const savedUserAnalytics = await newUserAnalytics.save();
    res.status(201).json(savedUserAnalytics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export {
  getUserProgress,
  createUserProgress,
  updateUserProgress,
  createUserAnalytics,
};
