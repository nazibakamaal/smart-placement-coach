const express = require('express');
const router = express.Router();
const Attempt = require('../models/Attempt');
const { protect } = require('../middleware/auth');

// @desc    Submit a test attempt
// @route   POST /api/attempts
// @access  Private
router.post('/', protect, async (req, res) => {
  const { score, totalQuestions, correctAnswers, category, answers, durationInSeconds } = req.body;

  try {
    const attempt = await Attempt.create({
      user: req.user._id,
      score,
      totalQuestions,
      correctAnswers,
      category,
      answers,
      durationInSeconds
    });

    res.status(201).json({ success: true, data: attempt });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Get logged in user's test attempts
// @route   GET /api/attempts
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: attempts.length, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get detailed analysis of a specific attempt
// @route   GET /api/attempts/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const attempt = await Attempt.findOne({ _id: req.params.id, user: req.user._id })
      .populate('answers.questionId');

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found or unauthorized' });
    }

    res.json({ success: true, data: attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
