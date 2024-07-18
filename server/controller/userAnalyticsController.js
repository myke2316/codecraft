import UserAnalyticsModel from "../models/UserAnalyticsModel.js";



// Get analytics for a specific user
const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.body;
    const userAnalytics = await UserAnalyticsModel.findOne({ userId }).populate({
      path: "coursesAnalytics.courseId",
      select: "title",
    });

    if (!userAnalytics) {
      return res.status(404).json({ message: "Analytics not found for this user" });
    }

    res.status(200).json(userAnalytics);
  } catch (error) {
    res.status(500).json({ message: "User does not exist!" });
  }
};

// Update analytics for a specific user
const updateUserAnalytics = async (req, res) => {
  try {
    const userId = req.params.userId;
    const analyticsData = req.body;

    const updatedAnalytics = await UserAnalyticsModel.findOneAndUpdate(
      { userId },
      { $set: analyticsData },
      { new: true, upsert: true }
    );

    res.status(200).json(updatedAnalytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new badge to a specific user
const addBadgeToUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const newBadge = req.body;

    const userAnalytics = await UserAnalyticsModel.findOneAndUpdate(
      { userId },
      { $push: { badges: newBadge } },
      { new: true, upsert: true }
    );

    res.status(200).json(userAnalytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all badges for a specific user
const getUserBadges = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userAnalytics = await UserAnalyticsModel.findOne({ userId }, "badges");

    if (!userAnalytics) {
      return res.status(404).json({ message: "No badges found for this user" });
    }

    res.status(200).json(userAnalytics.badges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





export {
  getUserAnalytics,
  updateUserAnalytics,
  addBadgeToUser,
  getUserBadges,
};