import Submission from "../../models/teacherFunction/submissionModel.js"; // Import the Submission model
import ActivityAssignment from "../../models/teacherFunction/activityAssignmentModel.js"; // Import the ActivityAssignment model
import ClassModel from "../../models/classModel.js"; // Import the Class model
import UserModel from "../../models/userModel.js";
import {
  assignmentUpload,
  assignmentBucket,
} from "../../sandboxUserFiles/gridFs.js";
import mongoose from "mongoose";
// Function to handle submitting a new assignment submission
export const submitAssignment = async (req, res) => {
  const { assignmentId, classId, studentId, teacherId } = req.body;
  const zipFile = req.file; // File is now accessible via req.file

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

    // Validate if a file was uploaded
    if (!zipFile) {
      return res.status(400).json({ error: "Zip file is required" });
    }

    // Check if the student has already submitted an assignment for this assignmentId and classId
    const existingSubmission = await Submission.findOne({
      assignmentId,
      classId,
      studentId,
    });

    if (existingSubmission) {
      return res.status(400).json({
        error: "You have already submitted this assignment for this class",
      });
    }

    // Create a new submission
    const newSubmission = new Submission({
      assignmentId,
      classId,
      studentId,
      zipFile: zipFile.id,
      teacherId,
    });

    await newSubmission.save();
    res.status(201).json({
      message: "Submission created successfully",
      submission: newSubmission,
    });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while creating the submission",
      details: error.message,
    });
  }
};


// Function to handle deleting an assignment submission
// export const deleteSubmission = async (req, res) => {
//   const { submissionId } = req.params;

//   try {
//     // Check if the submission exists
//     const submission = await Submission.findById(submissionId);
//     if (!submission) {
//       return res.status(404).json({ error: "Submission not found" });
//     }

//     // Delete the file from GridFS
//     const file = await gridfsBucket
//       .find({ filename: submission.zipFile })
//       .toArray();
//     if (file.length > 0) {
//       assignmentBucket.delete(file[0]._id, (err) => {
//         if (err) {
//           return res
//             .status(500)
//             .json({
//               error: "Error deleting file from GridFS",
//               details: err.message,
//             });
//         }
//       });
//     }

//     // Delete the submission record
//     await Submission.findByIdAndDelete(submissionId);

//     res.status(200).json({ message: "Submission deleted successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({
//         error: "An error occurred while deleting the submission",
//         details: error.message,
//       });
//   }
// };

export const deleteSubmission = async (req, res) => {
  const { submissionId } = req.params;

  try {
    // Check if the submission exists
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Delete the file from GridFS
    if (submission.zipFile) {
      const fileId = new mongoose.Types.ObjectId(submission.zipFile);

      // Access the MongoDB database
      const db = mongoose.connection.db;
      
      // Delete the file metadata from GridFS (assignment.files)
      await db.collection('assignment.files').deleteOne({ _id: fileId });

      // Delete chunks associated with the file (assignment.chunks)
      await db.collection('assignment.chunks').deleteMany({ files_id: fileId });
    }

    // Delete the submission record
    await Submission.findByIdAndDelete(submissionId);

    res.status(200).json({ message: "Submission deleted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while deleting the submission",
      details: error.message,
    });
  }
};

// Function to fetch all submissions by classId
export const getSubmissionsByClassId = async (req, res) => {
  const { classId } = req.params; // Extract classId from request parameters

  try {
    // Validate if the class exists
    const classExists = await ClassModel.findById(classId);
    if (!classExists) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Find all submissions for the specified classId
    const submissions = await Submission.find({ classId })
      .populate("assignmentId", "title description") // Populate assignment details
      .populate("studentId", "username email") // Populate student details
      .populate("teacherId", "username email"); // Populate teacher details

    // Check if there are submissions
    if (submissions.length === 0) {
      return res
        .status(200)
        .json({
          submissions: [],
          message: "No submissions found for this class",
        });
    }

    // Return the list of submissions
    res.status(200).json({ submissions });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while fetching submissions",
      details: error.message,
    });
  }
};

