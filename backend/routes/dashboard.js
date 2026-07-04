const express = require('express');
const router = express.Router();
const Attempt = require('../models/Attempt');
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper to calculate local fallback statistics
const calculateLocalAIStats = (categoryStats, totalAttempts, overallAccuracy) => {
  const weakAreas = [];
  let lowestCategory = null;
  let lowestAcc = 100;

  // Identify weak areas (accuracy < 65%)
  Object.keys(categoryStats).forEach(cat => {
    const accuracy = categoryStats[cat].accuracy;
    if (accuracy < 65) {
      weakAreas.push(cat);
    }
    if (accuracy < lowestAcc) {
      lowestAcc = accuracy;
      lowestCategory = cat;
    }
  });

  // If no category is below 65% but we have attempts, highlight the lowest category
  if (weakAreas.length === 0 && lowestCategory && totalAttempts > 0) {
    weakAreas.push(lowestCategory);
  }

  // Calculate local placement readiness score (0 to 100)
  // Weight: 60% accuracy, 40% experience (number of tests, up to 8 tests = 40 points)
  const accuracyWeight = overallAccuracy * 0.6;
  const experiencePoints = Math.min(8, totalAttempts) * 5; // 8 tests give max 40 points
  let localScore = Math.round(accuracyWeight + experiencePoints);
  
  // Safeguard limits
  if (totalAttempts === 0) {
    localScore = 0;
  } else {
    localScore = Math.max(10, Math.min(100, localScore));
  }

  // Generate dynamic feedback based on results
  let feedback = 'Get started by taking practice tests to analyze your performance.';
  let readinessRationale = 'Take at least one aptitude test to compute your placement readiness score.';

  if (totalAttempts > 0) {
    if (localScore >= 80) {
      feedback = 'Outstanding performance! You are showing excellent command over placement aptitude subjects. Keep practicing to maintain your edge.';
      readinessRationale = `With an overall accuracy of ${overallAccuracy.toFixed(1)}% across ${totalAttempts} mock tests, you demonstrate high proficiency. Strengthen minor areas to hit 90%+ readiness.`;
    } else if (localScore >= 60) {
      feedback = 'Good progress, but there is room for improvement. You are on track for placements. Focus on category-wise weaknesses and time-management.';
      readinessRationale = `Your readiness is ${localScore}/100. Average accuracy is ${overallAccuracy.toFixed(1)}% over ${totalAttempts} tests. Work on topics with sub-65% scores to enter the top tier.`;
    } else {
      feedback = 'We recommend immediate review of core concepts. Consistently practicing quantitative and technical questions will help elevate your scores.';
      readinessRationale = `Placement readiness is currently low (${localScore}/100). Focus on foundational material in ${weakAreas.join(', ') || 'all categories'} and build up test-taking consistency.`;
    }
  }

  return {
    weakAreas: weakAreas.length > 0 ? weakAreas : ['Practice test count is low. Start practicing to generate weak area insights.'],
    feedback,
    readinessScore: localScore,
    readinessRationale
  };
};

// @desc    Get user progress dashboard stats and AI insights
// @route   GET /api/dashboard
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // 1. Fetch user attempts
    const attempts = await Attempt.find({ user: req.user._id }).sort({ createdAt: 1 });

    const totalAttempts = attempts.length;
    let overallAccuracy = 0;
    let totalScore = 0;
    let totalQuestionsAnswered = 0;
    let totalCorrectAnswers = 0;
    let totalDuration = 0;

    const categoryStats = {
      'Quantitative Aptitude': { correct: 0, total: 0, attempts: 0 },
      'Logical Reasoning': { correct: 0, total: 0, attempts: 0 },
      'Verbal Ability': { correct: 0, total: 0, attempts: 0 },
      'Technical Aptitude': { correct: 0, total: 0, attempts: 0 }
    };

    attempts.forEach(att => {
      totalScore += att.score;
      totalCorrectAnswers += att.correctAnswers;
      totalQuestionsAnswered += att.totalQuestions;
      totalDuration += att.durationInSeconds;

      if (categoryStats[att.category]) {
        categoryStats[att.category].correct += att.correctAnswers;
        categoryStats[att.category].total += att.totalQuestions;
        categoryStats[att.category].attempts += 1;
      }
    });

    if (totalQuestionsAnswered > 0) {
      overallAccuracy = (totalCorrectAnswers / totalQuestionsAnswered) * 100;
    }

    // Format category stats for frontend charting
    const formattedCategoryStats = Object.keys(categoryStats).map(cat => {
      const total = categoryStats[cat].total;
      const correct = categoryStats[cat].correct;
      return {
        category: cat,
        attempts: categoryStats[cat].attempts,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0
      };
    });

    // Format attempts for history line chart
    const history = attempts.map((att, idx) => ({
      testIndex: `Test ${idx + 1}`,
      score: att.score,
      category: att.category,
      date: att.createdAt.toLocaleDateString()
    }));

    // Calculate default local metrics (which also act as our robust fallback)
    const localMetrics = calculateLocalAIStats(
      categoryStats,
      totalAttempts,
      overallAccuracy
    );

    let aiMetrics = { ...localMetrics, source: 'local' };

    // 2. Try Google Gemini API Integration if API Key exists
    if (process.env.GEMINI_API_KEY && totalAttempts > 0) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using standard flash model for quick and efficient processing
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash"
        });

        const prompt = `
          You are an expert AI Career Coach and Aptitude Mentor.
          Analyze the student's mock placement test performance logs below and provide career diagnostic insights.

          STUDENT STATS:
          - Total tests taken: ${totalAttempts}
          - Overall Accuracy: ${overallAccuracy.toFixed(1)}%
          - Total Questions Attempted: ${totalQuestionsAnswered}
          - Total Correct: ${totalCorrectAnswers}
          - Performance breakdown per category:
            ${JSON.stringify(formattedCategoryStats)}
          
          Provide feedback identifying:
          1. Target weak areas (topics needing improvement).
          2. Placement readiness score (a number between 0 and 100 based on accuracy, number of tests, and balance across fields).
          3. Rationale for this score.
          4. Actionable tips.

          You MUST return the response strictly in JSON format. Do not include markdown blocks like \`\`\`json. Output only raw JSON matching this structure:
          {
            "weakAreas": ["Topic A", "Topic B"],
            "feedback": "Encouraging dashboard review/study tips",
            "readinessScore": 75,
            "readinessRationale": "Explanation details here"
          }
        `;

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        });
        
        const responseText = result.response.text();
        const parsedAI = JSON.parse(responseText);

        if (parsedAI && parsedAI.readinessScore !== undefined) {
          aiMetrics = {
            weakAreas: parsedAI.weakAreas || localMetrics.weakAreas,
            feedback: parsedAI.feedback || localMetrics.feedback,
            readinessScore: Number(parsedAI.readinessScore),
            readinessRationale: parsedAI.readinessRationale || localMetrics.readinessRationale,
            source: 'gemini'
          };
        }
      } catch (geminiError) {
        console.error('Gemini API request failed. Falling back to local AI analysis:', geminiError.message);
        // Keep using localMetrics
      }
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalTests: totalAttempts,
          overallAccuracy: Math.round(overallAccuracy),
          totalQuestionsAnswered,
          averageDurationPerTest: totalAttempts > 0 ? Math.round(totalDuration / totalAttempts) : 0
        },
        categoryPerformance: formattedCategoryStats,
        history,
        aiDiagnostics: aiMetrics
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
