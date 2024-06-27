
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const progressSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  scores: {
    quizzes: { type: Map, of: Number }, // quizId: score
    activities: { type: Map, of: Number }, // activityId: score
  },
  timeSpent: {
    type: Map,
    of: Number, // lessonId: time in seconds
  },
});

const UserProgressModel = mongoose.model('UserProgress', progressSchema);

export default UserProgressModel;
