// Model for storing user information (students)
import mongoose from 'mongoose';

// Definition of the user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Prevents password from being returned in normal searches
  },
  skillsOffered: {
    type: [String], // Array of strings (e.g., ["Python", "JavaScript"])
    default: [],
  },
  skillsNeeded: {
    type: [String], // Array of strings (e.g., ["Figma", "UI/UX"])
    default: [],
  },
  bio: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  warnings: [
    {
      reason: { type: String, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);
export default User;
