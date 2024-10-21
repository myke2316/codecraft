import mongoose from "mongoose";
import UserAnalyticsModel from "../models/userAnalyticsModel.js";
import CourseModel from "../models/courseModel.js";
import UserProgressModel from "../models/studentCourseProgressModel.js";

// Get analytics for all users
//aggregated user analytics
const getAggregateAllUserAnalytics = async (req, res) => {
  try {
    const userAnalytics = await UserAnalyticsModel.aggregate([
      {
        $project: {
          userId: 1,
          totalPointsEarned: { $sum: "$coursesAnalytics.totalPointsEarned" },
          totalTimeSpent: { $sum: "$coursesAnalytics.totalTimeSpent" },
          badges: { $size: "$badges" },
        },
      },
    ]);

    res.status(200).json(userAnalytics);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user analytics" });
  }
};

const fetchAllUserAnalytics = async (req, res) => {
  try {
    // Fetch all user analytics data
    const userAnalytics = await UserAnalyticsModel.find();

    if (!userAnalytics || userAnalytics.length === 0) {
      return res.status(404).json({ message: "No analytics data found" });
    }

    res.status(200).json(userAnalytics);
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching user analytics" });
  }
};
// Get analytics for a specific user
const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.body;
    const userAnalytics = await UserAnalyticsModel.findOne({ userId }).populate(
      {
        path: "coursesAnalytics.courseId",
        select: "title",
      }
    );

    if (!userAnalytics) {
      return res
        .status(404)
        .json({ message: "Analytics not found for this user" });
    }

    res.status(200).json(userAnalytics);
  } catch (error) {
    res.status(500).json({ message: "User does not exist!" });
  }
};

