import mongoose from "mongoose";
import UserAnalyticsModel from "../models/UserAnalyticsModel.js";

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

// Update analytics for a specific user
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
//     let totalCourseTimeSpent = 0;
//     let totalCoursePointsEarned = 0;

//     if (analyticsData.coursesAnalytics) {
//       analyticsData.coursesAnalytics.forEach((course) => {
//         let totalCourseTime = 0;
//         let totalCoursePoints = 0;

//         if (course.courseId && course.lessonsAnalytics) {
//           course.lessonsAnalytics.forEach((lesson) => {
//             let totalLessonTime = 0;
//             let totalLessonPoints = 0;

//             if (lesson.lessonId && lesson.documentsAnalytics) {
//               lesson.documentsAnalytics.forEach((document) => {
//                 if (document.documentId) {
//                   totalLessonTime += document.timeSpent;
//                   totalLessonPoints += document.pointsEarned;

//                   updateObject[
//                     `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].documentsAnalytics.$[document].timeSpent`
//                   ] = document.timeSpent;
//                   updateObject[
//                     `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].documentsAnalytics.$[document].pointsEarned`
//                   ] = document.pointsEarned;
//                 }
//               });
//             }

//             totalCourseTime += totalLessonTime;
//             totalCoursePoints += totalLessonPoints;

//             updateObject[
//               `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].totalTimeSpent`
//             ] = totalLessonTime;
//             updateObject[
//               `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].totalPointsEarned`
//             ] = totalLessonPoints;
//           });
//         }

//         totalCourseTimeSpent += totalCourseTime;
//         totalCoursePointsEarned += totalCoursePoints;

//         updateObject[`coursesAnalytics.$[course].totalTimeSpent`] =
//           totalCourseTime;
//         updateObject[`coursesAnalytics.$[course].totalPointsEarned`] =
//           totalCoursePoints;
//       });
//     }

//     updateObject.totalTimeSpent = totalCourseTimeSpent;
//     updateObject.totalPointsEarned = totalCoursePointsEarned;

//     const updatedAnalytics = await UserAnalyticsModel.findOneAndUpdate(
//       { userId },
//       { $inc: updateObject }, // Using $inc to increment the existing values
//       {
//         new: true,
//         upsert: true,
//         arrayFilters: [
//           {
//             "course.courseId": { $in: analyticsData.coursesAnalytics.map((c) => c.courseId) },
//           },
//           {
//             "lesson.lessonId": { $in: analyticsData.coursesAnalytics.flatMap((c) =>
//               c.lessonsAnalytics.map((l) => l.lessonId)
//             ) },
//           },
//           {
//             "document.documentId": { $in: analyticsData.coursesAnalytics.flatMap((c) =>
//               c.lessonsAnalytics.flatMap((l) =>
//                 l.documentsAnalytics.map((d) => d.documentId)
//               )
//             ) },
//           },
//         ],
//       }
//     );

//     res.status(200).json(updatedAnalytics);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

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
    let totalCourseTimeSpent = 0;
    let totalCoursePointsEarned = 0;

    const courseIds = [];
    const lessonIds = [];
    const documentIds = [];
    const quizIds = [];
    const activityIds = [];

    if (analyticsData.coursesAnalytics && Array.isArray(analyticsData.coursesAnalytics)) {
      analyticsData.coursesAnalytics.forEach((course) => {
        let totalCourseTime = 0;
        let totalCoursePoints = 0;

        if (course.courseId && course.lessonsAnalytics && Array.isArray(course.lessonsAnalytics)) {
          courseIds.push(course.courseId);

          course.lessonsAnalytics.forEach((lesson) => {
            let totalLessonTime = 0;
            let totalLessonPoints = 0;

            if (lesson.lessonId) {
              lessonIds.push(lesson.lessonId);

              // Handle Document Analytics
              if (lesson.documentsAnalytics && Array.isArray(lesson.documentsAnalytics)) {
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
              if (lesson.quizzesAnalytics && Array.isArray(lesson.quizzesAnalytics)) {
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
              if (lesson.codingActivitiesAnalytics && Array.isArray(lesson.codingActivitiesAnalytics)) {
                lesson.codingActivitiesAnalytics.forEach((activity) => {
                  if (activity.activityId) {
                    activityIds.push(activity.activityId);

                    totalLessonTime += activity.timeSpent;
                    totalLessonPoints += activity.pointsEarned;

                    updateObject[
                      `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].codingActivitiesAnalytics.$[activity].timeSpent`
                    ] = activity.timeSpent;
                    updateObject[
                      `coursesAnalytics.$[course].lessonsAnalytics.$[lesson].codingActivitiesAnalytics.$[activity].pointsEarned`
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
        updateObject[`coursesAnalytics.$[course].totalTimeSpent`] = totalCourseTime;
        updateObject[`coursesAnalytics.$[course].totalPointsEarned`] = totalCoursePoints;
      });
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



// Add a new badge to a specific user
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

export { getUserAnalytics, updateUserAnalytics, addBadgeToUser, getUserBadges };
