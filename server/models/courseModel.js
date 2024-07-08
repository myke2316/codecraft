import mongoose from "mongoose";

const Schema = mongoose.Schema;
const DocumentSchema = new Schema({
  title: { type: String, required: true },
  content: [
    {
      type: { type: String, required: true },
      text: { type: String },
      code: { type: String },
    },
  ],
  locked: { type: Boolean, default: true },
});

const QuizSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  points: { type: Number, required: true },
  locked: { type: Boolean, default: true },
});

const CodingActivitySchema = new Schema({
  description: { type: String, required: true },
  points: { type: Number, required: true },
  locked: { type: Boolean, default: true },
});

const LessonSchema = new Schema({
  title: { type: String, required: true },
  documents: [{ type: DocumentSchema, ref: "Document" }],
  codingActivity: [CodingActivitySchema],
  quiz: [{ type: QuizSchema, ref: "Quiz" }],
  totalPoints: { type: Number, required: true },
  locked: { type: Boolean, default: true },
});

const CourseSchema = new Schema({
  title: { type: String, required: true },
  lessons: [{ type: LessonSchema, ref: "Lesson" }],
  locked: { type: Boolean, default: true },
});

const CourseModel = mongoose.model("Course", CourseSchema);

export default CourseModel;
