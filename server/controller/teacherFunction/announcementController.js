import ClassModel from "../../models/classModel.js";
import Announcement from "../../models/teacherFunction/announcementModel.js";


// Create a new announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, classId, teacherId, target } = req.body;
    
    if (target === 'all') {
      // Fetch all classes where the teacher is the teacher
      const classes = await ClassModel.find({ teacher: teacherId });
      if (classes.length === 0) {
        return res.status(404).json({ message: 'No classes found for the specified teacher' });
      }

      // Create announcements for each class
      const announcements = await Promise.all(
        classes.map((classItem) => {
          const announcement = new Announcement({
            title,
            content,
            classId: classItem._id,
            target
          });
          return announcement.save();
        })
      );

      return res.status(201).json({ message: 'Announcements created successfully for all classes', announcements });
    } else if (target === 'specific') {
      // Create a single announcement for a specific class
      if (!classId) {
        return res.status(400).json({ message: 'classId is required for specific announcements' });
      }
      const announcement = new Announcement({ title, content, classId,target });
      await announcement.save();
      return res.status(201).json({ message: 'Announcement created successfully for the specified class', announcement });
    } else {
      return res.status(400).json({ message: 'Invalid target specified' });
    }
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ message: "Failed to create announcement", error: error.message });
  }
};

// Get all announcements for a specific class
export const getAnnouncementsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const announcements = await Announcement.find({ classId }).sort({ createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ message: "Failed to fetch announcements", error: error.message });
  }
};

// Get a specific announcement by ID
export const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res.status(200).json(announcement);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    res.status(500).json({ message: "Failed to fetch announcement", error: error.message });
  }
};

// Update an announcement by ID
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Find the announcement being updated
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if the target is changing
    const isTargetChanging = announcement.target !== updatedData.target;

    // Update the specific announcement
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // If the target is changing and was previously 'all', delete other 'all' announcements
    if (isTargetChanging && announcement.target === 'all') {
      await Announcement.deleteMany({
        title: announcement.title,
        target: 'all',
        _id: { $ne: id }
      });
    }

    // If the new target is 'all', update all related announcements
    if (updatedAnnouncement.target === 'all') {
      await Announcement.updateMany(
        { title: updatedAnnouncement.title, target: 'all', _id: { $ne: id } },
        { $set: { content: updatedData.content } }
      );
    }

    res.status(200).json({ message: 'Announcement updated successfully', announcement: updatedAnnouncement });
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({ message: "Failed to update announcement", error: error.message });
  }
};



// Delete an announcement by ID
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the announcement to delete
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Delete the specific announcement
    await Announcement.findByIdAndDelete(id);

    // If the announcement is for 'all', remove all related announcements
    if (announcement.target === 'all') {
      await Announcement.deleteMany({ title: announcement.title, target: 'all' });
    }

    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ message: "Failed to delete announcement", error: error.message });
  }
};
