import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CodingActivitySchema = new Schema({
  description: { type: String, required: true },
  question: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  points: { type: Number, required: true },
  language: {
    type: String,
    enum: ["html", "css", "javascript", "php"],
    required: true,
  },
  locked: { type: Boolean, default: true },
});

const DocumentSchema = new Schema({
  title: { type: String, required: true },
  content: [
    {
      type: {
        type: String,
        required: true,
        enum: ["sentence", "snippet", "code"],
      },
      text: { type: String },
      code: { type: String },
      supportingCode: { type: String },
      language: { type: String },
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

// import mongoose from "mongoose";

// const Schema = mongoose.Schema;

// const CodingActivitySchema = new Schema({
//   description: { type: String, required: true },
//   question: { type: String, required: true },
//   language: {
//     type: String,
//     enum: ["html", "css", "javascript", "php"],
//     required: true,
//   },
//   points: { type: Number, required: true },
//   supportingCode: { type: String }, // Optional field for supporting HTML code
//   testCases: [
//     {
//       input: { type: String, required: true },
//       output: { type: String, required: true },
//     },
//   ],

//   locked: { type: Boolean, default: true },
// });

// const DocumentSchema = new Schema({
//   title: { type: String, required: true },
//   content: [
//     {
//       type: {
//         type: String,
//         required: true,
//         enum: ["sentence", "snippet", "code"],
//       },
//       text: { type: String },
//       code: { type: String },
//       supportingCode: { type: String },
//       language: { type: String },
//     },
//   ],
//   locked: { type: Boolean, default: true },
// });

// const QuizSchema = new Schema({
//   question: { type: String, required: true },
//   options: [{ type: String, required: true }],
//   correctAnswer: { type: String, required: true },
//   points: { type: Number, required: true },
//   locked: { type: Boolean, default: true },
// });

// const LessonSchema = new Schema({
//   title: { type: String, required: true },
//   documents: [{ type: DocumentSchema, ref: "Document" }],
//   codingActivity: [CodingActivitySchema],
//   quiz: [{ type: QuizSchema, ref: "Quiz" }],
//   totalPoints: { type: Number, required: true },
//   locked: { type: Boolean, default: true },
// });

// const CourseSchema = new Schema({
//   title: { type: String, required: true },
//   lessons: [{ type: LessonSchema, ref: "Lesson" }],
//   locked: { type: Boolean, default: true },
// });

// const CourseModel = mongoose.model("Course", CourseSchema);

// export default CourseModel;
