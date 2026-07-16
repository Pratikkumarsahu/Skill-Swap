// Route handlers for Authentication
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper function to create a JSON Web Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Expires in 30 days
  });
};

// Route to register a new user
// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, skillsOffered, skillsNeeded, bio } = req.body;

  try {
    // 1. Check if user already exists in the database
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash the user password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create a default avatar image url using ui-avatars API
    const initialAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;

    // 4. Save the user to MongoDB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      skillsOffered: skillsOffered || [],
      skillsNeeded: skillsNeeded || [],
      bio: bio || '',
      avatar: initialAvatar,
    });

    // 5. Send back user data along with JWT token
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        skillsOffered: user.skillsOffered,
        skillsNeeded: user.skillsNeeded,
        bio: user.bio,
        avatar: user.avatar,
        averageRating: user.averageRating,
        reviewCount: user.reviewCount,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Failed to create user' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during registration' });
  }
});

// Route to authenticate user and login
// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user and explicitly select their password for comparison
    const user = await User.findOne({ email }).select('+password');

    // Compare passwords and login if it matches
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        skillsOffered: user.skillsOffered,
        skillsNeeded: user.skillsNeeded,
        bio: user.bio,
        avatar: user.avatar,
        averageRating: user.averageRating,
        reviewCount: user.reviewCount,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during login' });
  }
});

// Route to get logged-in user profile details
// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching user profile' });
  }
});

// Route to update logged-in user profile fields
// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Update values if provided in request body, otherwise keep existing values
      user.name = req.body.name || user.name;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.skillsOffered = req.body.skillsOffered || user.skillsOffered;
      user.skillsNeeded = req.body.skillsNeeded || user.skillsNeeded;

      // Re-generate avatar if name changed
      if (req.body.name && req.body.name !== user.name) {
        user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.body.name)}&background=random&color=fff&size=128`;
      }

      const updatedUser = await user.save();

      // Send back updated profile
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        skillsOffered: updatedUser.skillsOffered,
        skillsNeeded: updatedUser.skillsNeeded,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        averageRating: updatedUser.averageRating,
        reviewCount: updatedUser.reviewCount,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating user profile' });
  }
});

export default router;
