import mongoose from "mongoose";

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
  },
  { _id: false }
);


// Define the Activity schema
const ActivitySchema = new mongoose.Schema(
  {
    activityId: { type: String, required: true, unique: true },
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

// Create the Activity model
const ActivityModel = mongoose.model("Activity", ActivitySchema);

export default ActivityModel;
