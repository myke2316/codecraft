import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      // required: true,
      // default: "student"
    },
    courseCompleted: {type:Boolean},courseDateFinished: { type: Date },
    approved: { type: String },
    passwordResetToken: String,
    passwordResetExpires: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    deleteExpiresAt: Date,
  },
  { timestamps: true }
);

/** ---MIDDLEWARES--- **/

//Compares password to hashed password when Logging In
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//Hash the password when making a new user or user registration.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//reset password or forgot password
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10minutes

  return resetToken;
};

//if tapos na lahat ng course documents quizzes and activities, madadagdag ito
// Add the logic to set courseDateFinished when a course is completed
// userSchema.statics.setCourseDateFinished = async function (userId) {
//   const UserProgressModel = mongoose.model("UserProgress");

//   const userProgress = await UserProgressModel.findOne({ userId });
//   if (!userProgress) return;

//   const isCourseCompleted = userProgress.coursesProgress.every((course) => {
//     return course.lessonsProgress.every((lesson) => {
//       return lesson.documentsProgress.every((doc) => doc.dateFinished) &&
//              lesson.quizzesProgress.every((quiz) => quiz.dateFinished) &&
//              lesson.activitiesProgress.every((activity) => activity.dateFinished);
//     });
//   });

//   if (isCourseCompleted) {
//     await this.updateOne(
//       { _id: userId },
//       { courseCompleted: true, courseDateFinished: new Date() }
//     );
//   }
// };

//if tapos lang ang last course madadagdag ang courseDateFinished - for testing
userSchema.statics.setCourseDateFinished = async function (userId) {
  const UserProgressModel = mongoose.model("UserProgress");

  // Fetch the user's progress data
  const userProgress = await UserProgressModel.findOne({ userId });
  if (!userProgress || !userProgress.coursesProgress.length) return;

  // Check if the user already has a courseDateFinished, in which case we don't update it
  const user = await this.findOne({ _id: userId });
  if (user.courseDateFinished) return; // Do nothing if courseDateFinished already exists

  // Get the last course in the progress array (assuming the last course is the most recent)
  const lastCourse = userProgress.coursesProgress[userProgress.coursesProgress.length - 1];

  // Check if the last course's lessons are all completed
  const isLastCourseCompleted = lastCourse.lessonsProgress.every((lesson) => {
    return lesson.documentsProgress.every((doc) => doc.dateFinished) &&
           lesson.quizzesProgress.every((quiz) => quiz.dateFinished) &&
           lesson.activitiesProgress.every((activity) => activity.dateFinished);
  });

  // If the last course is completed, update the user with the completion status and date
  if (isLastCourseCompleted) {
    await this.updateOne(
      { _id: userId },
      { courseCompleted: true, courseDateFinished: new Date() }
    );
  }
};

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
