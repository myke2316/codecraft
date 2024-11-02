// routes/analytics.js
import express from 'express';
import ActiveUserLog from '../../models/Admin/ActiveUserLogModel.js';
import { fetchActiveUserLogs } from '../../controller/Admin/ActiveUserController.js';
const router = express.Router();

// Route to log an active user


// Route to fetch historical active user logs
router.get('/', fetchActiveUserLogs);

export { router as activeUserRouter };