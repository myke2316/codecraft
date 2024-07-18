import mongoose from "mongoose";

const Schema = mongoose.Schema;

const QuizSubmissionSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  question: { type: String, required: true },
  selectedOption: { type: String, required: true },
  correct: { type: Boolean, required: true },
  pointsEarned: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const QuizSubmissionModel = mongoose.model(
  "QuizSubmission",
  QuizSubmissionSchema
);

export default QuizSubmissionModel;
