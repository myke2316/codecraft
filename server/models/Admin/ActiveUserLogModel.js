import mongoose from 'mongoose';

const activeUserLogSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Store as 'YYYY-MM-DD'
  activeUserCount: { type: Number, required: true, default: 0 },
  uniqueUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user IDs counted for the day
});

const ActiveUserLog = mongoose.model('ActiveUserLog', activeUserLogSchema);

export default ActiveUserLog;