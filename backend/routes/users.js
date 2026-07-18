import express from 'express';
import User from '../models/User.js'; // Import mongoose model
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET all users except currently logged-in user
// GET /api/users
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching user directory' });
  }
});

// GET specific user profile by user ID
// GET /api/users/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching user details' });
  }
});

// Matchmaking algorithm endpoint to find peers to trade skills with
// GET /api/users/match/explore
router.get('/match/explore', protect, async (req, res) => {
  try {
    const currentUser = req.user;
    
    // Find all other users in database
    const users = await User.find({ _id: { $ne: currentUser._id } });

    // Loop through users and check matching skill tags
    const matches = users.map((otherUser) => {
      // Find skills that other user teaches that current user wants to learn
      const givesToCurrent = otherUser.skillsOffered.filter((skill) =>
        currentUser.skillsNeeded.some((needed) => needed.toLowerCase() === skill.toLowerCase())
      );

      // Find skills that current user teaches that other user wants to learn
      const receivesFromCurrent = otherUser.skillsNeeded.filter((skill) =>
        currentUser.skillsOffered.some((offered) => offered.toLowerCase() === skill.toLowerCase())
      );

      let matchType = 'none';
      let score = 0;

      // Classify the match based on overlap:
      if (givesToCurrent.length > 0 && receivesFromCurrent.length > 0) {
        matchType = 'perfect'; // Double coincidence of wants (perfect match!)
        score = 100;
      } else if (givesToCurrent.length > 0) {
        matchType = 'gives'; // They offer what we want
        score = 60;
      } else if (receivesFromCurrent.length > 0) {
        matchType = 'receives'; // We offer what they want
        score = 40;
      }

      return {
        user: {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          uid: otherUser.uid,
          skillsOffered: otherUser.skillsOffered,
          skillsNeeded: otherUser.skillsNeeded,
          bio: otherUser.bio,
          avatar: otherUser.avatar,
          averageRating: otherUser.averageRating,
          reviewCount: otherUser.reviewCount,
        },
        givesToCurrent,
        receivesFromCurrent,
        matchType,
        score,
      };
    });

    // Filter out users with zero match compatibility
    const filteredMatches = matches
      .filter((m) => m.matchType !== 'none')
      // Sort: perfect matches first, then high rating averages
      .sort((a, b) => b.score - a.score || b.user.averageRating - a.user.averageRating);

    res.json(filteredMatches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during matchmaking query' });
  }
});

export default router;
