// Route handlers for Chat logs and active inbox conversations
import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET all messages between logged-in user and target user
// GET /api/chats/messages/:userId
router.get('/messages/:userId', protect, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user._id;

    // Fetch messages where sender is current user and receiver is target, or vice versa
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: 1 }) // Order from oldest to newest (ascending)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    // Mark incoming messages as read
    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching messages logs' });
  }
});

// GET all active chat partners and last message details
// GET /api/chats/conversations
router.get('/conversations', protect, async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // 1. Fetch all messages involving the logged-in user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    }).sort({ createdAt: -1 }); // Order newest first

    // 2. Loop through messages to identify unique conversation partners
    const conversationPartnersMap = new Map();
    for (const msg of messages) {
      // Find the ID of the other user in the conversation
      const partnerId =
        msg.sender.toString() === currentUserId.toString()
          ? msg.receiver.toString()
          : msg.sender.toString();

      // Only save the newest message for each unique partner
      if (!conversationPartnersMap.has(partnerId)) {
        conversationPartnersMap.set(partnerId, msg);
      }
    }

    // 3. Populate partner details and count unread messages
    const conversations = [];
    for (const [partnerId, lastMessage] of conversationPartnersMap.entries()) {
      const partner = await User.findById(partnerId).select(
        'name avatar email skillsOffered skillsNeeded averageRating'
      );
      
      if (partner) {
        // Count unread messages sent by this partner to the logged-in user
        const unreadCount = await Message.countDocuments({
          sender: partnerId,
          receiver: currentUserId,
          read: false,
        });

        conversations.push({
          partner,
          lastMessage,
          unreadCount,
        });
      }
    }

    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error loading conversations list' });
  }
});

export default router;
