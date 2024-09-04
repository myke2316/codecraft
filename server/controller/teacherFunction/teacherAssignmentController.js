import ActivityAssignment from "../../models/teacherFunction/activityAssignmentModel.js";

import mongoose from "mongoose";
import { gfs, upload, gridfsBucket } from "../../sandboxUserFiles/gridFs.js";
import { GridFSBucket } from "mongodb";
import ClassModel from "../../models/classModel.js";
import UserModel from "../../models/userModel.js";
ClassModel;
// Controller to handle creating a new assignment


export const createAssignment = async (req, res) => {
  const {
    title,
    description,
    dueDate,
    classId,
    instructions,
    teacherId,
    target,
  } = req.body;
  const file = req.file; // File is optional

  try {
    if (target === "all") {
      // Fetch all classes where the teacher is the teacher
      const classes = await ClassModel.find({ teacher: teacherId });
      if (classes.length === 0) {
        return res
          .status(404)
          .json({ message: "No classes found for the specified teacher" });
      }

      // Create assignments for each class
      const assignments = await Promise.all(
        classes.map((classItem) => {
          const assignment = new ActivityAssignment({
            title,
            description,
            dueDate,
            classId: classItem._id,
            instructions,
            teacherId,
            expectedOutputImage: file ? file.id : null,
            target, // Only save the file's ObjectId if the file is uploaded
          });
          return assignment.save();
        })
      );

      return res
        .status(201)
        .json({
          message: "Assignments created successfully for all classes",
          assignments,
        });
    } else if (target === "specific") {
      // Validate classId and teacherId
      if (!classId) {
        return res
          .status(400)
          .json({ message: "classId is required for specific assignments" });
      }
      const classExists = await ClassModel.findById(classId);
      if (!classExists) {
        return res.status(404).json({ message: "Class not found" });
      }

      const teacher = await UserModel.findById(teacherId);
      if (!teacher || teacher.role !== "teacher") {
        return res.status(400).json({ message: "Invalid teacher ID" });
      }

      // Create a single assignment for a specific class
      const assignment = new ActivityAssignment({
        title,
        description,
        dueDate,
        classId,
        instructions,
        teacherId,
        expectedOutputImage: file ? file.id : null,
        target, // Only save the file's ObjectId if the file is uploaded
      });
      await assignment.save();

      return res
        .status(201)
        .json({
          message: "Assignment created successfully for the specified class",
          assignment,
        });
    } else {
      return res.status(400).json({ message: "Invalid target specified" });
    }
  } catch (error) {
    console.error("Error creating assignment: ", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getAssignmentsByClassId = async (req, res) => {
  const { classId } = req.params;

  try {
    // Validate classId
    if (!classId) {
      return res.status(400).json({ message: "classId is required" });
    }

    // Check if class exists
    const classExists = await ClassModel.findById(classId);
    if (!classExists) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Retrieve assignments for the class
    const assignments = await ActivityAssignment.find({ classId })
  

    if (assignments.length === 0) {
      return res.status(404).json({ message: "No assignments found for this class" });
    }

    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching assignments: ", error);
    res.status(500).json({ message: "Server error", error });
  }
};




// Controller to retrieve an assignment by ID
export const getAssignmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const assignment = await ActivityAssignment.findById(id)
      .populate("expectedOutputImage")
      .exec();
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json(assignment);
  } catch (error) {
    console.error("Error fetching assignment: ", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Controller to handle downloading an image from GridFS
export const getImageById = async (req, res) => {
  const { fileId } = req.params;

  try {
    // Create a read stream for the file
    const downloadStream = gridfsBucket.openDownloadStream(
      new mongoose.Types.ObjectId(fileId)
    );

    // Check if the file exists
    downloadStream.on("error", () => {
      res.status(404).json({ message: "File not found" });
    });

    // Pipe the download stream to the response
    downloadStream.pipe(res);

    // Optionally set the content type based on the file metadata (you might need to store this in the database)
    const file = await gridfsBucket
      .find({ _id: new mongoose.Types.ObjectId(fileId) })
      .toArray();
    if (file && file.length > 0) {
      res.setHeader("Content-Type", file[0].contentType); // Set appropriate content type
    }
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
