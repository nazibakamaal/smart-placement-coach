import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  HelpCircle, Clock, CheckCircle2, XCircle, AlertTriangle, 
  ArrowLeft, ArrowRight, LayoutGrid, Award, CheckSquare, ListPlus 
} from 'lucide-react';

const AptitudeTest = () => {
  const navigate = useNavigate();

  // Test states
  const [step, setStep] = useState('select'); // 'select' | 'testing' | 'results'
  const [category, setCategory] = useState('Quantitative Aptitude');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { questionId: selectedIndex }
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Result states
  const [result, setResult] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);

  const categories = [
    'Quantitative Aptitude',
    'Logical Reasoning',
    'Verbal Ability',
    'Technical Aptitude'
  ];

  // Handle assessment countdown timer
  useEffect(() => {
    let timer;
    if (step === 'testing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto submit
            handleSubmitTest(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const startTest = async () => {

    alert("startTest called");
  
    setLoading(true);
    setError(null);
  
    try {
      console.log("Selected Category:", category);
      const response = await api.get(`/questions/random?category=${encodeURIComponent(category)}&limit=5`);
      if (response.data.success && response.data.data.length > 0) {
        setQuestions(response.data.data);
        setUserAnswers({});
        setTimeLeft(300);
        setCurrentIndex(0);
        setStep('testing');
      } else {
        setError('No questions available in this category yet. Please ask Admin to add some questions.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch questions. Ensure database is running and seeded.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitTest = async (isTimeOut = false) => {
    if (!isTimeOut && !window.confirm('Are you sure you want to submit your assessment?')) {
      return;
    }

    setLoading(true);
    const duration = 300 - timeLeft;
    setTimeTaken(duration);

    // Calculate score
    let correct = 0;
    const answersData = questions.map(q => {
      const selected = userAnswers[q._id];
      const isCorrect = selected === q.correctAnswerIndex;
      if (isCorrect) correct++;

      return {
        questionId: q._id,
        userSelectedOption: selected !== undefined ? selected : -1,
        isCorrect: selected !== undefined ? isCorrect : false
      };
    });

    const scorePct = Math.round((correct / questions.length) * 100);

    try {
      // POST Attempt to backend
      const attemptResponse = await api.post('/attempts', {
        score: scorePct,
        totalQuestions: questions.length,
        correctAnswers: correct,
        category: category,
        answers: answersData,
        durationInSeconds: duration
      });

      if (attemptResponse.data.success) {
        setResult({
          score: scorePct,
          totalQuestions: questions.length,
          correctAnswers: correct,
          answers: answersData
        });
        setStep('results');
      } else {
        setError('Error saving your test attempt.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to server to save results.');
    } finally {
      setLoading(false);
    }
  };

  // Timer formatter (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* STEP 1: Assessment category selection */}
        {step === 'select' && (
          <div className="glass-panel p-8 rounded-2xl space-y-6">
            <div className="text-center">
              <HelpCircle className="h-12 w-12 text-brand-500 mx-auto mb-3" />
              <h1 className="text-3xl font-extrabold text-white">Aptitude Assessments</h1>
              <p className="text-slate-400 text-sm mt-1">Select a subject category to evaluate your aptitude.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center space-x-2 text-sm">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-5 rounded-xl border text-left transition-all ${
                    category === cat
                      ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/5'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <h3 className={`font-bold ${category === cat ? 'text-brand-400' : 'text-slate-200'}`}>{cat}</h3>
                  <p className="text-xs text-slate-500 mt-1">Contains 5 random practice questions.</p>
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-850 flex justify-end">
              <button
                onClick={startTest}
                disabled={loading}
                className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-md shadow-brand-600/25 disabled:opacity-50"
              >
                {loading ? 'Fetching Questions...' : 'Start Practice Assessment'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: active testing interface */}
        {step === 'testing' && questions.length > 0 && (
          <div className="space-y-6">
            
            {/* Header: Topic, Timer & Submissions */}
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-brand-400 uppercase tracking-wide">{category}</span>
                <h2 className="text-lg font-bold text-white">Practice Mock Assessment</h2>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 font-mono text-sm">
                  <Clock className="h-4 w-4 animate-pulse" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
                <button
                  onClick={() => handleSubmitTest(false)}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-colors"
                >
                  Submit Test
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Question Navigation List (Left column on md) */}
              <div className="glass-panel p-4 rounded-xl md:col-span-1 h-fit">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <LayoutGrid className="h-4 w-4" />
                  <span>Questions</span>
                </h3>
                <div className="grid grid-cols-5 md:grid-cols-3 gap-2">
                  {questions.map((_, idx) => {
                    const isAnswered = userAnswers[questions[idx]._id] !== undefined;
                    const isActive = currentIndex === idx;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-9 rounded-lg text-xs font-bold transition-all border ${
                          isActive 
                            ? 'border-brand-500 bg-brand-500/10 text-brand-400' 
                            : isAnswered 
                              ? 'border-slate-800 bg-slate-800 text-slate-200' 
                              : 'border-slate-800/80 bg-slate-900/30 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Question Render (Right column on md) */}
              <div className="glass-panel p-6 rounded-xl md:col-span-3 space-y-6">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase border border-slate-700 rounded text-slate-400">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <p className="text-slate-200 font-medium text-base mt-3 leading-relaxed whitespace-pre-wrap">
                    {questions[currentIndex].questionText}
                  </p>
                </div>

                {/* Question Options */}
                <div className="space-y-3">
                  {questions[currentIndex].options.map((option, idx) => {
                    const isSelected = userAnswers[questions[currentIndex]._id] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(questions[currentIndex]._id, idx)}
                        className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-center space-x-3 ${
                          isSelected 
                            ? 'border-brand-500 bg-brand-500/5 text-slate-100 font-medium shadow-md shadow-brand-500/5' 
                            : 'border-slate-800 bg-slate-900/30 text-slate-300 hover:border-slate-800'
                        }`}
                      >
                        <span className={`h-5 w-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                          isSelected 
                            ? 'border-brand-500 bg-brand-500 text-white' 
                            : 'border-slate-700 bg-slate-800 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Nav buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-850">
                  <button
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="flex items-center space-x-1 px-4 py-2 border border-slate-800 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                  >
                    <ArrowLeft className="h-4.5 w-4.5" />
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="flex items-center space-x-1 px-4 py-2 border border-slate-800 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* STEP 3: test summary and solution explanation key */}
        {step === 'results' && result && (
          <div className="space-y-6">
            
            {/* Scorecard Hero Banner */}
            <div className="glass-panel p-8 rounded-2xl text-center space-y-4 border-brand-500/10">
              <Award className="h-14 w-14 text-brand-500 mx-auto" />
              <div>
                <span className="text-xs font-bold text-slate-450 uppercase tracking-widest">{category} Assessment Finished</span>
                <h2 className="text-2xl font-extrabold text-white mt-1">Your Results</h2>
              </div>
              
              <div className="flex justify-center space-x-8 py-3.5 max-w-sm mx-auto">
                <div className="text-center">
                  <p className="text-xs text-slate-500 font-semibold uppercase">Total Score</p>
                  <p className="text-3xl font-extrabold text-brand-400 mt-1">{result.score}%</p>
                </div>
                <div className="w-px bg-slate-800"></div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 font-semibold uppercase">Correct Answers</p>
                  <p className="text-3xl font-extrabold text-emerald-400 mt-1">
                    {result.correctAnswers} / {result.totalQuestions}
                  </p>
                </div>
                <div className="w-px bg-slate-800"></div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 font-semibold uppercase">Time Taken</p>
                  <p className="text-3xl font-extrabold text-slate-200 mt-1">
                    {Math.floor(timeTaken / 60)}m {timeTaken % 60}s
                  </p>
                </div>
              </div>

              <div className="flex justify-center space-x-3 pt-4">
                <button
                  onClick={() => setStep('select')}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 hover:text-white transition-colors"
                >
                  Take Another Assessment
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md shadow-brand-600/15"
                >
                  View Performance Dashboard
                </button>
              </div>
            </div>

            {/* Comprehensive Solutions / Explanations section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-200 flex items-center space-x-2 px-1">
                <CheckSquare className="h-5 w-5 text-brand-400" />
                <span>Question Review & Explanation Key</span>
              </h3>

              {questions.map((q, idx) => {
                const userAnsObj = result.answers.find(a => a.questionId === q._id);
                const userChoice = userAnsObj ? userAnsObj.userSelectedOption : -1;
                const isCorrect = userAnsObj ? userAnsObj.isCorrect : false;

                return (
                  <div key={q._id} className="glass-panel p-5 rounded-xl space-y-4 border-slate-800/80">
                    <div className="flex items-start justify-between space-x-3">
                      <h4 className="text-sm font-semibold text-slate-200 leading-relaxed">
                        <span className="text-brand-400 mr-1.5 font-bold">Q{idx + 1}.</span>
                        {q.questionText}
                      </h4>
                      {isCorrect ? (
                        <span className="flex items-center space-x-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Correct</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Incorrect</span>
                        </span>
                      )}
                    </div>

                    {/* Show options with color coding */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, oIdx) => {
                        const isCorrectOption = oIdx === q.correctAnswerIndex;
                        const isUserSelected = oIdx === userChoice;

                        let cardStyle = 'border-slate-800 bg-slate-900/10 text-slate-400';
                        if (isCorrectOption) {
                          cardStyle = 'border-emerald-500/30 bg-emerald-500/5 text-emerald-350 font-medium';
                        } else if (isUserSelected && !isCorrect) {
                          cardStyle = 'border-red-500/30 bg-red-500/5 text-red-350';
                        }

                        return (
                          <div key={oIdx} className={`p-3 rounded-lg border text-xs flex items-center space-x-2 ${cardStyle}`}>
                            <span className={`h-4.5 w-4.5 rounded-full border text-[9px] font-bold flex items-center justify-center ${
                              isCorrectOption 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : isUserSelected
                                  ? 'bg-red-500 border-red-500 text-white'
                                  : 'bg-slate-800 border-slate-700 text-slate-455'
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Solution Explanation details */}
                    {q.explanation && (
                      <div className="bg-slate-900/60 border border-slate-850 rounded-lg p-3 text-xs text-slate-400 mt-2.5 leading-relaxed">
                        <strong className="text-slate-200 block mb-0.5">Solution Explanation:</strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AptitudeTest;
