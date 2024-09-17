import asyncHandler from "express-async-handler";
import ClassModel from "../models/classModel.js";
import UserModel from "../models/userModel.js";
import UserProgressModel from "../models/studentCourseProgressModel.js";
import ActivitySubmissionModel from "../models/activityModels/activitySubmissionModel.js";
import QuizSubmissionModel from "../models/quizSubmissionModel.js";
import UserAnalyticsModel from "../models/userAnalyticsModel.js";

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
export {
  deleteClass,
  createClass,
  fetchClass,
  joinClass,
  updateClassName,
  removeStudentFromClass,
  fetchClassById,
  fetchAllClass,
};
