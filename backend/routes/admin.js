// Route handlers for Admin Dashboard operations
import express from 'express';
import User from '../models/User.js';
import Report from '../models/Report.js';
import Message from '../models/Message.js';
import Session from '../models/Session.js';
import Review from '../models/Review.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Custom admin authorization middleware helper
const adminProtect = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin.' });
  }
};

// 1. Get all users details for the directory
// GET /api/admin/users
router.get('/users', protect, adminProtect, async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching admin users directory.' });
  }
});

// 2. Delete any user account (and clean up related items)
// DELETE /api/admin/users/:id
router.delete('/users/:id', protect, adminProtect, async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Do not allow deleting other admin accounts
    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot delete admin accounts.' });
    }

    // Delete User record
    await User.findByIdAndDelete(userId);

    // Clean up related databases records
    await Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });
    await Session.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });
    await Review.deleteMany({ $or: [{ reviewer: userId }, { reviewedUser: userId }] });
    await Report.deleteMany({ $or: [{ reporter: userId }, { reportedUser: userId }] });

    res.json({ message: 'User account and all related data deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting user account.' });
  }
});

// 3. Send warning message to any user
// POST /api/admin/users/:id/warning
router.post('/users/:id/warning', protect, adminProtect, async (req, res) => {
  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    return res.status(400).json({ message: 'Warning reason is required.' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Push new warning detail
    user.warnings.push({ reason: reason.trim() });
    await user.save();

    res.json({ message: 'Warning sent to user successfully.', warnings: user.warnings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error sending warning.' });
  }
});

// 4. Get all user reports
// GET /api/admin/reports
router.get('/reports', protect, adminProtect, async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching reports.' });
  }
});

// 5. Dismiss/delete a user report
// DELETE /api/admin/reports/:id
router.delete('/reports/:id', protect, adminProtect, async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }
    res.json({ message: 'Report dismissed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error dismissing report.' });
  }
});

// 6. List all unique conversation pairs in the database
// GET /api/admin/chats/conversations
router.get('/chats/conversations', protect, adminProtect, async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .sort({ createdAt: -1 });

    // Group by unique user pair keys
    const conversationsMap = {};
    messages.forEach((msg) => {
      if (!msg.sender || !msg.receiver) return;
      
      const id1 = msg.sender._id.toString();
      const id2 = msg.receiver._id.toString();
      const key = [id1, id2].sort().join('-');

      if (!conversationsMap[key]) {
        conversationsMap[key] = {
          user1: msg.sender,
          user2: msg.receiver,
          lastMessage: msg,
        };
      }
    });

    const conversations = Object.values(conversationsMap);
    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching audited conversations.' });
  }
});

// 7. Get chat messages between two users
// GET /api/admin/chats/messages/:userId1/:userId2
router.get('/chats/messages/:userId1/:userId2', protect, adminProtect, async (req, res) => {
  const { userId1, userId2 } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 },
      ],
    })
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching message logs.' });
  }
});

export default router;
