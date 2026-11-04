const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/Models');
const { protect } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'attendify_jwt_secret_change_in_production';

/**
 * Generate a signed JWT for a user id.
 * @param {string} id — MongoDB ObjectId
 * @returns {string} signed JWT valid for 30 days
 */
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// ─── POST /api/auth/signup ──────────────────────────────────────────────────────
router.post('/signup', async (req, res, next) => {
  try {
    const { name, rollNo, email, password } = req.body;

    // Validate required fields
    if (!name || !rollNo || !email || !password) {
      return res.status(400).json({ message: 'All fields are required (name, rollNo, email, password)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user (password is hashed by pre-save hook)
    const user = await User.create({ name, rollNo, email, password });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        targetCriteria: user.targetCriteria,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/auth/login ───────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        targetCriteria: user.targetCriteria,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/auth/me ───────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/auth/profile ──────────────────────────────────────────────────────
router.put('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, rollNo, targetCriteria, password } = req.body;

    if (name !== undefined) user.name = name;
    if (rollNo !== undefined) user.rollNo = rollNo;
    if (targetCriteria !== undefined) user.targetCriteria = targetCriteria;

    // Update password only if provided and meets minimum length
    if (password && password.length >= 6) {
      user.password = password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      rollNo: updatedUser.rollNo,
      targetCriteria: updatedUser.targetCriteria,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
