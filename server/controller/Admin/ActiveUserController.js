
import ActiveUserLog from '../../models/Admin/ActiveUserLogModel.js'; 
import { startOfDay } from 'date-fns';


// Fetch historical active user logs for analytics
export const fetchActiveUserLogs = async (req, res) => {
  try {
    // Fetch all documents from the ActiveUserLog collection
    const logs = await ActiveUserLog.find({}).sort({ date: 1 });

    // Transform the data into the desired format
    const formattedLogs = logs.map(log => ({
      date: log.date,
      activeUserCount: log.activeUserCount
    }));

    // Send the formatted data as a response
    res.status(200).json(formattedLogs);
  } catch (error) {
    console.error('Error fetching active user logs:', error);
    res.status(500).json({ message: 'Error fetching active user logs', error: error.message });
  }
};

