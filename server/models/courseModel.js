import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  title: String,
  description: String,
});

const quizSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: String,
});

const codingActivitySchema = new mongoose.Schema({
  activity: String,
});

const lessonSchema = new mongoose.Schema({
  title: String,
  documents: [documentSchema],
  codingActivity: String,
  quiz: [quizSchema],
});
const courseSchema = new mongoose.Schema({
  name: String,
  lessons: [lessonSchema],
});

const CourseModel = mongoose.model("Course", courseSchema);

export default CourseModel;
