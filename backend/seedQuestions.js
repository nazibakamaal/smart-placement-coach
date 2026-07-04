const Question = require('./models/Question');

const sampleQuestions = [
  // Quantitative Aptitude
  {
    questionText: 'If 20% of a number is 50, what is 40% of that number?',
    options: ['80', '100', '120', '150'],
    correctAnswerIndex: 1,
    category: 'Quantitative Aptitude',
    difficulty: 'Easy',
    explanation: 'The number is 50 ÷ 0.20 = 250. Then 40% of 250 = 100.',
  },
  {
    questionText: 'A can complete a work in 10 days and B in 15 days. In how many days will they finish together?',
    options: ['5 days', '6 days', '7 days', '8 days'],
    correctAnswerIndex: 1,
    category: 'Quantitative Aptitude',
    difficulty: 'Medium',
    explanation: 'Combined rate = 1/10 + 1/15 = 1/6, so they finish in 6 days.',
  },
  {
    questionText: 'The ratio of boys to girls in a class is 3:2. If there are 30 boys, how many girls are there?',
    options: ['15', '20', '25', '30'],
    correctAnswerIndex: 1,
    category: 'Quantitative Aptitude',
    difficulty: 'Easy',
    explanation: '3 parts = 30, so 1 part = 10. Girls = 2 parts = 20.',
  },
  {
    questionText: 'What is the probability of drawing a red card from a standard deck of 52 cards?',
    options: ['1/4', '1/3', '1/2', '2/3'],
    correctAnswerIndex: 2,
    category: 'Quantitative Aptitude',
    difficulty: 'Easy',
    explanation: 'There are 26 red cards out of 52, so the probability is 26/52 = 1/2.',
  },
  {
    questionText: 'Find the simple interest on Rs. 5,000 at 10% per annum for 2 years.',
    options: ['Rs. 500', 'Rs. 1,000', 'Rs. 1,500', 'Rs. 2,000'],
    correctAnswerIndex: 1,
    category: 'Quantitative Aptitude',
    difficulty: 'Easy',
    explanation: 'SI = (P × R × T) / 100 = (5000 × 10 × 2) / 100 = Rs. 1,000.',
  },
  {
    questionText: 'A shopkeeper marks goods 40% above cost and gives a 20% discount. What is the profit percentage?',
    options: ['8%', '10%', '12%', '15%'],
    correctAnswerIndex: 2,
    category: 'Quantitative Aptitude',
    difficulty: 'Medium',
    explanation: 'Selling price = 1.40 × 0.80 = 1.12 times cost, so profit is 12%.',
  },

  // Logical Reasoning
  {
    questionText: 'Find the next number in the series: 2, 6, 12, 20, 30, ?',
    options: ['38', '40', '42', '44'],
    correctAnswerIndex: 2,
    category: 'Logical Reasoning',
    difficulty: 'Medium',
    explanation: 'The differences are +4, +6, +8, +10, so the next difference is +12. 30 + 12 = 42.',
  },
  {
    questionText: 'If CAT is coded as 3120, how is DOG coded using the same pattern (C=3, A=1, T=20)?',
    options: ['4157', '4156', '4158', '4159'],
    correctAnswerIndex: 0,
    category: 'Logical Reasoning',
    difficulty: 'Hard',
    explanation: 'D=4, O=15, G=7, so DOG is coded as 4157.',
  },
  {
    questionText: 'All managers are leaders. Some leaders are innovators. Which conclusion definitely follows?',
    options: [
      'All managers are innovators',
      'Some managers may be innovators',
      'No manager is an innovator',
      'All innovators are managers',
    ],
    correctAnswerIndex: 1,
    category: 'Logical Reasoning',
    difficulty: 'Medium',
    explanation: 'Since only some leaders are innovators, some managers may be innovators, but it is not guaranteed for all.',
  },
  {
    questionText: 'A is taller than B. C is shorter than B. D is taller than A. Who is the tallest?',
    options: ['A', 'B', 'C', 'D'],
    correctAnswerIndex: 3,
    category: 'Logical Reasoning',
    difficulty: 'Easy',
    explanation: 'Order from tallest to shortest: D > A > B > C. So D is the tallest.',
  },
  {
    questionText: 'In a certain code, each letter is shifted forward by 1. How is RIVER written?',
    options: ['SJWFQ', 'SJWFQS', 'SJWF', 'SJVGQ'],
    correctAnswerIndex: 0,
    category: 'Logical Reasoning',
    difficulty: 'Hard',
    explanation: 'R→S, I→J, V→W, E→F, R→Q gives SJWFQ.',
  },
  {
    questionText: 'Which figure completes the pattern: Circle, Square, Circle, Square, Circle, ?',
    options: ['Triangle', 'Square', 'Circle', 'Rectangle'],
    correctAnswerIndex: 1,
    category: 'Logical Reasoning',
    difficulty: 'Easy',
    explanation: 'The pattern alternates between Circle and Square, so the next figure is Square.',
  },

  // Verbal Ability
  {
    questionText: 'Choose the word closest in meaning to "ABUNDANT".',
    options: ['Scarce', 'Plentiful', 'Tiny', 'Weak'],
    correctAnswerIndex: 1,
    category: 'Verbal Ability',
    difficulty: 'Easy',
    explanation: 'Abundant means existing in large quantities; plentiful is the closest synonym.',
  },
  {
    questionText: 'Select the correctly spelled word.',
    options: ['Accomodate', 'Accommodate', 'Acommodate', 'Accomadate'],
    correctAnswerIndex: 1,
    category: 'Verbal Ability',
    difficulty: 'Easy',
    explanation: 'The correct spelling is "Accommodate" with double c and double m.',
  },
  {
    questionText: 'Fill in the blank: The committee reached a unanimous ______ on the proposal.',
    options: ['decision', 'decisions', 'decide', 'deciding'],
    correctAnswerIndex: 0,
    category: 'Verbal Ability',
    difficulty: 'Easy',
    explanation: 'The noun "decision" correctly completes the sentence after the adjective "unanimous".',
  },
  {
    questionText: 'Identify the error: "Neither the students nor the teacher were present."',
    options: ['Neither', 'nor', 'were', 'present'],
    correctAnswerIndex: 2,
    category: 'Verbal Ability',
    difficulty: 'Medium',
    explanation: 'With "neither...nor", the verb agrees with the nearer subject "teacher", so it should be "was".',
  },
  {
    questionText: 'Choose the antonym of "BREVITY".',
    options: ['Conciseness', 'Verbosity', 'Clarity', 'Precision'],
    correctAnswerIndex: 1,
    category: 'Verbal Ability',
    difficulty: 'Medium',
    explanation: 'Brevity means shortness; verbosity (using too many words) is its antonym.',
  },
  {
    questionText: 'Rearrange to form a meaningful sentence: "important / an / is / education / asset".',
    options: [
      'Education is an important asset',
      'An education is asset important',
      'Important education is an asset',
      'Asset is an important education',
    ],
    correctAnswerIndex: 0,
    category: 'Verbal Ability',
    difficulty: 'Easy',
    explanation: 'The correct sentence is "Education is an important asset."',
  },

  // Technical Aptitude
  {
    questionText: 'What is the time complexity of binary search on a sorted array of n elements?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correctAnswerIndex: 1,
    category: 'Technical Aptitude',
    difficulty: 'Easy',
    explanation: 'Binary search halves the search space each step, giving O(log n) time complexity.',
  },
  {
    questionText: 'Which data structure uses FIFO (First In, First Out) order?',
    options: ['Stack', 'Queue', 'Tree', 'Graph'],
    correctAnswerIndex: 1,
    category: 'Technical Aptitude',
    difficulty: 'Easy',
    explanation: 'A queue processes elements in the order they arrive: first in, first out.',
  },
  {
    questionText: 'In SQL, which clause is used to filter rows before grouping?',
    options: ['HAVING', 'WHERE', 'ORDER BY', 'GROUP BY'],
    correctAnswerIndex: 1,
    category: 'Technical Aptitude',
    difficulty: 'Medium',
    explanation: 'WHERE filters rows before aggregation; HAVING filters after GROUP BY.',
  },
  {
    questionText: 'What does HTTP status code 404 indicate?',
    options: ['Server Error', 'Unauthorized', 'Not Found', 'Bad Request'],
    correctAnswerIndex: 2,
    category: 'Technical Aptitude',
    difficulty: 'Easy',
    explanation: '404 Not Found means the requested resource does not exist on the server.',
  },
  {
    questionText: 'Which sorting algorithm has average-case time complexity O(n log n) and is commonly used in practice?',
    options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
    correctAnswerIndex: 2,
    category: 'Technical Aptitude',
    difficulty: 'Medium',
    explanation: 'Merge sort consistently runs in O(n log n) and is stable, making it widely used.',
  },
  {
    questionText: 'In object-oriented programming, which principle restricts direct access to an object\'s internal state?',
    options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'],
    correctAnswerIndex: 2,
    category: 'Technical Aptitude',
    difficulty: 'Easy',
    explanation: 'Encapsulation bundles data and methods while hiding internal details from outside access.',
  },
];

async function seedQuestions() {
  const count = await Question.countDocuments();

  if (count > 0) {
    console.log(`Question collection already has ${count} document(s), skipping seed`);
    return;
  }

  await Question.insertMany(sampleQuestions);
  console.log(`Seeded ${sampleQuestions.length} sample questions`);
}

module.exports = seedQuestions;
