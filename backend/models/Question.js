const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Please add a question text'],
    trim: true
  },
  options: {
    type: [String],
    required: [true, 'Please add options'],
    validate: [arr => arr.length >= 2, 'Must have at least 2 options']
  },
  correctAnswerIndex: {
    type: Number,
    required: [true, 'Please specify the correct answer index'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Technical Aptitude'],
    default: 'Quantitative Aptitude'
  },
  difficulty: {
    type: String,
    required: [true, 'Please add a difficulty level'],
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  explanation: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', QuestionSchema);
