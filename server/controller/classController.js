import asyncHandler from "express-async-handler";
import ClassModel from "../models/classModel.js";
import UserModel from "../models/userModel.js";
import UserProgressModel from "../models/studentCourseProgressModel.js";
import ActivitySubmissionModel from "../models/activityModels/activitySubmissionModel.js";
import QuizSubmissionModel from "../models/quizSubmissionModel.js";
import UserAnalyticsModel from "../models/userAnalyticsModel.js";
import Submission from "../models/teacherFunction/submissionModel.js";
import CertificateModel from "../models/certificationModel.js";
import ActivityAssignment from "../models/teacherFunction/activityAssignmentModel.js";
import {
  gfs,
  upload,
  gridfsBucket,
  assignmentBucket,
} from "../sandboxUserFiles/gridFs.js";
import mongoose from "mongoose";

const fetchAllClass = asyncHandler(async (req, res) => {
  try {
    const allClasses = await ClassModel.find();
    res.status(200).json(allClasses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch all classes" });
    throw new Error("Failed to fetch all classes");
  }
});
const removeStudentFromClass = asyncHandler(async (req, res) => {
  const { classId, studentId } = req.body;

  try {
    const classData = await ClassModel.findById(classId);

    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Check if the student is in the class
    if (!classData.students.includes(studentId)) {
      return res.status(404).json({ error: "Student not found in class" });
    }

    // Remove the student from the class
    classData.students = classData.students.filter(
      (id) => id.toString() !== studentId
    );

    await classData.save();

    // Remove related progress data (assuming ProgressModel handles course/lesson progress)
    await UserProgressModel.deleteMany({ userId: studentId });
    await ActivitySubmissionModel.deleteMany({
      userId: studentId,
    });
    await QuizSubmissionModel.deleteMany({
      userId: studentId,
    });
    await UserAnalyticsModel.deleteMany({
      userId: studentId,
    });

    await CertificateModel.deleteMany({
      studentId: studentId,
    });
  
    const submissions = await Submission.find({studentId});
    // Loop through each submission
    for (const submission of submissions) {
      if (submission.zipFile) {
        try {
          // Delete zipFile from GridFS only if it exists
          await assignmentBucket.delete(submission.zipFile);
          console.log("deleting bucket");
        } catch (error) {
          console.error(
            `Error deleting zipFile for submission ${submission._id}: `,
            error
          );
          // Handle specific error if necessary (e.g., log it or notify the user)
        }
      }
      // Delete the submission record
      await Submission.findByIdAndDelete(submission._id);
    }

    res
      .status(200)
      .json({ message: "Student removed from class", data: classData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to remove student from class" });
    throw new Error("Failed to remove student from class");
  }
});

const updateClassName = asyncHandler(async (req, res) => {
  const { classId, newClassName } = req.body;

  const classNameExists = await ClassModel.findOne({ className: newClassName });
  if (classNameExists) {
    return res.status(400).json({ error: "Class name already exists!" });
  }

  try {
    const updatedClass = await ClassModel.findByIdAndUpdate(
      classId,
      { className: newClassName },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ error: "Class not found" });
    }

    res.status(200).json(updatedClass);
  } catch (error) {
    res.status(500).json({ error: "Failed to update class name" });
    throw new Error("Failed to update class name");
  }
});

const createClass = asyncHandler(async (req, res) => {
  const { className, inviteCode, teacher } = req.body;

  const classNameExists = await ClassModel.findOne({ className: className });
  if (classNameExists) {
    res.status(400).json({ error: "Class name already exists!" });
    return;
  }
  const inviteCodeExists = await ClassModel.findOne({ inviteCode: inviteCode });
  if (inviteCodeExists) {
    res.status(400).json({ error: "Invite code already exists" });
    return;
  }
  try {
    const newClass = new ClassModel({
      className,
      inviteCode,
      teacher,
    });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(401).json({ error: "Class can't be created." });
    throw new Error("Invalid Class Name or invite Code");
  }
});

const fetchClass = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await UserModel.findById(userId);

    let classData = [];

    if (user.role === "teacher") {
      classData = await ClassModel.find({ teacher: userId });
      // console.log(classData)
    } else if (user.role === "student") {
      classData = await ClassModel.find({ students: userId });
      // console.log(classData)
    } else {
      return res.status(400).json({ error: "Invalid user role" });
    }

    // console.log(user.role);
    res.status(200).json(classData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch class(es)" });
    throw new Error("Failed to fetch class(es)");
  }
});
const fetchClassById = asyncHandler(async (req, res) => {
  const { classId } = req.params;

  try {
    // Fetch the class data by classId
    const classData = await ClassModel.findById(classId);

    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }

    res.status(200).json(classData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch class" });
    throw new Error("Failed to fetch class");
  }
});

