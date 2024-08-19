import mongoose from "mongoose";

const Schema = mongoose.Schema;

const DocumentAnalyticsSchema = new Schema({
  documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true },
  timeSpent: { type: Number, default: 0 }, // in seconds
  pointsEarned: { type: Number, default: 0 },
});

const QuizAnalyticsSchema = new Schema({
  quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
  timeSpent: { type: Number, default: 0 }, // in seconds
  pointsEarned: { type: Number, default: 0 },
  // add soon : answer:{type:String}
});

const activityAnalyticsSchema = new Schema({
  activityId: {
    type: Schema.Types.ObjectId,
    ref: "CodingActivity",
    required: true,
  },
  timeSpent: { type: Number, default: 0 }, // in seconds
  pointsEarned: { type: Number, default: 0 },
});

const LessonAnalyticsSchema = new Schema({
  lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
  documentsAnalytics: [DocumentAnalyticsSchema],
  quizzesAnalytics: [QuizAnalyticsSchema],
  activitiesAnalytics: [activityAnalyticsSchema],
  totalTimeSpent: { type: Number, default: 0 }, // in seconds
  totalPointsEarned: { type: Number, default: 0 },
});

const CourseAnalyticsSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  lessonsAnalytics: [LessonAnalyticsSchema],
  totalTimeSpent: { type: Number, default: 0 }, // in seconds
  totalPointsEarned: { type: Number, default: 0 },
});

const BadgeSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  dateAwarded: { type: Date, default: Date.now },
});

const UserAnalyticsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  coursesAnalytics: [CourseAnalyticsSchema],
  badges: [BadgeSchema],
});

const UserAnalyticsModel = mongoose.model("UserAnalytics", UserAnalyticsSchema);

export default UserAnalyticsModel;
