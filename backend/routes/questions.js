const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// @desc    Get all questions (filtered by category if provided)
// @route   GET /api/questions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category) {
      query.category = category;
    }
    
    const questions = await Question.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: questions.length, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get random questions for a test category
// @route   GET /api/questions/random
// @access  Private
router.get('/random', protect, async (req, res) => {
  try {
    const { category, limit } = req.query;
    const size = parseInt(limit, 10) || 5;

    let match = {};
    if (
      category &&
      category !== 'Overall' &&
      category !== 'All' &&
      category !== 'All Topics (Mixed)'
    ) {
      match.category = category;
    } 

    console.log("Category:", category);
    console.log("Match:", match);

    const questions = await Question.aggregate([
      { $match: match },
      { $sample: { size: size } }
    ]);
    
    console.log("Questions Found:", questions.length);

    res.json({ success: true, count: questions.length, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a question
// @route   POST /api/questions
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  const { questionText, options, correctAnswerIndex, category, difficulty, explanation } = req.body;

  try {
    const question = await Question.create({
      questionText,
      options,
      correctAnswerIndex,
      category,
      difficulty,
      explanation
    });

    res.status(201).json({ success: true, data: question });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    let question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: question });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    await Question.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
