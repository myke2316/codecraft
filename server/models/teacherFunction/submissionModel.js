import mongoose from 'mongoose';
import UserModel from './UserModel';  // Import UserModel to validate the student
import ActivityAssignment from './activityAssignmentModel'; // Import ActivityAssignment to validate the assignment

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActivityAssignment',
    required: [true, 'Assignment ID is required'],
    validate: {
      validator: async function(v) {
        const assignment = await ActivityAssignment.findById(v);
        return assignment !== null;
      },
      message: 'Assignment ID must reference a valid assignment',
    },
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
    validate: {
      validator: async function(v) {
        const user = await UserModel.findById(v);
        return user && user.role === 'student';
      },
      message: 'Student ID must reference a valid student user',
    },
  },
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: [true, 'Submission file reference is required'],
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
  grade: {
    type: Number,
    min: 0,
    max: 100,
  },
  gradedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
