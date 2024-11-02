import mongoose from 'mongoose';
import ActiveUserLog from '../models/Admin/ActiveUserLogModel.js'; 
import UserProgressModel from '../models/studentCourseProgressModel.js';

async function initializeActiveUserLog() {
  try {
    // Connect to your MongoDB database
    await mongoose.connect('mongodb+srv://codecraft:leianmyke@codecraft.3m6wuiq.mongodb.net/codecraft?retryWrites=true&w=majority');
    console.log('Connected to MongoDB');

    // Clear existing ActiveUserLog data (optional, remove if you want to keep existing data)
    await ActiveUserLog.deleteMany({});
    console.log('Cleared existing ActiveUserLog data');

    // Fetch all UserProgress documents
    const userProgresses = await UserProgressModel.find({});
    console.log(`Found ${userProgresses.length} UserProgress documents`);

    // Initialize a Map to store date counts and unique users
    const dateCounts = new Map();

    // Process each UserProgress document
    for (const userProgress of userProgresses) {
      const userId = userProgress.userId; // Assuming userId is directly available
      const activeDates = new Set();

      // Collect all unique dates from coursesProgress
      userProgress.coursesProgress.forEach(course => {
        if (course.dateFinished) {
          activeDates.add(course.dateFinished.toISOString().split('T')[0]);
        }
        course.lessonsProgress.forEach(lesson => {
          if (lesson.dateFinished) {
            activeDates.add(lesson.dateFinished.toISOString().split('T')[0]);
          }
          lesson.documentsProgress.forEach(doc => {
            if (doc.dateFinished) {
              activeDates.add(doc.dateFinished.toISOString().split('T')[0]);
            }
          });
          lesson.quizzesProgress.forEach(quiz => {
            if (quiz.dateFinished) {
              activeDates.add(quiz.dateFinished.toISOString().split('T')[0]);
            }
          });
          lesson.activitiesProgress.forEach(activity => {
            if (activity.dateFinished) {
              activeDates.add(activity.dateFinished.toISOString().split('T')[0]);
            }
          });
        });
      });

      // Update counts for each active date and track unique users
      activeDates.forEach(date => {
        if (!dateCounts.has(date)) {
          dateCounts.set(date, { count: 0, uniqueUsers: new Set() });
        }
        dateCounts.get(date).count += 1; // Increment count for the date
        dateCounts.get(date).uniqueUsers.add(userId); // Add userId to the set of unique users
      });
    }

    // Create ActiveUserLog entries
    const activeUserLogEntries = Array.from(dateCounts.entries()).map(([date, { count, uniqueUsers }]) => ({
      date,
      activeUserCount: count,
      uniqueUsers: Array.from(uniqueUsers) // Convert Set to Array for MongoDB
    }));

    // Insert ActiveUserLog entries in bulk
    if (activeUserLogEntries.length > 0) {
      await ActiveUserLog.insertMany(activeUserLogEntries);
      console.log(`Created ${activeUserLogEntries.length} ActiveUserLog entries`);
    } else {
      console.log('No active user data found to insert');
    }

    // Verify the results
    const totalCount = await ActiveUserLog.countDocuments();
    console.log(`Total ActiveUserLog entries: ${totalCount}`);

    // Display some sample data
    const sampleData = await ActiveUserLog.find().sort({ date: -1 }).limit(5);
    console.log('Sample ActiveUserLog data:');
    console.log(sampleData);

  } catch (error) {
    console.error('Error initializing ActiveUserLog:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

initializeActiveUserLog();