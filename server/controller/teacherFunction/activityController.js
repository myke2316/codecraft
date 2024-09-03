import ActivityAssignment from '../models/ActivityAssignment.js';

// Create a new activity assignment
export const createActivityAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, classId, instructions, submissionFile } = req.body;
    const activityAssignment = new ActivityAssignment({ title, description, dueDate, classId, instructions, submissionFile });
    await activityAssignment.save();
    res.status(201).json({ message: 'Activity assignment created successfully', activityAssignment });
  } catch (error) {
    console.error("Error creating activity assignment:", error);
    res.status(500).json({ message: "Failed to create activity assignment", error: error.message });
  }
};

// Get all activity assignments
export const getAllActivityAssignments = async (req, res) => {
  try {
    const activityAssignments = await ActivityAssignment.find().populate('submissionFile').populate('classId');
    res.status(200).json(activityAssignments);
  } catch (error) {
    console.error("Error fetching activity assignments:", error);
    res.status(500).json({ message: "Failed to fetch activity assignments", error: error.message });
  }
};

// Get a specific activity assignment by ID
export const getActivityAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const activityAssignment = await ActivityAssignment.findById(id).populate('submissionFile').populate('classId');
    if (!activityAssignment) {
      return res.status(404).json({ message: "Activity assignment not found" });
    }
    res.status(200).json(activityAssignment);
  } catch (error) {
    console.error("Error fetching activity assignment:", error);
    res.status(500).json({ message: "Failed to fetch activity assignment", error: error.message });
  }
};

// Update an activity assignment by ID
export const updateActivityAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const activityAssignment = await ActivityAssignment.findByIdAndUpdate(id, updatedData, { new: true });
    if (!activityAssignment) {
      return res.status(404).json({ message: "Activity assignment not found" });
    }
    res.status(200).json({ message: 'Activity assignment updated successfully', activityAssignment });
  } catch (error) {
    console.error("Error updating activity assignment:", error);
    res.status(500).json({ message: "Failed to update activity assignment", error: error.message });
  }
};

// Delete an activity assignment by ID
export const deleteActivityAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const activityAssignment = await ActivityAssignment.findByIdAndDelete(id);
    if (!activityAssignment) {
      return res.status(404).json({ message: "Activity assignment not found" });
    }
    res.status(200).json({ message: 'Activity assignment deleted successfully' });
  } catch (error) {
    console.error("Error deleting activity assignment:", error);
    res.status(500).json({ message: "Failed to delete activity assignment", error: error.message });
  }
};