const joinClass = asyncHandler(async (req, res) => {
  const { inviteCode } = req.body;
  const { studentId } = req.body;

  try {
    const classData = await ClassModel.findOne({ inviteCode });

    if (!classData) {
      res.status(404).json({ error: "Invalid invite code" });
      return;
    }

    if (!classData.students.includes(studentId)) {
      classData.students.push(studentId);
      await classData.save();
    }

    res
      .status(200)
      .json({ message: "Successfully joined class", class: classData });
  } catch (error) {
    res.status(500).json({ error: "Failed to join class" });
    throw new Error("Failed to join class");
  }
});

const deleteClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;

  try {
    // Fetch the class data to get the list of students
    const classData = await ClassModel.findById(classId);

    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Get the list of students in the class
    const students = classData.students;

    // Remove the class
    await ClassModel.findByIdAndDelete(classId);

    // Remove related data for each student
    await UserProgressModel.deleteMany({ userId: { $in: students } });
    await ActivitySubmissionModel.deleteMany({ userId: { $in: students } });
    await QuizSubmissionModel.deleteMany({ userId: { $in: students } });
    await UserAnalyticsModel.deleteMany({ userId: { $in: students } });

    // Find and delete all assignments associated with the class
    const assignments = await ActivityAssignment.find({ classId });
    for (const assignment of assignments) {
      if (assignment.expectedOutputImage) {
        // Delete file and chunks associated with the image
        await gridfsBucket.delete(assignment.expectedOutputImage);
      }
      await ActivityAssignment.findByIdAndDelete(assignment._id);
    }


    const submissions = await Submission.find({ classId }); 

    // Loop through each submission to delete the zipFile if it exists
    for (const submission of submissions) {
      if (submission.zipFile) {
        try {
          await assignmentBucket.delete(submission.zipFile); // Delete zipFile if it exists
          console.log(`Successfully deleted zipFile for submission: ${submission._id}`);
        } catch (error) {
          console.error(
            `Error deleting zipFile for submission ${submission._id}: `,
            error
          );
        }
      } else {
        console.log(`No zipFile found for submission: ${submission._id}`);
      }
    
      // Delete the submission record
      try {
        await Submission.findByIdAndDelete(submission._id); // Delete the submission
        console.log(`Successfully deleted submission: ${submission._id}`);
      } catch (error) {
        console.error(
          `Error deleting submission ${submission._id}: `,
          error
        );
      }
    }

    res
      .status(200)
      .json({ message: "Class deleted successfully and student data removed" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to delete class and remove student data" });
    throw new Error("Failed to delete class and remove student data");
  }
});

const fetchCompletedStudents = asyncHandler(async (req, res) => {
  const { classId } = req.params;

  try {
    let students;

    if (classId) {
      // Fetch the specific class data
      const classData = await ClassModel.findById(classId);

      if (!classData) {
        return res.status(404).json({ error: "Class not found" });
      }

      // Fetch all students in the class who have completed the course
      students = await UserModel.find({
        _id: { $in: classData.students },
        completedCourse: true,
      });
    } else {
      // Fetch all students who have completed the course from all classes
      students = await UserModel.find({ completedCourse: true });
    }

    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch completed students" });
    throw new Error("Failed to fetch completed students");
  }
});


const updateInviteCode = asyncHandler(async (req, res) => {
  const { classId, newInviteCode } = req.body;

  // Check if the invite code is provided
  if (!newInviteCode) {
    return res.status(400).json({ error: "New invite code is required" });
  }

  try {
    // Check if the new invite code already exists in any other class
    const inviteCodeExists = await ClassModel.findOne({ inviteCode: newInviteCode });
    if (inviteCodeExists) {
      return res.status(400).json({ error: "Invite code already exists" });
    }

    // Find and update the class with the new invite code
    const updatedClass = await ClassModel.findByIdAndUpdate(
      classId,
      { inviteCode: newInviteCode },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ error: "Class not found" });
    }

    res.status(200).json({
      message: "Invite code updated successfully",
      class: updatedClass,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update invite code" });
    throw new Error("Failed to update invite code");
  }
});




export {
  updateInviteCode,
  fetchCompletedStudents,
  deleteClass,
  createClass,
  fetchClass,
  joinClass,
  updateClassName,
  removeStudentFromClass,
  fetchClassById,
  fetchAllClass,
};
