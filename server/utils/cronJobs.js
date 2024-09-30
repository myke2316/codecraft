import cron from "node-cron";
import UserModel from "../models/userModel.js"; 
import ClassModel from "../models/classModel.js"; 
import ActivitySubmissionModel from "../models/activityModels/activitySubmissionModel.js"; 
import QuizSubmissionModel from "../models/quizSubmissionModel.js"; 
import UserProgressModel from "../models/studentCourseProgressModel.js";
import UserAnalyticsModel from "../models/userAnalyticsModel.js";
import QuestionModel from "../models/QuestionAndAnswerModels/questionsModel.js"; 
import Submission from "../models/teacherFunction/submissionModel.js";

// Schedule a cron job to run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running daily cleanup for soft-deleted users...");

    // Find all users whose deleteExpiresAt date has passed
    const expiredUsers = await UserModel.find({
      isDeleted: true,
      deleteExpiresAt: { $lt: new Date() }
    });

    // Permanently delete the expired users and all related data
    for (const user of expiredUsers) {
      const userId = user._id;

      // If the user is a teacher, delete their classes and associated data
      if (user.role === "teacher") {
        // Find all classes taught by the teacher
        const classes = await ClassModel.find({ teacher: userId });

        // For each class, remove the teacher and delete related data
        for (const cls of classes) {
          await ClassModel.findByIdAndUpdate(cls._id, { teacher: null });

          // Remove students from the class
          await ClassModel.updateMany(
            { _id: cls._id },
            { $pull: { students: { $in: cls.students } } }
          );

          // Delete student-related data in analytics, progress, etc.
          await UserAnalyticsModel.deleteMany({ userId: { $in: cls.students } });
          await UserProgressModel.deleteMany({ userId: { $in: cls.students } });
          await ActivitySubmissionModel.deleteMany({ userId: { $in: cls.students } });
          await QuizSubmissionModel.deleteMany({ userId: { $in: cls.students } });
          await Submission.deleteMany({ studentId: { $in: cls.students } });
        }

        // Finally, delete all classes taught by the teacher
        await ClassModel.deleteMany({ teacher: userId });
      }

      // If the user is a student, remove them from any classes they are in
      await ClassModel.updateMany(
        { students: userId },
        { $pull: { students: userId } }
      );

      // Delete user-related submissions and progress
      await ActivitySubmissionModel.deleteMany({ userId });
      await QuizSubmissionModel.deleteMany({ userId });
      await UserProgressModel.deleteMany({ userId });
      await UserAnalyticsModel.deleteMany({ userId });

      // Delete user's questions and related answers
      await QuestionModel.deleteMany({ author: userId });
      await QuestionModel.updateMany(
        { "answers.author": userId },
        { $pull: { answers: { author: userId } } }
      );

      // Delete student submissions
      await Submission.deleteMany({ studentId: userId });

      // Finally, permanently delete the user
      await UserModel.deleteOne({ _id: userId });
      console.log(`Permanently deleted user and related data for user ID: ${userId}`);
    }
  } catch (error) {
    console.error("Error cleaning up soft-deleted users: ", error);
  }
});
