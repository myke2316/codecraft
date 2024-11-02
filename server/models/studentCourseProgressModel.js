import mongoose from "mongoose";
import UserModel from "./userModel.js";
import ActiveUserLog from "./Admin/ActiveUserLogModel.js";

const Schema = mongoose.Schema;

const DocumentProgressSchema = new Schema({
  documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true },
  locked: { type: Boolean },
  dateFinished: { type: Date },
});

const QuizProgressSchema = new Schema({
  quizId: [{ type: Schema.Types.ObjectId, ref: "Quiz", required: true }], 
  locked: { type: Boolean },
  dateFinished: { type: Date },
});

const CodingActivityProgressSchema = new Schema({
  activityId: {
    type: Schema.Types.ObjectId,
    ref: "CodingActivity",
    required: true,
  },
  locked: { type: Boolean },
  dateFinished: { type: Date },
});

const LessonProgressSchema = new Schema({
  lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
  documentsProgress: [DocumentProgressSchema],
  quizzesProgress: [QuizProgressSchema],
  activitiesProgress: [CodingActivityProgressSchema],
  locked: { type: Boolean },
  dateFinished: { type: Date },
});

const CourseProgressSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  lessonsProgress: [LessonProgressSchema],
  locked: { type: Boolean },
  dateFinished: { type: Date },
});

const UserProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  coursesProgress: [CourseProgressSchema],
});


UserProgressSchema.post("save", async function () {
  const userId = this.userId;
  await UserModel.setCourseDateFinished(userId);
});


async function updateActiveUserLog(userProgress) {
  const activeDates = new Set();
  const userId = userProgress.userId; // Get the userId from userProgress

  // Collect all unique dates from coursesProgress
  userProgress.coursesProgress.forEach(course => {
    if (course.dateFinished) {
      activeDates.add(course.dateFinished.toISOString().split('T')[0]);
    }
    course.lessonsProgress.forEach(lesson => {
      if (lesson.dateFinished) {
        activeDates.add(lesson.dateFinished.toISOString().split('T')[0]);
      }
      lesson.documentsProgress.forEach(doc => {
        if (doc.dateFinished) {
          activeDates.add(doc.dateFinished.toISOString().split('T')[0]);
        }
      });
      lesson.quizzesProgress.forEach(quiz => {
        if (quiz.dateFinished) {
          activeDates.add(quiz.dateFinished.toISOString().split('T')[0]);
        }
      });
      lesson.activitiesProgress.forEach(activity => {
        if (activity.dateFinished) {
          activeDates.add(activity.dateFinished.toISOString().split('T')[0]);
        }
      });
    });
  });

  // Update ActiveUserLog for each unique date
  for (const date of activeDates) {
    const logEntry = await ActiveUserLog.findOne({ date });

    if (logEntry) {
      // If the log entry exists, check if the userId is already in uniqueUsers
      if (!logEntry.uniqueUsers.includes(userId)) {
        // Increment the count and add the userId to uniqueUsers
        await ActiveUserLog.findOneAndUpdate(
          { date },
          {
            $inc: { activeUserCount: 1 },
            $addToSet: { uniqueUsers: userId } // Add userId to the unique users
          },
          { new: true }
        );
      }
    } else {
      // If the log entry does not exist, create it
      await ActiveUserLog.create({
        date,
        activeUserCount: 1,
        uniqueUsers: [userId] // Initialize uniqueUsers with the current userId
      });
    }
  }
}


// Middleware to update ActiveUserLog on save



UserProgressSchema.post("save", async function () {
  await updateActiveUserLog(this);
});

// Middleware to update ActiveUserLog on update
UserProgressSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    await updateActiveUserLog(doc);
  }
});

// Middleware to update ActiveUserLog on findOneAndReplace
UserProgressSchema.post("findOneAndReplace", async function (doc) {
  if (doc) {
    await updateActiveUserLog(doc);
  }
});

// Middleware to update ActiveUserLog on insertMany
UserProgressSchema.post("insertMany", async function (docs) {
  for (const doc of docs) {
    await updateActiveUserLog(doc);
  }
});


const UserProgressModel = mongoose.model("UserProgress", UserProgressSchema);

export default UserProgressModel;
