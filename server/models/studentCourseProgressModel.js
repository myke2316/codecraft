import mongoose from "mongoose";

const Schema = mongoose.Schema;

const DocumentProgressSchema = new Schema({
  documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true },
  locked: { type: Boolean },
  dateFinished: { type: Date },
});


const QuizProgressSchema = new Schema({
  quizId: [{ type: Schema.Types.ObjectId, ref: "Quiz", required: true }], // Array to hold all quiz items for the lesson
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

const UserProgressModel = mongoose.model("UserProgress", UserProgressSchema);

export default UserProgressModel;
