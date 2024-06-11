import asyncHandler from "express-async-handler";
import ClassModel from "../models/classModel.js";
import UserModel from "../models/userModel.js";

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
      console.log(classData)
    } else if (user.role === "student") {
      classData = await ClassModel.find({ students: userId });
      console.log(classData)
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

export { createClass, fetchClass, joinClass };