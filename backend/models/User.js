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
  isBlockedUntil: {
    type: Date,
    default: null,
  },
  blockReason: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpiry: {
    type: Date,
    default: null,
  },
  uid: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to generate a unique 8-digit ID
userSchema.pre('save', async function (next) {
  if (!this.uid) {
    let uniqueId = '';
    let exists = true;
    while (exists) {
      // Generate a random 8-digit number string
      uniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();
      const existingUser = await mongoose.models.User.findOne({ uid: uniqueId });
      if (!existingUser) {
        exists = false;
      }
    }
    this.uid = uniqueId;
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
