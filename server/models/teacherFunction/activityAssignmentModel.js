import mongoose from "mongoose";
import UserModel from "./UserModel"; // Import UserModel to validate the teacher
import ClassModel from "./ClassModel"; // Import ClassModel to validate the class
import Image from './Image';    
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
    ref: "Class",
    required: [true, "Class ID is required"],
    validate: {
      validator: async function (v) {
        const classroom = await ClassModel.findById(v);
        return classroom !== null;
      },
      message: "Class ID must reference a valid class",
    },
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
