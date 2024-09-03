import ActivityAssignment from "../../models/teacherFunction/activityAssignmentModel.js";

import mongoose from "mongoose";
import { gfs, upload } from "../../sandboxUserFiles/gridFs.js";

// Controller to handle creating a new assignment
export const createAssignment = async (req, res) => {
  const { title, description, dueDate, classId, instructions, teacherId } =
    req.body;

  try {
    // Check if a file (image) is uploaded
    const file = req.file;

    // Create a new activity assignment
    const newAssignment = new ActivityAssignment({
      title,
      description,
      dueDate,
      classId,
      instructions,
      teacherId, 
      expectedOutputImage: file ? file.id : null, // Save the file's ObjectId if image is uploaded
    });

    // Save the assignment to the database
    await newAssignment.save();

    res.status(201).json({
      message: "Assignment created successfully",
      assignment: newAssignment,
    });
  } catch (error) {
    console.error("Error creating assignment: ", error);
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
    gfs.files.findOne({ _id: mongoose.Types.ObjectId(fileId) }, (err, file) => {
      if (!file || file.length === 0) {
        return res.status(404).json({ message: "No file found" });
      }

      const readstream = gfs.createReadStream({ _id: file._id });
      res.set("Content-Type", file.contentType);
      readstream.pipe(res);
    });
  } catch (error) {
    console.error("Error fetching image: ", error);
    res.status(500).json({ message: "Server error", error });
  }
};
