// Route handlers for scheduling Swap Sessions
import express from 'express';
import Session from '../models/Session.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET all sessions for the logged-in user (as sender or receiver)
// GET /api/sessions
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate('sender', 'name avatar email averageRating')
      .populate('receiver', 'name avatar email averageRating')
      .sort({ sessionDate: -1 }); // Newest sessions first

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching session calendar' });
  }
});

// Create/Propose a new swap session request
// POST /api/sessions
router.post('/', protect, async (req, res) => {
  const { receiver, offeredSkill, receivedSkill, sessionDate, duration } = req.body;

  try {
    // Check if user is proposing to swap with themselves
    if (req.user._id.toString() === receiver) {
      return res.status(400).json({ message: 'You cannot swap skills with yourself!' });
    }

    // Create session record in database
    const session = await Session.create({
      sender: req.user._id,
      receiver,
      offeredSkill,
      receivedSkill,
      sessionDate,
      duration,
      status: 'pending', // Starts in pending state
    });

    const populatedSession = await session.populate([
      { path: 'sender', select: 'name avatar email averageRating' },
      { path: 'receiver', select: 'name avatar email averageRating' },
    ]);

    res.status(201).json(populatedSession);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error creating swap proposal' });
  }
});

// Update swap session status (accept, decline, or complete)
// PUT /api/sessions/:id
router.put('/:id', protect, async (req, res) => {
  const { status } = req.body;

  try {
    let session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is sender or receiver of the session
    const isSender = session.sender.toString() === req.user._id.toString();
    const isReceiver = session.receiver.toString() === req.user._id.toString();

    if (!isSender && !isReceiver) {
      return res.status(401).json({ message: 'Not authorized to change this session' });
    }

    // Validation checks for status changes:
    if (status === 'accepted' || status === 'rejected') {
      // Only the receiver can accept/decline a pending session request
      if (!isReceiver) {
        return res.status(400).json({ message: 'Only the request receiver can accept or decline.' });
      }
      if (session.status !== 'pending') {
        return res.status(400).json({ message: 'Session is already processed.' });
      }
    }

    if (status === 'completed') {
      // Only accepted sessions can be completed
      if (session.status !== 'accepted') {
        return res.status(400).json({ message: 'Only accepted sessions can be marked completed.' });
      }
    }

    session.status = status;
    await session.save();

    const updatedSession = await Session.findById(req.params.id)
      .populate('sender', 'name avatar email averageRating')
      .populate('receiver', 'name avatar email averageRating');

    res.json(updatedSession);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating swap status' });
  }
});

export default router;
