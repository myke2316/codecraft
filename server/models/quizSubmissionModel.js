import mongoose from "mongoose";

const Schema = mongoose.Schema;

const QuizDetailSchema = new Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  question: { type: String, required: true },
  selectedOption: { type: String },
  correct: { type: Boolean, required: true },
  pointsEarned: { type: Number, required: true },
  correctAnswer: { type: String, required: true },
});

const LessonSchema = new Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson",
    required: true,
  },
  quizzes: [QuizDetailSchema],
});

const CourseSchema = new Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  lessons: [LessonSchema],
});

const QuizSubmissionSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courses: [CourseSchema],
});

const QuizSubmissionModel = mongoose.model(
  "QuizSubmission",
  QuizSubmissionSchema
);

export default QuizSubmissionModel;
