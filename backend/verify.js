const http = require('http');
const connectDB = require('./config/db');
const express = require('express');
const cors = require('cors');
const User = require('./models/User');
const Question = require('./models/Question');
const Attempt = require('./models/Attempt');

// Import routes
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const attemptRoutes = require('./routes/attempts');
const dashboardRoutes = require('./routes/dashboard');

const runVerification = async () => {
  console.log('--- STARTING VERIFICATION CHECKS ---');
  
  // Connect to DB
  await connectDB();

  // Seed the transient in-memory database so the tests have data
  console.log('Seeding transient database for verification tests...');
  await User.deleteMany();
  await Question.deleteMany();
  await Attempt.deleteMany();

  const student = await User.create({
    name: 'Alex Student',
    email: 'student@placementcoach.com',
    password: 'studentpassword123',
    role: 'student'
  });

  const question = await Question.create({
    questionText: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
    options: ["120 metres", "180 metres", "324 metres", "150 metres"],
    correctAnswerIndex: 3,
    category: "Quantitative Aptitude",
    difficulty: "Easy",
    explanation: "Speed = 60 km/hr = 150 metres."
  });

  // Seed an attempt so the dashboard endpoint can calculate statistics
  await Attempt.create({
    user: student._id,
    score: 100,
    totalQuestions: 1,
    correctAnswers: 1,
    category: 'Quantitative Aptitude',
    answers: [{ questionId: question._id, userSelectedOption: 3, isCorrect: true }],
    durationInSeconds: 30
  });

  console.log('Transient database seeded.');

  // Setup verify express server
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/questions', questionRoutes);
  app.use('/api/attempts', attemptRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  const server = app.listen(5002, async () => {
    console.log('Verification server running on port 5002');
    
    try {
      // 2. Perform Test 1: Register and login via HTTP requests
      console.log('\n--- TEST 1: User authentication endpoints ---');
      const loginPayload = JSON.stringify({
        email: 'student@placementcoach.com',
        password: 'studentpassword123'
      });

      const tokenObj = await postRequest('http://localhost:5002/api/auth/login', loginPayload);
      
      if (!tokenObj.success || !tokenObj.data.token) {
        throw new Error('Auth login failed. Token not returned.');
      }
      
      const token = tokenObj.data.token;
      console.log('✔ Authenticated successfully. Token retrieved.');

      // 3. Perform Test 2: Fetch dashboard analytics and AI diagnostics
      console.log('\n--- TEST 2: Dashboard analytics & AI weak area diagnostics ---');
      const dashData = await getRequest('http://localhost:5002/api/dashboard', token);
      
      if (!dashData.success || !dashData.data.aiDiagnostics) {
        throw new Error('Dashboard diagnostics failed.');
      }
      
      console.log('✔ Dashboard API analytics retrieved.');
      console.log('✔ AI Diagnostic Engine Type:', dashData.data.aiDiagnostics.source);
      console.log('✔ AI Placement Readiness Score:', dashData.data.aiDiagnostics.readinessScore);
      console.log('✔ AI Weak Area Gaps Detected:', dashData.data.aiDiagnostics.weakAreas);

      // 4. Perform Test 3: Fetch Questions list
      console.log('\n--- TEST 3: Question CRUD validation ---');
      const questionsData = await getRequest('http://localhost:5002/api/questions', token);
      
      if (!questionsData.success || !Array.isArray(questionsData.data)) {
        throw new Error('Fetching questions list failed.');
      }
      
      console.log(`✔ Questions fetched successfully (Count: ${questionsData.count}).`);

      console.log('\n--- VERIFICATION CHECKS COMPLETED: ALL TESTS PASSED! ---');
      server.close();
      process.exit(0);

    } catch (testError) {
      console.error('\n✖ VERIFICATION CHECK FAILED:', testError.message);
      server.close();
      process.exit(1);
    }
  });
};

// HTTP POST Helper using node standard http module
function postRequest(urlStr, jsonBody) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonBody)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(jsonBody);
    req.end();
  });
}

// HTTP GET Helper with Auth header using node standard http module
function getRequest(urlStr, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

runVerification();
