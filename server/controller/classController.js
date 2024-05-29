import asyncHandler from "express-async-handler";
import ClassModel from "../models/classModel.js";

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
  const { teacherId } = req.params;
  try {
    let classData;
    console.log(teacherId)
    if (teacherId) {
      classData = await ClassModel.find({ teacher: teacherId });
      if (!classData) {
        res.status(404).json({ error: "Class not found" });
        return;
      }
    } else {
      classData = await ClassModel.find({});
    }

    res.status(200).json(classData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch class(es)" });
    throw new Error("Failed to fetch class(es)");
  }
});

export { createClass, fetchClass };
