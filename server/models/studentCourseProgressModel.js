import mongoose from "mongoose";

const Schema = mongoose.Schema;

const DocumentProgressSchema = new Schema({
  documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true },
  locked: { type: Boolean },
});

const QuizProgressSchema = new Schema({
  quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
  locked: { type: Boolean},
  pointsEarned: { type: Number, default: 0 },
});

const CodingActivityProgressSchema = new Schema({
  activityId: {
    type: Schema.Types.ObjectId,
    ref: "CodingActivity",
    required: true,
  },
  locked: { type: Boolean},
  pointsEarned: { type: Number, default: 0 },
});

const LessonProgressSchema = new Schema({
  lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
  documentsProgress: [DocumentProgressSchema],
  quizzesProgress: [QuizProgressSchema],
  codingActivitiesProgress: [CodingActivityProgressSchema],
  totalPointsEarned: { type: Number, default: 0 },
  locked: { type: Boolean},
});

const CourseProgressSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  lessonsProgress: [LessonProgressSchema],
  totalPointsEarned: { type: Number, default: 0 },
  locked: { type: Boolean},
});

const UserProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  coursesProgress: [CourseProgressSchema],
});


const UserProgressModel = mongoose.model("UserProgress", UserProgressSchema);
export default UserProgressModel;
