// Route handlers for Authentication with Email OTP verification support
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { sendOtpEmail } from '../utils/email.js';

const router = express.Router();

// Helper function to create a JSON Web Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
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

    // 3. Create a default avatar image url
    const initialAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;

    // 4. Generate 6-digit OTP code and set expiry to 10 minutes
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    // 5. Save the user to MongoDB as unverified
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      skillsOffered: skillsOffered || [],
      skillsNeeded: skillsNeeded || [],
      bio: bio || '',
      avatar: initialAvatar,
      isVerified: false,
      otp,
      otpExpiry,
    });

    if (user) {
      // Send the OTP email (falls back to console logging if credentials not set)
      await sendOtpEmail(email, otp);

      res.status(201).json({
        message: 'Registration successful. Verification OTP sent to email.',
        email: user.email,
        isVerified: false,
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
        isAdmin: user.isAdmin,
        warnings: user.warnings,
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

// Route to verify OTP code
// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified.' });
    }

    // Check if code matches
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    // Check if expired
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

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
      isAdmin: user.isAdmin,
      warnings: user.warnings,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error verifying OTP.' });
  }
});

// Route to resend OTP code
// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified.' });
    }

    // Generate new OTP code and save
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOtpEmail(email, otp);

    res.json({ message: 'New verification code sent successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error resending OTP.' });
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
        isAdmin: updatedUser.isAdmin,
        warnings: updatedUser.warnings,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating user profile' });
  }
// Diagnostic route to test SMTP configurations
// GET /api/auth/test-email
router.get('/test-email', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Please specify an email query parameter (e.g. ?email=test@example.com)' });
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    await transporter.sendMail({
      from: `"SkillSwap Diagnostic" <${emailUser}>`,
      to: email,
      subject: 'SkillSwap Email Diagnostics',
      text: 'If you are reading this email, your Google SMTP configuration is working perfectly!',
    });

    res.json({
      success: true,
      message: `Diagnostic email successfully sent to ${email}`,
      configUsed: {
        EMAIL_USER: emailUser,
        EMAIL_PASS_LENGTH: emailPass ? emailPass.length : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'SMTP Email Sending Failed',
      errorMessage: error.message,
      configUsed: {
        EMAIL_USER: emailUser,
        EMAIL_PASS_LENGTH: emailPass ? emailPass.length : 0,
      },
    });
  }
});

import nodemailer from 'nodemailer';

export default router;