// Function to fetch a submission by studentId and assignmentId
export const getSubmissionByStudentAndAssignment = async (req, res) => {
  const { assignmentId, studentId } = req.params; // Extract assignmentId and studentId from request parameters

  try {
    // Validate the assignment exists
    const assignment = await ActivityAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Validate the student exists
    const student = await UserModel.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(400).json({ error: "Invalid student ID" });
    }

    // Find the submission by studentId and assignmentId
    const submission = await Submission.findOne({ assignmentId, studentId })
      .populate("assignmentId", "title description") // Populate assignment details
      .populate("studentId", "username email") // Populate student details
      .populate("teacherId", "username email"); // Populate teacher details

    // Check if the submission exists
    if (!submission) {
      return res
        .status(404)
        .json({
          message: "No submission found for this student and assignment",
        });
    }

    // Fetch the file from GridFS
    let file = null;
    if (submission.zipFile) {
      const fileCursor = assignmentBucket.find({
        _id: new mongoose.Types.ObjectId(submission.zipFile),
      });
      file = await fileCursor.toArray();
    }

    // Return the submission and file details
    res
      .status(200)
      .json({ submission, file: file.length > 0 ? file[0] : null });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "An error occurred while fetching the submission",
        details: error.message,
      });
  }
};

export const getSubmissionsByAssignmentId = async (req, res) => {
  const { assignmentId } = req.params;

  try {
    // Optionally, you can check if the assignment exists first
    const assignmentExists = await ActivityAssignment.findById(assignmentId);
    if (!assignmentExists) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Fetch all submissions related to the assignmentId
    const submissions = await Submission.find({ assignmentId })
      .populate("studentId", "username email") // Populate student details
      .populate("teacherId", "username email") // Populate teacher details
      .populate("classId", "name"); // Populate class details

    // Check if submissions are found
    if (submissions.length === 0) {
      return res.status(200).json({ submissions: [] });
    }

    // Return the submissions
    res.status(200).json({ submissions });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while fetching the submissions",
      details: error.message,
    });
  }
};
export const downloadSubmissionFile = async (req, res) => {
  const { submissionId } = req.params; // Extract submissionId from request parameters

  try {
    // Check if the submission exists
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Check if the submission has a zip file
    if (!submission.zipFile) {
      return res.status(400).json({ error: "No zip file associated with this submission" });
    }

    // Fetch the student details
    const student = await UserModel.findById(submission.studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Fetch the file from GridFS
    const fileId = new mongoose.Types.ObjectId(submission.zipFile);
    const fileCursor = assignmentBucket.find({ _id: fileId });

    const file = await fileCursor.toArray();
    if (file.length === 0) {
      return res.status(404).json({ error: "File not found in GridFS" });
    }

    // Set the filename to the student's username
    const fileName = `${student.username}_submission.zip`;

    // Stream the file to the response
    const downloadStream = assignmentBucket.openDownloadStream(file[0]._id);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    downloadStream.on("data", (chunk) => res.write(chunk));
    downloadStream.on("end", () => res.end());
    downloadStream.on("error", (err) => {
      res.status(500).json({ error: "Error streaming file", details: err.message });
    });

  } catch (error) {
    res.status(500).json({
      error: "An error occurred while fetching the submission file",
      details: error.message,
    });
  }
};

// Function for submitting feedback and grade for a submission
export const teacherSubmitFeedback = async (req, res) => {
  const { submissionId } = req.params;
  const { grade, feedback } = req.body;

  try {
    // Find the submission
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Update the grade and feedback
    submission.grade = grade;
    submission.feedback = feedback;
    submission.graded = true;
    submission.status = "graded";

    // Save the updated submission
    await submission.save();

    res.status(200).json({ message: "Submission graded successfully", submission });
  } catch (error) {
    res.status(500).json({ error: "Error grading submission", details: error.message });
  }
};