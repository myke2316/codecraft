import Submission from "../../models/teacherFunction/submissionModel.js";  // Import the Submission model
import ActivityAssignment from "../../models/teacherFunction/activityAssignmentModel.js"; // Import the ActivityAssignment model
import ClassModel from "../../models/classModel.js"; // Import the Class model
import UserModel from "../../models/userModel.js"; 

// Function to handle submitting a new assignment submission
export const submitAssignment = async (req, res) => {
  const { assignmentId, classId, studentId, submissionLink, zipFile, teacherId } = req.body;

  try {
    // Check if the assignment exists
    const assignment = await ActivityAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check if the class exists
    const classExists = await ClassModel.findById(classId);
    if (!classExists) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Validate student ID
    const student = await UserModel.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(400).json({ error: "Invalid student ID" });
    }

    // Validate teacher ID
    const teacher = await UserModel.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(400).json({ error: "Invalid teacher ID" });
    }

    // Check if either a submission link or a zip file is provided (this will also be validated by the schema)
    if (!submissionLink && !zipFile) {
      return res.status(400).json({ error: "Either a submission link or a zip file is required" });
    }

    // Check if both a submission link and a zip file are provided
    if (submissionLink && zipFile) {
      return res.status(400).json({ error: "You can only provide a submission link or a zip file, not both" });
    }

    // Create a new submission
    const newSubmission = new Submission({
      assignmentId,
      classId,
      studentId,
      submissionLink,
      zipFile,
      teacherId,
    });

    await newSubmission.save();
    res.status(201).json({ message: "Submission created successfully", submission: newSubmission });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while creating the submission", details: error.message });
  }
};

// Function to handle deleting an assignment submission
export const deleteSubmission = async (req, res) => {
  const { submissionId } = req.params;

  try {
    // Check if the submission exists
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Delete the submission
    await Submission.findByIdAndDelete(submissionId);

    res.status(200).json({ message: "Submission deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while deleting the submission", details: error.message });
  }
};
