import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CodingActivitySubmissionSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  codingActivityId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingActivity', required: true },
  code: { type: String, required: true },
  passed: { type: Boolean, required: true },
  pointsEarned: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  timeTaken: { type: Number, required: true }, // Time taken in seconds
});

const CodingActivitySubmissionModel = mongoose.model('CodingActivitySubmission', CodingActivitySubmissionSchema);

export default CodingActivitySubmissionModel;
