import ActivityAssignment from "../../models/teacherFunction/activityAssignmentModel.js";

import mongoose from "mongoose";
import { gfs, upload, gridfsBucket } from "../../sandboxUserFiles/gridFs.js";
import { GridFSBucket } from "mongodb";
import ClassModel from "../../models/classModel.js";
import UserModel from "../../models/userModel.js";

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

      return res.status(201).json({
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

      return res.status(201).json({
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
    const assignments = await ActivityAssignment.find({ classId });

    if (assignments.length === 0) {
      return res
        .status(404)
        .json({ message: "No assignments found for this class" });
    }

    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching assignments: ", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteAssignment = async (req, res) => {
  const { assignmentId } = req.params;

  try {
    // Find the assignment to be deleted
    const assignment = await ActivityAssignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Delete the assignment
    await ActivityAssignment.findByIdAndDelete(assignmentId);

    // If the assignment has an associated image, check if it's used by any other assignments
    if (assignment.expectedOutputImage) {
      const imageId = new mongoose.Types.ObjectId(
        assignment.expectedOutputImage
      );

      // Check if any other assignments use this image
      const remainingAssignments = await ActivityAssignment.find({
        expectedOutputImage: imageId,
      });

      if (remainingAssignments.length === 0) {
        // If no remaining assignments use the image, delete it from GridFS
        await gridfsBucket.delete(imageId);
      } else if (remainingAssignments.length === 1) {
        // If there's only one remaining assignment, update its target to "specific"
        const remainingAssignment = remainingAssignments[0];
        remainingAssignment.target = "specific";
        await remainingAssignment.save();
      }
    }

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment: ", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const editAssignment = async (req, res) => {
  const {
    assignmentId,
    title,
    description,
    dueDate,
    instructions,
    target,
    editForAll,
    classId // ID of the specific class to update if target is 'specific'
  } = req.body;
  const file = req.file;

  try {
    const assignment = await ActivityAssignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Prepare the update data
    const updateData = {
      title,
      description,
      dueDate,
      instructions,
    };

    if (file) {
      const newImageId = file.id;

      // Function to delete old image if it's no longer needed
      const deleteOldImageIfUnused = async (imageId) => {
        if (imageId) {
          // Check if the old image is still used by any assignments
          const assignmentsUsingOldImage = await ActivityAssignment.countDocuments({
            expectedOutputImage: imageId,
            target: { $ne: "specific" } // Check assignments that are not specific
          });

          if (assignmentsUsingOldImage === 0) {
            await gridfsBucket.delete(new mongoose.Types.ObjectId(imageId));
          }
        }
      };

      // If the target was "all", delete the old image
      if (assignment.target === "all" && editForAll) {
        if (assignment.expectedOutputImage) {
          await deleteOldImageIfUnused(assignment.expectedOutputImage);
        }
        updateData.expectedOutputImage = newImageId;
      }

      // Update the assignment
      if (target === "specific" || !editForAll) {
        // Specific class update
        if (assignment.expectedOutputImage) {
          await deleteOldImageIfUnused(assignment.expectedOutputImage);
        }

        updateData.expectedOutputImage = newImageId;

        const updatedAssignment = await ActivityAssignment.findByIdAndUpdate(
          assignmentId,
          { $set: updateData },
          { new: true }
        );

        if (!updatedAssignment) {
          return res
            .status(404)
            .json({ message: "Assignment not found for editing" });
        }

        return res.status(200).json({
          message: "Assignment updated successfully",
          assignment: updatedAssignment,
        });
      } else if (assignment.target === "all" && editForAll) {
        // Edit all assignments created for all classes by this assignment
        const assignments = await ActivityAssignment.updateMany(
          {
            title: assignment.title,
            teacherId: assignment.teacherId,
            target: "all",
          },
          { $set: updateData }
        );

        return res
          .status(200)
          .json({ message: "Assignments updated for all classes", assignments });
      } else {
        return res.status(400).json({ message: "Invalid target specified" });
      }
    } else {
      // Update without changing image
      if (assignment.target === "all" && editForAll) {
        const assignments = await ActivityAssignment.updateMany(
          {
            title: assignment.title,
            teacherId: assignment.teacherId,
            target: "all",
          },
          { $set: updateData }
        );

        return res
          .status(200)
          .json({ message: "Assignments updated for all classes", assignments });
      } else if (target === "specific" || !editForAll) {
        const updatedAssignment = await ActivityAssignment.findByIdAndUpdate(
          assignmentId,
          { $set: updateData },
          { new: true }
        );

        if (!updatedAssignment) {
          return res
            .status(404)
            .json({ message: "Assignment not found for editing" });
        }

        return res.status(200).json({
          message: "Assignment updated successfully",
          assignment: updatedAssignment,
        });
      } else {
        return res.status(400).json({ message: "Invalid target specified" });
      }
    }
  } catch (error) {
    console.error("Error editing assignment: ", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



//already working for the text fields and/or date fields, but not on image fields
// export const editAssignment = async (req, res) => {
//   // const { assignmentId } = req.params;
//   console.log(req.body)
//   const {
//     assignmentId,
//     title,
//     description,
//     dueDate,
//     classId,
//     instructions,
//     target,
//     editForAll,
//   } = req.body; // `editForAll` is used only if the target is 'all'
//   const file = req.file; // File is optional, used for editing the image

//   try {
//     const assignment = await ActivityAssignment.findById(assignmentId);

//     if (!assignment) {
//       return res.status(404).json({ message: "Assignment not found" });
//     }

//     if (assignment.target === "all" && editForAll) {
//       // Edit all assignments created for all classes by this assignment
//       const updateData = {
//         title,
//         description,
//         dueDate,
//         instructions,
//       };

//       if (file) {
//         updateData.expectedOutputImage = file.id;
//         // Delete old image if present
//         if (assignment.expectedOutputImage) {
//           await gridfsBucket.delete(
//             new mongoose.Types.ObjectId(assignment.expectedOutputImage)
//           );
//         }
//       }

//       const assignments = await ActivityAssignment.updateMany(
//         {
//           title: assignment.title,
//           teacherId: assignment.teacherId,
//           target: "all",
//         },
//         { $set: updateData }
//       );

//       return res
//         .status(200)
//         .json({ message: "Assignments updated for all classes", assignments });
//     } else if (assignment.target === "specific" || !editForAll) {
//       // Edit assignment for a specific class
//       const updateData = {
//         title,
//         description,
//         dueDate,
//         instructions,
//       };

//       if (file) {
//         updateData.expectedOutputImage = file.id;
//         // Delete old image if present
//         if (assignment.expectedOutputImage) {
//           await gridfsBucket.delete(
//             new mongoose.Types.ObjectId(assignment.expectedOutputImage)
//           );
//         }
//       }

//       const updatedAssignment = await ActivityAssignment.findByIdAndUpdate(
//         assignmentId,
//         { $set: updateData },
//         { new: true }
//       );

//       if (!updatedAssignment) {
//         return res
//           .status(404)
//           .json({ message: "Assignment not found for editing" });
//       }

//       return res.status(200).json({
//         message: "Assignment updated successfully",
//         assignment: updatedAssignment,
//       });
//     } else {
//       return res.status(400).json({ message: "Invalid target specified" });
//     }
//   } catch (error) {
//     console.error("Error editing assignment: ", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// Controller to retrieve an assignment by ID
export const getAssignmentById = async (req, res) => {
  const { assignmentId } = req.params;

  try {
    if (!assignmentId) {
      return res.status(400).json({ message: "Assignment ID is required" });
    }

    // Fetch the assignment by ID and populate any references if needed
    const assignment = await ActivityAssignment.findById(assignmentId);

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
    // Find the file metadata to determine the content type
    const file = await gridfsBucket
      .find({ _id: new mongoose.Types.ObjectId(fileId) })
      .toArray();

    if (file && file.length > 0) {
      // Set the content type before streaming the file
      res.setHeader("Content-Type", file[0].contentType);

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
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
