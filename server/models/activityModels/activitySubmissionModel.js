import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ActivityDetailSchema = new Schema({
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  html: { type: String, default: "" },
  css: { type: String, default: "" },
  js: { type: String, default: "" },
  passed: { type: Boolean, required: true },
  pointsEarned: { type: Number, required: true },
  timeTaken: { type: Number, required: true }, // Time taken in seconds
  tries: { type: Number, required: true, default: 3 },
  timestamp: { type: Date, default: Date.now },
});

const LessonSchema = new Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true,
  },
  activities: [ActivityDetailSchema],
});

const CourseSchema = new Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true,
  },
  lessons: [LessonSchema],
});

const ActivitySubmissionSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courses: [CourseSchema],
});

const ActivitySubmissionModel = mongoose.model('ActivitySubmission', ActivitySubmissionSchema);

export default ActivitySubmissionModel;
