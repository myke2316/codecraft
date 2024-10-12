import UserModel from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generatetoken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import ClassModel from "../models/classModel.js";
import ActivitySubmissionModel from "../models/activityModels/activitySubmissionModel.js";
import QuizSubmissionModel from "../models/quizSubmissionModel.js";
import UserProgressModel from "../models/studentCourseProgressModel.js";
import UserAnalyticsModel from "../models/userAnalyticsModel.js";
import QuestionModel from "../models/QuestionAndAnswerModels/questionsModel.js";
import Submission from "../models/teacherFunction/submissionModel.js";
import { readdirSync } from "fs";
import CertificateModel from "../models/certificationModel.js";
import SignatureModel from "../models/signatureModel.js";
import ActivityAssignment from "../models/teacherFunction/activityAssignmentModel.js";
import { gridfsBucket } from "../config/database.js";
import mongoose from "mongoose";
import Announcement from "../models/teacherFunction/announcementModel.js";

const editUsername = asyncHandler(async (req, res) => {
  const { userId, newUsername } = req.body;

  try {
    // Check if the new username is already taken
    const existingUser = await UserModel.findOne({ username: newUsername });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken." });
    }

    // Find the user by ID and update their username
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update the username
    user.username = newUsername;
    await user.save();

    res.status(200).json({
      message: "Username updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        approved: user.approved, // Include additional fields if needed
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const approveTeacher = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  try {
    // Find the user by ID
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is a teacher and not already approved
    if (user.role !== "teacher") {
      return res.status(400).json({ message: "User is not a teacher" });
    }

    if (user.approved === "true") {
      return res.status(400).json({ message: "Teacher is already approved" });
    }

    // Update the approved field to true
    user.approved = "true";
    await user.save();

    res.status(200).json({
      message: "Teacher approved successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        approved: user.approved,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const declineTeacher = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  try {
    // Find the user by ID
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is a teacher and not already declined
    if (user.role !== "teacher") {
      return res.status(400).json({ message: "User is not a teacher" });
    }

    if (user.approved === "declined") {
      return res.status(400).json({ message: "Teacher is already declined" });
    }

    // Update the approved field to false (or you can remove the teacher entirely)
    user.approved = "declined";
    await user.save();

    res.status(200).json({
      message: "Teacher declined successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        approved: user.approved,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      approved: user.approved,
      isDeleted: user.isDeleted,
      deleteExpiresAt: user.deleteExpiresAt,
    });
  } else {
    res.status(401).json({ error: "Invalid email or password!" });
    throw new Error("Invalid email or password");
  }
});
//register user
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  // Check if the email or username is already taken
  const emailExists = await UserModel.findOne({ email });
  const userExists = await UserModel.findOne({ username });

  if (userExists) {
    res.status(400).json({ error: "The username is already taken." });
    throw new Error("The username is already taken.");
  }

  if (emailExists) {
    res.status(400).json({ error: "The email is already taken." });
    throw new Error("This email is already taken.");
  }

  // Create a new user object
  const newUser = {
    username,
    email,
    password,
    role,
  };

  // If the role is 'teacher', set the approved field to false
  if (role === "teacher") {
    newUser.approved = false;
  }

  // Create the user in the database
  const user = await UserModel.create(newUser);

  if (user) {
    generateToken(res, user._id);
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      approved: user.approved, // Include the approved field in the response
    });
  } else {
    res.status(401).json({ error: "Invalid User Credentials." });
    throw new Error("Invalid User Credentials");
  }
});

// const registerUser = asyncHandler(async (req, res) => {
//   //getting the posted json or the messag
//   const { username, email, password, role } = req.body;

//   //validate or find user based on email & password
//   const emailExists = await UserModel.findOne({ email });
//   const userExists = await UserModel.findOne({ username });
//   if (userExists) {
//     res.status(400).json({ error: "The username is already taken." });
//     throw new Error("The username is already taken.");
//   }
//   if (emailExists) {
//     res.status(400).json({ error: "The email is already taken." });
//     throw new Error("This email is already taken.");
//   }

//   const user = await UserModel.create({ username, email, password, role });
//   if (user) {
//     generateToken(res, user._id);
//     res.json({
//       _id: user._id,
//       username: user.username,
//       email: user.email,
//       role: user.role,
//     });
//   } else {
//     res.status(401).json({ error: "Invalid User Credentials." });
//     throw new Error("Invalid User Credentials");
//   }
// });

const updateRole = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;

  try {
    // Prepare the update object
    const updateData = { role };

    // If the role is 'teacher', set the approved field to false
    if (role === "teacher") {
      updateData.approved = false;
    } else if (role === "student") {
      // Remove the approved field if the role is changed to student
      updateData.approved = undefined;
      updateData.$unset = { approved: "" };
    }

    // Find the user by ID and update their role (and approved status if applicable)
    const user = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (user) {
      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        approved: user.approved, // Include approved status in the response
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user's role
// const updateRole = asyncHandler(async (req, res) => {
//   const { userId, role } = req.body;
//   try {
//     const user = await UserModel.findByIdAndUpdate(
//       userId,
//       { role: role },
//       { new: true }
//     );
//     if (user) {
//       res.status(200).json({
//         _id: user._id,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//       });
//     } else {
//       res.status(404).json({ error: "User not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

//update profile password
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.body._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password;
    await user.save();
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      password: user.password,
    });
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

//logout user
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.cookie("connect.sid", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({
    message: "Logged Out Successfully",
  });
});

//forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    res.status(404).json({
      message: "User not Found",
    });
  }

  const resetToken = user.createPasswordResetToken();
  console.log(resetToken);
  user.save();

  // const resetUrl = `${req.protocol}://localhost:${process.env.CLIENT_PORT}/reset-password/${resetToken}`;
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `Forgot Password? Click on this link to reset your Password: ${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "[CodeCraft] Your password reset token. (Valid for 10minutes)",
      message,
    });
    res.status(200).json({ message: "Token sent to email" });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save();
    console.log(error);

    res.status(500).json({
      status: "error",
      message:
        "There was an error in sending the email. Please try again later",
    });
  }
});

//reset password
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    res.status(400).json({
      status: "fail",
      message: "Token is invalid or has expired.",
    });
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.save();

  generateToken(res, user._id);
  res.json({
    _id: user.id,
    username: user.username,
    password: user.password,
    role: user.role,
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await UserModel.find().select("-password"); // Exclude password from the response
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const permanentDeleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by ID
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle the deletion of the teacher and related data
    if (user.role === "teacher") {
      // Find all classes taught by the teacher
      const classes = await ClassModel.find({ teacher: userId });

      // Delete all classes taught by the teacher
      await ClassModel.deleteMany({ teacher: userId });
      // For each class, remove the teacher and delete related data
      for (const cls of classes) {
        // Remove the teacher from the class
        await ClassModel.findByIdAndUpdate(cls._id, { teacher: null });

        // Remove the students from the class
        await ClassModel.updateMany(
          { _id: cls._id },
          { $pull: { students: { $in: cls.students } } }
        );

        // Delete student-related data in analytics, progress, etc.
        await UserAnalyticsModel.deleteMany({ userId: { $in: cls.students } });
        await UserProgressModel.deleteMany({ userId: { $in: cls.students } });
        await ActivitySubmissionModel.deleteMany({
          userId: { $in: cls.students },
        });
        await QuizSubmissionModel.deleteMany({ userId: { $in: cls.students } });
        await Submission.deleteMany({ studentId: { $in: cls.students } });
        await CertificateModel.deleteMany({ studentId: { $in: cls.students } });
        await SignatureModel.deleteMany({ userId });
        await ActivityAssignment.deleteMany({ classId: cls._id }); 
        await Announcement.deleteMany({ classId: cls._id }); 
      }
    }

    // Remove the user from any classes where they are a student
    await ClassModel.updateMany(
      { students: userId },
      { $pull: { students: userId } }
    );

    // Delete related data for the user (whether they are a teacher or student)
    await ActivitySubmissionModel.deleteMany({ userId });
    await QuizSubmissionModel.deleteMany({ userId });
    await UserProgressModel.deleteMany({ userId });
    await UserAnalyticsModel.deleteMany({ userId });
    await QuestionModel.deleteMany({ author: userId });
    await Submission.deleteMany({ studentId: userId });
    await CertificateModel.deleteMany({ studentId: userId }); // Deleting certificates for the user

    // Optionally, if you need to do something similar for answers
    await QuestionModel.updateMany(
      { "answers.author": userId },
      { $pull: { answers: { author: userId } } }
    );

    // Finally, delete the user
    await user.deleteOne();

    res
      .status(200)
      .json({ message: "User and all related data deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by ID
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Soft delete the user (set isDeleted, deletedAt, and deleteExpiresAt)
    user.isDeleted = true; // Mark the user as soft deleted
    user.deletedAt = new Date(); // Set the current date as deletion time
    user.deleteExpiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days from now for hard delete
    await user.save(); // Save the changes

    // Respond with success message
    res.status(200).json({
      message: "User soft-deleted. Will be fully removed after 15 days.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

const undeleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by ID
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is soft deleted
    if (!user.isDeleted) {
      return res.status(400).json({ message: "User is not soft-deleted" });
    }

    // Restore the user (unset isDeleted, deletedAt, and deleteExpiresAt)
    user.isDeleted = false; // Mark the user as active again
    user.deletedAt = null; // Clear the deletion date
    user.deleteExpiresAt = null; // Clear the expiration date for deletion
    await user.save(); // Save the changes

    // Respond with success message
    res.status(200).json({
      message: "User successfully restored.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

const completeCourse = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by ID and update the courseCompleted field to true
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { courseCompleted: true },
      { new: true } // This option returns the updated document
    );

    // Check if the user was found and updated
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send a success response
    res.status(200).json({
      message: "Course completed status updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while updating the course status",
      error: error.message,
    });
  }
};

const userCompleteCourse = async (req, res) => {
  try {
    const users = await UserModel.find({ courseCompleted: true });
    if (users.length === 0) {
      return res.status(404).json({
        message: "No users found who have completed the course.",
      });
    }
    res.status(200).json({
      message: "Users who have completed the course fetched successfully.",
      users,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "An error occurred while fetching student who finsihed the course.",
      error: error.message,
    });
  }
};
const getSingleUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId; // Get the user ID from the request parameters
    const user = await UserModel.find({ _id: userId }); // Exclude password from the response

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export {
  userCompleteCourse,
  permanentDeleteUser,
  undeleteUser,
  getSingleUser,
  editUsername,
  deleteUser,
  loginUser,
  registerUser,
  updateUserProfile,
  logoutUser,
  forgotPassword,
  resetPassword,
  updateRole,
  getAllUsers,
  approveTeacher,
  completeCourse,declineTeacher
};
