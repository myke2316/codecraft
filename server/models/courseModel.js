import mongoose from "mongoose";
const Schema = mongoose.Schema;

const DocumentSchema = new Schema({
  title: { type: String, required: true },
  content: [
    {
      type: {
        type: String,
        required: true,
        enum: ["sentence", "snippet", "code", "codeconsole"],
      },
      text: { type: String },
      code: { type: String },
      supportingCode: { type: String },
      language: { type: String },
    },
  ],
  locked: { type: Boolean, default: true },
  badges: { type: String, required: false },
});
const QuizSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  points: { type: Number, required: true },
  locked: { type: Boolean, default: true },
  badges: { type: String, required: false },
});

// Define the CodeEditor schema
const CodeEditorSchema = new mongoose.Schema(
  {
    html: { type: String, default: "" },
    css: { type: String, default: "" },
    js: { type: String, default: "" },
  },
  { _id: false }
);

// Define the TestCase schema
const TestCaseSchema = new mongoose.Schema(
  {
    input: { type: String, default: "" },
    output: { type: String, required: true },
    required: [{ type: String, required: true }],
    isHidden: { type: Boolean, default: false },
    testCaseSentences: [{ type: String, required: false }],
    expectedImage: { type: String, required: false },
  },
  { _id: false }
);

const ActivitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    language: { type: String, required: true },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
    },
    problemStatement: { type: String, required: true },

    codeEditor: { type: CodeEditorSchema, required: true },
    testCases: { type: [TestCaseSchema], required: true },
    expectedImage: { type: String },
    locked: { type: Boolean, default: false, required: true },
    completed: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

const LessonSchema = new Schema({
  title: { type: String, required: true },
  documents: [{ type: DocumentSchema, ref: "Document" }],
  quiz: [{ type: QuizSchema, ref: "Quiz" }],
  activities: [{ type: ActivitySchema, ref: "Activity" }],
  totalPoints: { type: Number, required: true },
  locked: { type: Boolean, default: true },
  badges: { type: String, required: false },
});

const CourseSchema = new Schema({
  title: { type: String, required: true },
  lessons: [{ type: LessonSchema, ref: "Lesson" }],
  locked: { type: Boolean, default: true },
  badges: { type: String, required: false },
});

const CourseModel = mongoose.model("Course", CourseSchema);

export default CourseModel;
