require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const seedQuestions = require('./seedQuestions');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const attemptRoutes = require('./routes/attempts');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: dbConnected ? 'ok' : 'degraded',
    message: 'Smart Placement Coach API is running smoothly.',
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

// Root route handler
app.get('/', (req, res) => {
  res.send('API running. Please use /api/health to check status.');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    await seedQuestions();

    app.listen(PORT, () => {
      console.log(`Server running in mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
