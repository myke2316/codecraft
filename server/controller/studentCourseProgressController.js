import asyncHandler from "express-async-handler";
import UserProgressModel from "../models/studentCourseProgressModel.js";
import CourseModel from "../models/courseModel.js";
import UserModel from "../models/userModel.js";
import UserAnalyticsModel from "../models/userAnalyticsModel.js";
const getAllProgress = asyncHandler(async (req, res) => {
  try {
    const allProgress = await UserProgressModel.find().exec();

    if (!allProgress.length) {
      return res.status(404).json({ message: "No user progress found" });
    }

    res.json(allProgress);
  } catch (err) {
    console.error("Error fetching all user progress:", err);
    res.status(500).json({ message: "Server error" });
  }
});
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
    const { userId, courseId, lessonId, documentId, quizId, activityId } =
      req.body;

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
        lessonProgress.documentsProgress[documentIndex].dateFinished =
          new Date(); // Set dateFinished

        // Unlock the next document if exists
        const nextDocumentIndex = documentIndex + 1;
        if (nextDocumentIndex < lessonProgress.documentsProgress.length) {
          lessonProgress.documentsProgress[nextDocumentIndex].locked = false;
        } else if (lessonProgress.quizzesProgress.length > 0) {
          // If no more documents, unlock the first quiz
          lessonProgress.quizzesProgress[0].locked = false;
        } else if (lessonProgress.activitiesProgress.length > 0) {
          lessonProgress.activitiesProgress[0].locked = false;
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
      // Find the quiz group that contains this quizId
      const quizIndex = lessonProgress.quizzesProgress.findIndex(quizGroup =>
        quizGroup.quizId.some(id => id.equals(quizId))
      );
      if (quizIndex !== -1) {
        // Mark the entire quiz group as completed
        lessonProgress.quizzesProgress[quizIndex].dateFinished = new Date();
        lessonProgress.quizzesProgress[quizIndex].locked = false;
    
        // Unlock the next quiz group if exists
        const nextQuizIndex = quizIndex + 1;
        if (nextQuizIndex < lessonProgress.quizzesProgress.length) {
          lessonProgress.quizzesProgress[nextQuizIndex].locked = false;
        } else if (lessonProgress.activitiesProgress.length > 0) {
          // If no more quiz groups, unlock the next activity
          lessonProgress.activitiesProgress[0].locked = false;
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
      const activityIndex = lessonProgress.activitiesProgress.findIndex(
        (activity) => activity.activityId.equals(activityId)
      );
      if (activityIndex !== -1) {
        lessonProgress.activitiesProgress[activityIndex].locked = false;
        lessonProgress.activitiesProgress[activityIndex].dateFinished =
          new Date(); // Set dateFinished

        // Unlock the next coding activity if exists
        const nextActivityIndex = activityIndex + 1;
        if (nextActivityIndex < lessonProgress.activitiesProgress.length) {
          lessonProgress.activitiesProgress[nextActivityIndex].locked = false;
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
  const allActivitiesUnlocked = lessonProgress.activitiesProgress.every(
    (activity) => !activity.locked
  );

  if (allDocumentsUnlocked && allQuizzesUnlocked && allActivitiesUnlocked) {
    // Set dateFinished for the lesson
    lessonProgress.dateFinished = new Date();

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
      // If no more lessons, mark the course as completed and set dateFinished
      courseProgress.dateFinished = new Date();

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
        // All courses completed; handle completion logic if needed
        console.log("All courses completed!");
      }
    }
  }
};

//CREATE FOR NEW USERS=========================
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
//         dateFinished: null,
//       };

//       if (Array.isArray(course.lessons)) {
//         course.lessons.forEach((lesson) => {
//           const lessonProgress = {
//             lessonId: lesson._id,
//             documentsProgress: [],
//             quizzesProgress: [],
//             activitiesProgress: [],
//             locked: lesson.locked,
//             dateFinished: null,
//           };

//           if (Array.isArray(lesson.documents)) {
//             lesson.documents.forEach((document) => {
//               lessonProgress.documentsProgress.push({
//                 documentId: document._id,
//                 locked: document.locked,
//                 dateFinished: null,
//               });
//             });
//           }

//           // if (Array.isArray(lesson.quiz)) {
//           //   lesson.quiz.forEach((quiz) => {
//           //     lessonProgress.quizzesProgress.push({
//           //       quizId: quiz._id,
//           //       locked: quiz.locked,
//           //       dateFinished: null,
//           //     });
//           //   });
//           // }

//           if (Array.isArray(lesson.quiz)) {
//             const quizId = lesson.quiz.map((quiz) => quiz._id);
//             lessonProgress.quizzesProgress.push({
//               quizId,
//               locked: true,
//               dateFinished: null,
//             });
//           }

//           if (Array.isArray(lesson.activities)) {
//             lesson.activities.forEach((activity) => {
//               lessonProgress.activitiesProgress.push({
//                 activityId: activity._id,
//                 locked: activity.locked,
//                 dateFinished: null,
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
        dateFinished: null,
      };

      if (Array.isArray(course.lessons)) {
        course.lessons.forEach((lesson) => {
          const lessonProgress = {
            lessonId: lesson._id,
            documentsProgress: [],
            quizzesProgress: [],
            activitiesProgress: [],
            locked: lesson.locked,
            dateFinished: null,
          };

          if (Array.isArray(lesson.documents)) {
            lesson.documents.forEach((document) => {
              lessonProgress.documentsProgress.push({
                documentId: document._id,
                locked: document.locked,
                dateFinished: null,
              });
            });
          }

          // Handle quiz
          if (Array.isArray(lesson.quiz) && lesson.quiz.length > 0) {
            const quizId = lesson.quiz.map((quiz) => quiz._id);
            lessonProgress.quizzesProgress.push({
              quizId,
              locked: true,
              dateFinished: null,
            });
          }

          // Handle activities
          if (Array.isArray(lesson.activities) && lesson.activities.length > 0) {
            lesson.activities.forEach((activity) => {
              lessonProgress.activitiesProgress.push({
                activityId: activity._id,
                locked: activity.locked,
                dateFinished: null,
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



// //with badge
// const createUserAnalytics = async (req, res) => {
//   const { userId } = req.body;

//   try {
//     // Check if user analytics already exists
//     const existingUserAnalytics = await UserAnalyticsModel.findOne({ userId });
//     if (existingUserAnalytics) {
//       return res.status(400).json({ message: "User analytics already exists" });
//     }

//     // Fetch all courses and populate lessons, documents, quizzes, and activities
//     const courses = await CourseModel.find().populate({
//       path: "lessons",
//       populate: {
//         path: "documents quiz activities",
//       },
//     });

//     // Build analytics for courses, lessons, and documents with badges
//     const coursesAnalytics = courses.map((course) => {
//       const lessonsAnalytics = course.lessons.map((lesson) => {
//         const documentsAnalytics = lesson.documents.map((document) => ({
//           documentId: document._id,
//           timeSpent: 0,
//           pointsEarned: 0,
//           badges: document.badges || "",  // Assign the badge if available
//         }));

//         const quizzesAnalytics = lesson.quiz.map((quiz) => ({
//           quizId: quiz._id,
//           timeSpent: 0,
//           pointsEarned: 0,
//         }));

//         const activitiesAnalytics = lesson.activities.map((activity) => ({
//           activityId: activity._id,
//           timeSpent: 0,
//           pointsEarned: 0,
//         }));

//         return {
//           lessonId: lesson._id,
//           documentsAnalytics,
//           quizzesAnalytics,
//           activitiesAnalytics,
//           totalTimeSpent: 0,
//           totalPointsEarned: 0,
//           badges: lesson.badges || "",  // Assign the badge if available
//         };
//       });

//       return {
//         courseId: course._id,
//         lessonsAnalytics,
//         totalTimeSpent: 0,
//         totalPointsEarned: 0,
//         badges: course.badges || "",  // Assign the badge if available
//       };
//     });

//     // Create new user analytics
//     const newUserAnalytics = new UserAnalyticsModel({
//       userId,
//       coursesAnalytics,
//       badges: [],  // User-specific badges remain empty initially
//     });

//     const savedUserAnalytics = await newUserAnalytics.save();
//     res.status(201).json(savedUserAnalytics);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
const createUserAnalytics = async (req, res) => {
  const { userId } = req.body;

  try {
    // Check if user analytics already exists
    const existingUserAnalytics = await UserAnalyticsModel.findOne({ userId });
    if (existingUserAnalytics) {
      return res.status(400).json({ message: "User analytics already exists" });
    }

    // Fetch all courses and populate lessons, documents, quizzes, and activities
    const courses = await CourseModel.find().populate({
      path: "lessons",
      populate: {
        path: "documents quiz activities",
      },
    });

    // Build analytics for courses, lessons, and documents with badges
    const coursesAnalytics = courses.map((course) => {
      const lessonsAnalytics = course.lessons.map((lesson) => {
        const documentsAnalytics = lesson.documents.map((document) => ({
          documentId: document._id,
          timeSpent: 0,
          pointsEarned: 0,
          badges: document.badges || "",  // Assign the badge if available
        }));

        // Handle quizzes only if they exist
        const quizzesAnalytics = Array.isArray(lesson.quiz) && lesson.quiz.length > 0
          ? lesson.quiz.map((quiz) => ({
              quizId: quiz._id,
              timeSpent: 0,
              pointsEarned: 0,
            }))
          : [];

        // Handle activities only if they exist
        const activitiesAnalytics = Array.isArray(lesson.activities) && lesson.activities.length > 0
          ? lesson.activities.map((activity) => ({
              activityId: activity._id,
              timeSpent: 0,
              pointsEarned: 0,
            }))
          : [];

        return {
          lessonId: lesson._id,
          documentsAnalytics,
          quizzesAnalytics,
          activitiesAnalytics,
          totalTimeSpent: 0,
          totalPointsEarned: 0,
          badges: lesson.badges || "",  // Assign the badge if available
        };
      });

      return {
        courseId: course._id,
        lessonsAnalytics,
        totalTimeSpent: 0,
        totalPointsEarned: 0,
        badges: course.badges || "",  // Assign the badge if available
      };
    });

    // Create new user analytics
    const newUserAnalytics = new UserAnalyticsModel({
      userId,
      coursesAnalytics,
      badges: [],  // User-specific badges remain empty initially
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
  getAllProgress
};
