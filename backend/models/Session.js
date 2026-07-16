// Model for scheduling tutoring sessions between users
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  // The user who requested the session
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The user who receives the request
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The skill being taught by the sender
  offeredSkill: {
    type: String,
    required: true,
  },
  // The skill being taught by the receiver
  receivedSkill: {
    type: String,
    required: true,
  },
  // Proposed date and time for the meeting
  sessionDate: {
    type: Date,
    required: true,
  },
  // Duration in minutes (e.g. 60)
  duration: {
    type: Number,
    required: true,
  },
  // Status: pending, accepted, rejected, completed
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;
