// Route handlers for peer reviews
import express from 'express';
import Review from '../models/Review.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Submit a review for a completed session
// POST /api/reviews
router.post('/', protect, async (req, res) => {
  const { sessionId, rating, comment } = req.body;

  try {
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if session status is completed
    if (session.status !== 'completed') {
      return res.status(400).json({ message: 'Reviews can only be written for completed sessions.' });
    }

    // Check if reviewer is part of the session
    const isSender = session.sender.toString() === req.user._id.toString();
    const isReceiver = session.receiver.toString() === req.user._id.toString();

    if (!isSender && !isReceiver) {
      return res.status(401).json({ message: 'You are not part of this session' });
    }

    // The reviewee is the other person in the session
    const revieweeId = isSender ? session.receiver : session.sender;

    // Check if user has already reviewed this session
    const existingReview = await Review.findOne({
      reviewer: req.user._id,
      session: sessionId,
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this session!' });
    }

    // Create the review
    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: revieweeId,
      session: sessionId,
      rating,
      comment,
    });

    // --- MANUAL RATING AGGREGATION (COLLEGE PROJECT STYLE) ---
    // Fetch all reviews left for the reviewee to recalculate their average score
    const allReviewsForUser = await Review.find({ reviewee: revieweeId });
    const reviewCount = allReviewsForUser.length;
    
    // Sum up the ratings
    const totalRatingSum = allReviewsForUser.reduce((acc, current) => acc + current.rating, 0);
    const rawAverage = totalRatingSum / reviewCount;
    // Round to 1 decimal place (e.g. 4.7)
    const roundedAverage = Math.round(rawAverage * 10) / 10;

    // Update the User document in MongoDB
    await User.findByIdAndUpdate(revieweeId, {
      averageRating: roundedAverage,
      reviewCount: reviewCount,
    });
    // ---------------------------------------------------------

    const populatedReview = await review.populate([
      { path: 'reviewer', select: 'name avatar' },
      { path: 'reviewee', select: 'name avatar' },
    ]);

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error creating peer review' });
  }
});

// GET all reviews received by a user
// GET /api/reviews/user/:id
router.get('/user/:id', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching user reviews' });
  }
});

export default router;