const updateUserAnalytics = async (req, res) => {
  try {
    const { userId, analyticsData } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!analyticsData) {
      return res.status(400).json({ message: "Analytics data is required" });
    }

    const updateObject = {};
    const badgesToAward = [];

    let totalCourseTimeSpent = 0;
    let totalCoursePointsEarned = 0;

    const courseIds = [];
    const lessonIds = [];
    const documentIds = [];
    const quizIds = [];
    const activityIds = [];

    // Fetch current user analytics to check existing badges
    const currentUserAnalytics = await UserAnalyticsModel.findOne({ userId });
    const existingBadges = currentUserAnalytics ? currentUserAnalytics.badges.map(badge => badge.name) : [];

    // Fetch user progress
    const userProgress = await UserProgressModel.findOne({ userId });

    if (analyticsData.coursesAnalytics && Array.isArray(analyticsData.coursesAnalytics)) {
      for (const course of analyticsData.coursesAnalytics) {
        let totalCourseTime = 0;
        let totalCoursePoints = 0;

        if (course.courseId && course.lessonsAnalytics && Array.isArray(course.lessonsAnalytics)) {
          courseIds.push(course.courseId);

          const courseData = await CourseModel.findById(course.courseId);
          const courseProgress = userProgress.coursesProgress.find(cp => cp.courseId.toString() === course.courseId);

          for (const lesson of course.lessonsAnalytics) {
            let totalLessonTime = 0;
            let totalLessonPoints = 0;

            if (lesson.lessonId) {
              lessonIds.push(lesson.lessonId);

              const lessonData = courseData.lessons.id(lesson.lessonId);
              const lessonProgress = courseProgress?.lessonsProgress.find(lp => lp.lessonId.toString() === lesson.lessonId);

              // Handle Document Analytics
              if (lesson.documentsAnalytics && Array.isArray(lesson.documentsAnalytics)) {
                for (const document of lesson.documentsAnalytics) {
                  if (document.documentId) {
                    documentIds.push(document.documentId);

                    totalLessonTime += document.timeSpent;
                    totalLessonPoints += document.pointsEarned;

                    updateObject[`coursesAnalytics.$[course].lessonsAnalytics.$[lesson].documentsAnalytics.$[document].timeSpent`] = document.timeSpent;
                    updateObject[`coursesAnalytics.$[course].lessonsAnalytics.$[lesson].documentsAnalytics.$[document].pointsEarned`] = document.pointsEarned;

                    const documentData = lessonData.documents.id(document.documentId);
                    const documentProgress = lessonProgress?.documentsProgress.find(dp => dp.documentId.toString() === document.documentId);
                    
                    if (documentData && documentData.badges && !existingBadges.includes(documentData.badges) && 
                        documentProgress && documentProgress.dateFinished) {
                      badgesToAward.push({
                        name: documentData.badges,
                        description: `Completed document ${documentData.title}`,
                      });
                    }
                  }
                }
              }

              // Handle Quiz Analytics
              if (lesson.quizzesAnalytics && Array.isArray(lesson.quizzesAnalytics)) {
                for (const quiz of lesson.quizzesAnalytics) {
                  if (quiz.quizId) {
                    quizIds.push(quiz.quizId);

                    totalLessonTime += quiz.timeSpent;
                    totalLessonPoints += quiz.pointsEarned;

                    updateObject[`coursesAnalytics.$[course].lessonsAnalytics.$[lesson].quizzesAnalytics.$[quiz].timeSpent`] = quiz.timeSpent;
                    updateObject[`coursesAnalytics.$[course].lessonsAnalytics.$[lesson].quizzesAnalytics.$[quiz].pointsEarned`] = quiz.pointsEarned;

                    const quizData = lessonData.quiz.id(quiz.quizId);
                    const quizProgress = lessonProgress?.quizzesProgress.find(qp => qp.quizId.includes(quiz.quizId));
                    
                    if (quizData && quizData.badges && !existingBadges.includes(quizData.badges) && 
                        quizProgress && quizProgress.dateFinished) {
                      badgesToAward.push({
                        name: quizData.badges,
                        description: `Completed quiz in ${lessonData.title}`,
                      });
                    }
                  }
                }
              }

              // Handle Activity Analytics
              if (lesson.activitiesAnalytics && Array.isArray(lesson.activitiesAnalytics)) {
                for (const activity of lesson.activitiesAnalytics) {
                  if (activity.activityId) {
                    activityIds.push(activity.activityId);

                    totalLessonTime += activity.timeSpent;
                    totalLessonPoints += activity.pointsEarned;

                    updateObject[`coursesAnalytics.$[course].lessonsAnalytics.$[lesson].activitiesAnalytics.$[activity].timeSpent`] = activity.timeSpent;
                    updateObject[`coursesAnalytics.$[course].lessonsAnalytics.$[lesson].activitiesAnalytics.$[activity].pointsEarned`] = activity.pointsEarned;

                    const activityData = lessonData.activities.id(activity.activityId);
                    const activityProgress = lessonProgress?.activitiesProgress.find(ap => ap.activityId.toString() === activity.activityId);
                    
                    if (activityData && activityData.badges && !existingBadges.includes(activityData.badges) && 
                        activityProgress && activityProgress.dateFinished) {
                      badgesToAward.push({
                        name: activityData.badges,
                        description: `Completed activity in ${lessonData.title}`,
                      });
                    }
                  }
                }
              }

              // Update Lesson Analytics
              updateObject[`coursesAnalytics.$[course].lessonsAnalytics.$[lesson].totalTimeSpent`] = totalLessonTime;
              updateObject[`coursesAnalytics.$[course].lessonsAnalytics.$[lesson].totalPointsEarned`] = totalLessonPoints;

              // Award lesson badge if lesson is finished
              if (lessonData && lessonData.badges && !existingBadges.includes(lessonData.badges) && 
                  lessonProgress && lessonProgress.dateFinished) {
                badgesToAward.push({
                  name: lessonData.badges,
                  description: `Completed lesson ${lessonData.title}`,
                });
              }

              // Accumulate to course totals
              totalCourseTime += totalLessonTime;
              totalCoursePoints += totalLessonPoints;
            }
          }

          // Award course badge if course is finished
          if (courseData && courseData.badges && !existingBadges.includes(courseData.badges) && 
              courseProgress && courseProgress.dateFinished) {
            badgesToAward.push({
              name: courseData.badges,
              description: `Completed course ${courseData.title}`,
            });
          }
        }

        // Update Course Analytics
        totalCourseTimeSpent += totalCourseTime;
        totalCoursePointsEarned += totalCoursePoints;
        updateObject[`coursesAnalytics.$[course].totalTimeSpent`] = totalCourseTime;
        updateObject[`coursesAnalytics.$[course].totalPointsEarned`] = totalCoursePoints;
      }
    }

    // Update overall user analytics
    updateObject.totalTimeSpent = totalCourseTimeSpent;
    updateObject.totalPointsEarned = totalCoursePointsEarned;

    const arrayFilters = [];
    if (courseIds.length) arrayFilters.push({ "course.courseId": { $in: courseIds } });
    if (lessonIds.length) arrayFilters.push({ "lesson.lessonId": { $in: lessonIds } });
    if (documentIds.length) arrayFilters.push({ "document.documentId": { $in: documentIds } });
    if (quizIds.length) arrayFilters.push({ "quiz.quizId": { $in: quizIds } });
    if (activityIds.length) arrayFilters.push({ "activity.activityId": { $in: activityIds } });

    const updatedAnalytics = await UserAnalyticsModel.findOneAndUpdate(
      { userId },
      { 
        $inc: updateObject,
        $push: { badges: { $each: badgesToAward } }
      },
      {
        new: true,
        upsert: true,
        arrayFilters,
      }
    );

    res.status(200).json(updatedAnalytics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};



//10/21/24
// const updateUserAnalytics = async (req, res) => {
//   try {
//     const { userId, analyticsData } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: "Invalid user ID" });
//     }

//     if (!analyticsData) {
//       return res.status(400).json({ message: "Analytics data is required" });
//     }

//     const updateObject = {};
//     const badgesToAward = [];

//     let totalCourseTimeSpent = 0;
//     let totalCoursePointsEarned = 0;

//     const courseIds = [];
//     const lessonIds = [];
//     const documentIds = [];
//     const quizIds = [];
//     const activityIds = [];

//     if (
//       analyticsData.coursesAnalytics &&
//       Array.isArray(analyticsData.coursesAnalytics)
//     ) {
//       analyticsData.coursesAnalytics.forEach((course) => {
//         let totalCourseTime = 0;
//         let totalCoursePoints = 0;

//         if (
//           course.courseId &&
//           course.lessonsAnalytics &&
//           Array.isArray(course.lessonsAnalytics)
//         ) {
//           courseIds.push(course.courseId);

//           course.lessonsAnalytics.forEach((lesson) => {
//             let totalLessonTime = 0;
//             let totalLessonPoints = 0;

//             if (lesson.lessonId) {
//               lessonIds.push(lesson.lessonId);

//               // Handle Document Analytics
//               if (
//                 lesson.documentsAnalytics &&
//                 Array.isArray(lesson.documentsAnalytics)
//               ) {
//                 lesson.documentsAnalytics.forEach((document) => {
//                   if (document.documentId) {
//                     documentIds.push(document.documentId);

//                     totalLessonTime += document.timeSpent;
//                     totalLessonPoints += document.pointsEarned;

//                     updateObject[
//                       `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].documentsAnalytics.$[document].timeSpent`
//                     ] = document.timeSpent;
//                     updateObject[
//                       `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].documentsAnalytics.$[document].pointsEarned`
//                     ] = document.pointsEarned;

//                     // Award Document Badge if document timeSpent > 0 and badge is not empty
//                     if (
//                       document.timeSpent > 0 &&
//                       document.badges &&
//                       document.badges !== ""
//                     ) {
//                       badgesToAward.push({
//                         name: document.badges,
//                         description: `Completed document ${document.documentId}`,
//                       });
//                     }
//                   }
//                 });
//               }

//               // Handle Quiz Analytics
//               if (
//                 lesson.quizzesAnalytics &&
//                 Array.isArray(lesson.quizzesAnalytics)
//               ) {
//                 lesson.quizzesAnalytics.forEach((quiz) => {
//                   if (quiz.quizId) {
//                     quizIds.push(quiz.quizId);

//                     totalLessonTime += quiz.timeSpent;
//                     totalLessonPoints += quiz.pointsEarned;

//                     updateObject[
//                       `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].quizzesAnalytics.$[quiz].timeSpent`
//                     ] = quiz.timeSpent;
//                     updateObject[
//                       `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].quizzesAnalytics.$[quiz].pointsEarned`
//                     ] = quiz.pointsEarned;

//                     // Award Quiz Badge (if necessary in the future)
//                   }
//                 });
//               }

//               // Handle Activity Analytics
//               if (
//                 lesson.activitiesAnalytics &&
//                 Array.isArray(lesson.activitiesAnalytics)
//               ) {
//                 lesson.activitiesAnalytics.forEach((activity) => {
//                   if (activity.activityId) {
//                     activityIds.push(activity.activityId);

//                     totalLessonTime += activity.timeSpent;
//                     totalLessonPoints += activity.pointsEarned;

//                     updateObject[
//                       `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].activitiesAnalytics.$[activity].timeSpent`
//                     ] = activity.timeSpent;
//                     updateObject[
//                       `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].activitiesAnalytics.$[activity].pointsEarned`
//                     ] = activity.pointsEarned;

//                     // Award Activity Badge (if necessary in the future)
//                   }
//                 });
//               }

//               // Update Lesson Analytics
//               updateObject[
//                 `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].totalTimeSpent`
//               ] = totalLessonTime;
//               updateObject[
//                 `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].totalPointsEarned`
//               ] = totalLessonPoints;

//               // Accumulate to course totals
//               totalCourseTime += totalLessonTime;
//               totalCoursePoints += totalLessonPoints;
//             }
//           });
//         }

//         // Update Course Analytics
//         totalCourseTimeSpent += totalCourseTime;
//         totalCoursePointsEarned += totalCoursePoints;
//         updateObject[`coursesAnalytics.$[course].totalTimeSpent`] =
//           totalCourseTime;
//         updateObject[`coursesAnalytics.$[course].totalPointsEarned`] =
//           totalCoursePoints;
//       });
//     }

//     // Update overall user analytics
//     updateObject.totalTimeSpent = totalCourseTimeSpent;
//     updateObject.totalPointsEarned = totalCoursePointsEarned;

//     const arrayFilters = [];
//     if (courseIds.length)
//       arrayFilters.push({ "course.courseId": { $in: courseIds } });
//     if (lessonIds.length)
//       arrayFilters.push({ "lesson.lessonId": { $in: lessonIds } });
//     if (documentIds.length)
//       arrayFilters.push({ "document.documentId": { $in: documentIds } });
//     if (quizIds.length) arrayFilters.push({ "quiz.quizId": { $in: quizIds } });
//     if (activityIds.length)
//       arrayFilters.push({ "activity.activityId": { $in: activityIds } });

//     const updatedAnalytics = await UserAnalyticsModel.findOneAndUpdate(
//       { userId },
//       { $inc: updateObject }, // Increment values for timeSpent and pointsEarned
//       {
//         new: true,
//         upsert: true,
//         arrayFilters,
//       }
//     );

//     // Check for badges and course/lesson completion (as in the original controller logic)

//     if (badgesToAward.length > 0) {
//       const badgeUpdates = await UserAnalyticsModel.findOneAndUpdate(
//         { userId },
//         { $push: { badges: { $each: badgesToAward } } }, // Push new badges to the badges array
//         { new: true }
//       );

//       return res.status(200).json(badgeUpdates);
//     }

//     res.status(200).json(updatedAnalytics);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// const updateUserAnalytics = async (req, res) => {
//   try {
//     const { userId, analyticsData } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: "Invalid user ID" });
//     }

//     if (!analyticsData) {
//       return res.status(400).json({ message: "Analytics data is required" });
//     }

//     const updateObject = {};
//     const badgesToAward = [];

//     const courseIds = [];
//     const lessonIds = [];
//     const documentIds = [];
//     const quizIds = [];
//     const activityIds = [];

//     if (
//       analyticsData.coursesAnalytics &&
//       Array.isArray(analyticsData.coursesAnalytics)
//     ) {
//       analyticsData.coursesAnalytics.forEach((course) => {
//         if (
//           course.courseId &&
//           course.lessonsAnalytics &&
//           Array.isArray(course.lessonsAnalytics)
//         ) {
//           courseIds.push(course.courseId);

//           course.lessonsAnalytics.forEach((lesson) => {
//             if (lesson.lessonId) {
//               lessonIds.push(lesson.lessonId);

//               // Handle Document Analytics
//               if (
//                 lesson.documentsAnalytics &&
//                 Array.isArray(lesson.documentsAnalytics)
//               ) {
//                 lesson.documentsAnalytics.forEach((document) => {
//                   if (document.documentId) {
//                     documentIds.push(document.documentId);

//                     updateObject[
//                       `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].documentsAnalytics.$[document].timeSpent`
//                     ] = document.timeSpent;
//                     updateObject[
//                       `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].documentsAnalytics.$[document].pointsEarned`
//                     ] = document.pointsEarned;

//                     // Award Document Badge if document timeSpent > 0 and badge is not empty
//                     if (document.timeSpent > 0 && document.badges && document.badges !== "") {
//                       badgesToAward.push({
//                         name: document.badges,
//                         description: `Completed document ${document.documentId}`,
//                       });
//                     }
//                   }
//                 });
//               }

//               // Handle Quiz Analytics
//               if (
//                 lesson.quizzesAnalytics &&
//                 Array.isArray(lesson.quizzesAnalytics)
//               ) {
//                 lesson.quizzesAnalytics.forEach((quiz) => {
//                   if (quiz.quizId) {
//                     quizIds.push(quiz.quizId);

//                     updateObject[
//                       `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].quizzesAnalytics.$[quiz].timeSpent`
//                     ] = quiz.timeSpent;
//                     updateObject[
//                       `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].quizzesAnalytics.$[quiz].pointsEarned`
//                     ] = quiz.pointsEarned;

//                     // Award Quiz Badge (if necessary in the future)
//                   }
//                 });
//               }

//               // Handle Activity Analytics
//               if (
//                 lesson.activitiesAnalytics &&
//                 Array.isArray(lesson.activitiesAnalytics)
//               ) {
//                 lesson.activitiesAnalytics.forEach((activity) => {
//                   if (activity.activityId) {
//                     activityIds.push(activity.activityId);

//                     updateObject[
//                       `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].activitiesAnalytics.$[activity].timeSpent`
//                     ] = activity.timeSpent;
//                     updateObject[
//                       `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].activitiesAnalytics.$[activity].pointsEarned`
//                     ] = activity.pointsEarned;

//                     // Award Activity Badge (if necessary in the future)
//                   }
//                 });
//               }
//             }
//           });
//         }
//       });
//     }

//     // Update user analytics with the provided partial data
//     const arrayFilters = [];
//     if (courseIds.length) arrayFilters.push({ "course.courseId": { $in: courseIds } });
//     if (lessonIds.length) arrayFilters.push({ "lesson.lessonId": { $in: lessonIds } });
//     if (documentIds.length) arrayFilters.push({ "document.documentId": { $in: documentIds } });
//     if (quizIds.length) arrayFilters.push({ "quiz.quizId": { $in: quizIds } });
//     if (activityIds.length) arrayFilters.push({ "activity.activityId": { $in: activityIds } });

//     const updatedAnalytics = await UserAnalyticsModel.findOneAndUpdate(
//       { userId },
//       { $inc: updateObject }, // Increment values for timeSpent and pointsEarned
//       {
//         new: true,
//         upsert: true,
//         arrayFilters,
//       }
//     );

//     // Now check if lessons/courses are fully completed
//     for (const courseId of courseIds) {
//       const userAnalytics = await UserAnalyticsModel.findOne({
//         userId,
//         "coursesAnalytics.courseId": courseId,
//       });

//       if (userAnalytics) {
//         const courseData = userAnalytics.coursesAnalytics.find(
//           (c) => c.courseId.toString() === courseId
//         );

//         let courseCompleted = true;

//         // Check each lesson in the course
//         for (const lesson of courseData.lessonsAnalytics) {
//           let lessonCompleted = true;

//           // Check if all documents, quizzes, and activities have timeSpent > 0
//           const allDocsCompleted = lesson.documentsAnalytics.every(
//             (doc) => doc.timeSpent > 0
//           );
//           const allQuizzesCompleted = lesson.quizzesAnalytics.every(
//             (quiz) => quiz.timeSpent > 0
//           );
//           const allActivitiesCompleted = lesson.activitiesAnalytics.every(
//             (activity) => activity.timeSpent > 0
//           );

//           if (!allDocsCompleted || !allQuizzesCompleted || !allActivitiesCompleted) {
//             lessonCompleted = false;
//             courseCompleted = false;
//           }

//           // Award Lesson Badge if lesson is completed and badge is not already awarded
//           if (lessonCompleted && lesson.badges && lesson.badges !== "") {
//             const existingBadge = userAnalytics.badges.find(
//               (badge) => badge.name === lesson.badges
//             );
//             if (!existingBadge) {
//               badgesToAward.push({
//                 name: lesson.badges,
//                 description: `Completed lesson ${lesson.lessonId}`,
//               });
//             }
//           }
//         }

//         // Award Course Badge if course is completed and badge is not already awarded
//         if (courseCompleted && courseData.badges && courseData.badges !== "") {
//           const existingBadge = userAnalytics.badges.find(
//             (badge) => badge.name === courseData.badges
//           );
//           if (!existingBadge) {
//             badgesToAward.push({
//               name: courseData.badges,
//               description: `Completed course ${courseData.courseId}`,
//             });
//           }
//         }
//       }
//     }

//     // Add badges to user analytics if necessary (no duplicates, no empty badges)
//     if (badgesToAward.length > 0) {
//       const badgeUpdates = await UserAnalyticsModel.findOneAndUpdate(
//         { userId },
//         { $push: { badges: { $each: badgesToAward } } }, // Push new badges to the badges array
//         { new: true }
//       );

//       return res.status(200).json(badgeUpdates);
//     }

//     res.status(200).json(updatedAnalytics);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

const updateUserAnalyticsa = async (req, res) => {
  try {
    const { userId, analyticsData } = req.body;
    console.log(JSON.stringify(analyticsData, null, 2));
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!analyticsData) {
      return res.status(400).json({ message: "Analytics data is required" });
    }

    const updateObject = {};
    let totalCourseTimeSpent = 0;
    let totalCoursePointsEarned = 0;

    const courseIds = [];
    const lessonIds = [];
    const documentIds = [];
    const quizIds = [];
    const activityIds = [];

    if (
      analyticsData.coursesAnalytics &&
      Array.isArray(analyticsData.coursesAnalytics)
    ) {
      analyticsData.coursesAnalytics.forEach((course) => {
        let totalCourseTime = 0;
        let totalCoursePoints = 0;

        if (
          course.courseId &&
          course.lessonsAnalytics &&
          Array.isArray(course.lessonsAnalytics)
        ) {
          courseIds.push(course.courseId);

          course.lessonsAnalytics.forEach((lesson) => {
            let totalLessonTime = 0;
            let totalLessonPoints = 0;

            if (lesson.lessonId) {
              lessonIds.push(lesson.lessonId);

              // Handle Document Analytics
              if (
                lesson.documentsAnalytics &&
                Array.isArray(lesson.documentsAnalytics)
              ) {
                lesson.documentsAnalytics.forEach((document) => {
                  if (document.documentId) {
                    documentIds.push(document.documentId);

                    totalLessonTime += document.timeSpent;
                    totalLessonPoints += document.pointsEarned;

                    updateObject[
                      `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].documentsAnalytics.$[document].timeSpent`
                    ] = document.timeSpent;
                    updateObject[
                      `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].documentsAnalytics.$[document].pointsEarned`
                    ] = document.pointsEarned;
                  }
                });
              }

              // Handle Quiz Analytics
              if (
                lesson.quizzesAnalytics &&
                Array.isArray(lesson.quizzesAnalytics)
              ) {
                lesson.quizzesAnalytics.forEach((quiz) => {
                  if (quiz.quizId) {
                    quizIds.push(quiz.quizId);

                    totalLessonTime += quiz.timeSpent;
                    totalLessonPoints += quiz.pointsEarned;

                    updateObject[
                      `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].quizzesAnalytics.$[quiz].timeSpent`
                    ] = quiz.timeSpent;
                    updateObject[
                      `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].quizzesAnalytics.$[quiz].pointsEarned`
                    ] = quiz.pointsEarned;
                  }
                });
              }

              // Handle Coding Activity Analytics
              if (
                lesson.activitiesAnalytics &&
                Array.isArray(lesson.activitiesAnalytics)
              ) {
                lesson.activitiesAnalytics.forEach((activity) => {
                  if (activity.activityId) {
                    activityIds.push(activity.activityId);

                    totalLessonTime += activity.timeSpent;
                    totalLessonPoints += activity.pointsEarned;

                    updateObject[
                      `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].activitiesAnalytics.$[activity].timeSpent`
                    ] = activity.timeSpent;
                    updateObject[
                      `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].activitiesAnalytics.$[activity].pointsEarned`
                    ] = activity.pointsEarned;
                  }
                });
              }

              // Update Lesson Analytics
              updateObject[
                `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].totalTimeSpent`
              ] = totalLessonTime;
              updateObject[
                `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].totalPointsEarned`
              ] = totalLessonPoints;

              // Accumulate to course totals
              totalCourseTime += totalLessonTime;
              totalCoursePoints += totalLessonPoints;
            }
          });
        }

        // Update Course Analytics
        totalCourseTimeSpent += totalCourseTime;
        totalCoursePointsEarned += totalCoursePoints;
        updateObject[`coursesAnalytics.$[course].totalTimeSpent`] =
          totalCourseTime;
        updateObject[`coursesAnalytics.$[course].totalPointsEarned`] =
          totalCoursePoints;
      });
    }

    // Update overall user analytics
    updateObject.totalTimeSpent = totalCourseTimeSpent;
    updateObject.totalPointsEarned = totalCoursePointsEarned;

    const arrayFilters = [];
    if (courseIds.length)
      arrayFilters.push({ "course.courseId": { $in: courseIds } });
    if (lessonIds.length)
      arrayFilters.push({ "lesson.lessonId": { $in: lessonIds } });
    if (documentIds.length)
      arrayFilters.push({ "document.documentId": { $in: documentIds } });
    if (quizIds.length) arrayFilters.push({ "quiz.quizId": { $in: quizIds } });
    if (activityIds.length)
      arrayFilters.push({ "activity.activityId": { $in: activityIds } });

    const updatedAnalytics = await UserAnalyticsModel.findOneAndUpdate(
      { userId },
      { $inc: updateObject }, // Increment existing values
      {
        new: true,
        upsert: true,
        arrayFilters: arrayFilters,
      }
    );

    res.status(200).json(updatedAnalytics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const addBadgeToUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const newBadge = req.body;

    const userAnalytics = await UserAnalyticsModel.findOneAndUpdate(
      { userId },
      { $push: { badges: newBadge } },
      { new: true, upsert: true }
    );

    res.status(200).json(userAnalytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all badges for a specific user
const getUserBadges = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userAnalytics = await UserAnalyticsModel.findOne(
      { userId },
      "badges"
    );

    if (!userAnalytics) {
      return res.status(404).json({ message: "No badges found for this user" });
    }

    res.status(200).json(userAnalytics.badges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getUserAnalytics,
  updateUserAnalytics,
  addBadgeToUser,
  getUserBadges,
  getAggregateAllUserAnalytics,
  fetchAllUserAnalytics,
};
