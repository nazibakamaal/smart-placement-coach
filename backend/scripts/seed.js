require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const connectDB = require('../config/db');

const seedQuestions = [
  // Quantitative Aptitude
  {
    questionText: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
    options: ["120 metres", "180 metres", "324 metres", "150 metres"],
    correctAnswerIndex: 3,
    category: "Quantitative Aptitude",
    difficulty: "Easy",
    explanation: "Speed = 60 km/hr = 60 * (5/18) m/s = 50/3 m/s. Length of train = Speed * Time = (50/3) * 9 = 150 metres."
  },
  {
    questionText: "The average weight of 8 person's increases by 2.5 kg when a new person comes in place of one of them weighing 65 kg. What might be the weight of the new person?",
    options: ["76 kg", "85 kg", "70 kg", "80 kg"],
    correctAnswerIndex: 1,
    category: "Quantitative Aptitude",
    difficulty: "Medium",
    explanation: "Total weight increased = 8 * 2.5 = 20 kg. Weight of the new person = 65 + 20 = 85 kg."
  },
  {
    questionText: "A sum of money at compound interest amounts to Rs. 672 in 2 years and to Rs. 714 in 3 years. The rate of interest per annum is:",
    options: ["6%", "6.25%", "5.5%", "6.75%"],
    correctAnswerIndex: 1,
    category: "Quantitative Aptitude",
    difficulty: "Hard",
    explanation: "Interest on Rs. 672 for 1 year = 714 - 672 = Rs. 42. Rate = (42 / 672) * 100% = 6.25%."
  },
  
  // Logical Reasoning
  {
    questionText: "Look at this series: 36, 34, 30, 28, 24, ... What number should come next?",
    options: ["20", "22", "23", "26"],
    correctAnswerIndex: 1,
    category: "Logical Reasoning",
    difficulty: "Easy",
    explanation: "This is an alternating subtraction series. Subtract 2, then subtract 4, then subtract 2, then subtract 4, and so on. (24 - 2 = 22)."
  },
  {
    questionText: "Pointing to a photograph, Vipul said, 'She is the daughter of my grandfather's only son.' How is Vipul related to the girl in the photograph?",
    options: ["Father", "Brother", "Cousin", "Uncle"],
    correctAnswerIndex: 1,
    category: "Logical Reasoning",
    difficulty: "Medium",
    explanation: "Vipul's grandfather's only son is Vipul's father. The daughter of Vipul's father is Vipul's sister. Therefore, Vipul is her brother."
  },
  {
    questionText: "If A + B means A is the brother of B; A - B means A is the sister of B and A * B means A is the father of B. Which of the following means that C is the son of M?",
    options: ["M - N * C + F", "F - C + N * M", "N + M - F * C", "M * N - C + F"],
    correctAnswerIndex: 3,
    category: "Logical Reasoning",
    difficulty: "Hard",
    explanation: "In 'M * N - C + F', M is the father of N. N is the sister of C (so M is father of C). C is brother of F (so C is male). Thus, C is the son of M."
  },

  // Verbal Ability
  {
    questionText: "Choose the word which is most nearly opposite in meaning to the word 'ENORMOUS'.",
    options: ["Tiny", "Soft", "Average", "Weak"],
    correctAnswerIndex: 0,
    category: "Verbal Ability",
    difficulty: "Easy",
    explanation: "ENORMOUS means very large. The opposite of large is tiny."
  },
  {
    questionText: "Fill in the blank: 'The study of earthquakes is known as ________.'",
    options: ["Geography", "Meteorology", "Seismology", "Ecology"],
    correctAnswerIndex: 2,
    category: "Verbal Ability",
    difficulty: "Easy",
    explanation: "Seismology is the scientific study of earthquakes and propagation of elastic waves through the Earth."
  },
  {
    questionText: "Find the synonym of 'PRAGMATIC'.",
    options: ["Idealistic", "Practical", "Arrogant", "Intelligent"],
    correctAnswerIndex: 1,
    category: "Verbal Ability",
    difficulty: "Medium",
    explanation: "Pragmatic means dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations."
  },

  // Technical Aptitude
  {
    questionText: "What is the time complexity to insert a node at the beginning of a Singly Linked List?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
    correctAnswerIndex: 0,
    category: "Technical Aptitude",
    difficulty: "Easy",
    explanation: "Inserting a node at the beginning requires just changing pointers: newNode->next = head; head = newNode. This takes constant O(1) time."
  },
  {
    questionText: "Which database normalization form deals with transitive dependency?",
    options: ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Boyce-Codd Normal Form (BCNF)"],
    correctAnswerIndex: 2,
    category: "Technical Aptitude",
    difficulty: "Medium",
    explanation: "A relation is in 3NF if it is in 2NF and there is no transitive dependency of non-prime attributes on super keys."
  },
  {
    questionText: "What is the output of the following JavaScript code snippet?\nconsole.log(typeof NaN);",
    options: ["'undefined'", "'nan'", "'number'", "'object'"],
    correctAnswerIndex: 2,
    category: "Technical Aptitude",
    difficulty: "Medium",
    explanation: "In JavaScript, NaN (Not-a-Number) is technically a numeric data type, so typeof NaN evaluates to 'number'."
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Question.deleteMany();
    await Attempt.deleteMany();
    console.log('Existing DB collections wiped.');

    // Seed users
    console.log('Seeding users...');
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@placementcoach.com',
      password: 'adminpassword123',
      role: 'admin'
    });

    const student = await User.create({
      name: 'Alex Student',
      email: 'student@placementcoach.com',
      password: 'studentpassword123',
      role: 'student'
    });

    console.log(`Users seeded successfully:`);
    console.log(`- Admin: admin@placementcoach.com / adminpassword123`);
    console.log(`- Student: student@placementcoach.com / studentpassword123`);

    // Seed questions
    console.log('Seeding practice questions...');
    const createdQuestions = await Question.insertMany(seedQuestions);
    console.log(`Seeded ${createdQuestions.length} aptitude questions.`);

    // Seed some test attempts for the student so the dashboard has initial analytics
    console.log('Seeding initial practice attempts for Alex Student...');
    
    // Quantitative Aptitude Test: 3 questions, 2 correct, 1 wrong (66.6% accuracy, score = 67)
    await Attempt.create({
      user: student._id,
      score: 67,
      totalQuestions: 3,
      correctAnswers: 2,
      category: 'Quantitative Aptitude',
      answers: [
        { questionId: createdQuestions[0]._id, userSelectedOption: 3, isCorrect: true },
        { questionId: createdQuestions[1]._id, userSelectedOption: 1, isCorrect: true },
        { questionId: createdQuestions[2]._id, userSelectedOption: 0, isCorrect: false } // wrong
      ],
      durationInSeconds: 110,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    });

    // Verbal Ability Test: 2 questions, 2 correct (100% accuracy, score = 100)
    await Attempt.create({
      user: student._id,
      score: 100,
      totalQuestions: 2,
      correctAnswers: 2,
      category: 'Verbal Ability',
      answers: [
        { questionId: createdQuestions[6]._id, userSelectedOption: 0, isCorrect: true },
        { questionId: createdQuestions[7]._id, userSelectedOption: 2, isCorrect: true }
      ],
      durationInSeconds: 45,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    });

    console.log('Attempts seeded successfully.');
    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seed:', error);
    process.exit(1);
  }
};

seedDB();
