// Route handlers for reporting users
import express from 'express';
import Report from '../models/Report.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Route to submit a new report against a user
// POST /api/reports
router.post('/', protect, async (req, res) => {
  const { reportedUserId, reason } = req.body;

  try {
    // 1. Validation check
    if (!reportedUserId || !reason) {
      return res.status(400).json({ message: 'Reported user ID and reason are required.' });
    }

    // 2. Prevent user from reporting themselves
    if (reportedUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot report yourself.' });
    }

    // 3. Save the report in MongoDB
    const report = await Report.create({
      reporter: req.user._id,
      reportedUser: reportedUserId,
      reason: reason.trim(),
    });

    res.status(201).json({
      message: 'Report submitted successfully.',
      report,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error submitting user report.' });
  }
});

export default router;
