import mongoose from "mongoose";
import UserModel from "../userModel.js"; // Import UserModel to validate the teacher

const activityAssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"],
  },
  dueDate: {
    type: Date,
    required: [true, "Due date is required"],
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class", // This references the Class model by name
    required: [true, "Class ID is required"],
  },
  instructions: {
    type: String,
    required: [true, "Instructions are required"],
  },
  expectedOutputImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image",
    required: [false, "Expected output image reference is optional"],
  },
  target: {
    type: String,
    enum: ["all", "specific"],
    default: "all",
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Teacher ID is required"],
    validate: {
      validator: async function (v) {
        const user = await UserModel.findById(v);
        return user && user.role === "teacher";
      },
      message: "Teacher ID must reference a valid teacher user",
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update `updatedAt` before saving
activityAssignmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const ActivityAssignment = mongoose.model(
  "ActivityAssignment",
  activityAssignmentSchema
);
export default ActivityAssignment;
