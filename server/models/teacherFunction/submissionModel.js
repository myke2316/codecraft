import mongoose from "mongoose";
import UserModel from "../userModel.js"; // Import UserModel to validate the student
import ActivityAssignment from "./activityAssignmentModel.js";  // Import ActivityAssignment model to reference assignments

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ActivityAssignment", // Reference to the ActivityAssignment model
    required: [true, "Assignment ID is required"],
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class", // Reference to the Class model
    required: [true, "Class ID is required"],
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Student ID is required"],
    validate: {
      validator: async function (v) {
        const user = await UserModel.findById(v);
        return user && user.role === "student";
      },
      message: "Student ID must reference a valid student user",
    },
  },
  submissionLink: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        return !v || /^https?:\/\/[^\s$.?#].[^\s]*$/.test(v); // Valid URL or null
      },
      message: "Submission link must be a valid URL",
    },
  },
  zipFile: {
    type: String, // Storing file path or file URL as a string
    trim: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  graded: {
    type: Boolean,
    default: false,
  },
  grade: {
    type: Number,
    min: [0, "Grade cannot be less than 0"],
    max: [100, "Grade cannot exceed 100"],
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [1000, "Feedback cannot exceed 1000 characters"],
  },
  status: {
    type: String,
    enum: ["pending", "graded"],
    default: "pending",
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

// Custom validation to ensure either a submission link or zip file is provided, but not both
submissionSchema.pre("validate", function (next) {
  if (!this.submissionLink && !this.zipFile) {
    return next(
      new Error("Either a submission link or a zip file is required.")
    );
  }
  if (this.submissionLink && this.zipFile) {
    return next(
      new Error(
        "You can only provide a submission link or a zip file, not both."
      )
    );
  }
  next();
});

// Middleware to update `updatedAt` before saving
submissionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
