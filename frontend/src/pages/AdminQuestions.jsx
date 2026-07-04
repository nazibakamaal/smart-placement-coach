import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Plus, Edit, Trash2, Search, Filter, AlertTriangle, 
  X, Check, HelpCircle, Layers, Star 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminQuestions = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admins
  useEffect(() => {
    if (user && !isAdmin) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, navigate]);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState(null);

  // Form states
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [category, setCategory] = useState('Quantitative Aptitude');
  const [difficulty, setDifficulty] = useState('Medium');
  const [explanation, setExplanation] = useState('');

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/questions');
      if (response.data.success) {
        setQuestions(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load placement questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setActiveQuestionId(null);
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswerIndex(0);
    setCategory('Quantitative Aptitude');
    setDifficulty('Medium');
    setExplanation('');
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (q) => {
    setIsEditing(true);
    setActiveQuestionId(q._id);
    setQuestionText(q.questionText);
    setOptions([...q.options]);
    setCorrectAnswerIndex(q.correctAnswerIndex);
    setCategory(q.category);
    setDifficulty(q.difficulty);
    setExplanation(q.explanation || '');
    setError(null);
    setModalOpen(true);
  };

  const handleOptionChange = (idx, value) => {
    const updated = [...options];
    updated[idx] = value;
    setOptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!questionText.trim()) return setError('Question text is required.');
    if (options.some(opt => !opt.trim())) return setError('All 4 options must be filled.');

    const questionData = {
      questionText,
      options,
      correctAnswerIndex: Number(correctAnswerIndex),
      category,
      difficulty,
      explanation
    };

    try {
      if (isEditing) {
        const res = await api.put(`/questions/${activeQuestionId}`, questionData);
        if (res.data.success) {
          setQuestions(prev => prev.map(q => q._id === activeQuestionId ? res.data.data : q));
        }
      } else {
        const res = await api.post('/questions', questionData);
        if (res.data.success) {
          setQuestions(prev => [res.data.data, ...prev]);
        }
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error saving the question.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this placement question?')) {
      return;
    }

    try {
      const res = await api.delete(`/questions/${id}`);
      if (res.data.success) {
        setQuestions(prev => prev.filter(q => q._id !== id));
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting question.');
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.explanation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (diff === 'Medium') return 'text-brand-400 border-brand-500/20 bg-brand-500/5';
    return 'text-red-400 border-red-500/20 bg-red-500/5';
  };

  if (!isAdmin) {
    return null; // Let the redirect trigger
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Manage Questions</h1>
            <p className="text-slate-400 text-sm mt-1">Admin Dashboard for managing placement test questions.</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all shadow-md shadow-brand-600/15"
          >
            <Plus className="h-5 w-5" />
            <span>Add Question</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative sm:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input pl-10 w-full text-sm"
              placeholder="Search by question text or explanation..."
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Filter className="h-4.5 w-4.5" />
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="glass-input pl-10 w-full text-sm appearance-none bg-slate-900"
            >
              <option value="All">All Categories</option>
              <option value="Quantitative Aptitude">Quantitative Aptitude</option>
              <option value="Logical Reasoning">Logical Reasoning</option>
              <option value="Verbal Ability">Verbal Ability</option>
              <option value="Technical Aptitude">Technical Aptitude</option>
            </select>
          </div>
        </div>

        {/* Table of questions */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 font-semibold">Loading questions...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border-slate-800">
            <HelpCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">No questions found</h3>
            <p className="text-slate-500 text-sm">Add questions or adjust filters to populate list.</p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-medium">
                    <th className="p-4 w-2/5">Question Text</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Difficulty</th>
                    <th className="p-4">Correct Answer</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 bg-slate-950/20">
                  {filteredQuestions.map((q) => (
                    <tr key={q._id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-4 font-medium text-slate-200">
                        <div className="line-clamp-2 pr-4">{q.questionText}</div>
                      </td>
                      <td className="p-4 text-xs font-semibold text-slate-400">{q.category}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider rounded border ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-emerald-450 text-xs">
                        <span className="flex items-center space-x-1">
                          <Check className="h-4 w-4" />
                          <span>Option {String.fromCharCode(65 + q.correctAnswerIndex)}</span>
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center space-x-3">
                          <button
                            onClick={() => openEditModal(q)}
                            className="p-1 text-slate-400 hover:text-brand-400 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(q._id)}
                            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-900/40 border-t border-slate-800 text-xs text-slate-500 font-medium">
              Showing {filteredQuestions.length} of {questions.length} questions
            </div>
          </div>
        )}

        {/* Modal form for Create/Edit Question */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="glass-panel w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 bg-slate-900 border-b border-slate-800">
                <h3 className="font-bold text-white text-lg">
                  {isEditing ? 'Edit Question' : 'Add New Question'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs flex items-center space-x-1.5">
                    <AlertTriangle className="h-4.5 w-4.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Question Text
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="glass-input w-full text-sm"
                    placeholder="Enter placement aptitude question statement..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="glass-input w-full text-sm appearance-none bg-slate-900"
                    >
                      <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                      <option value="Logical Reasoning">Logical Reasoning</option>
                      <option value="Verbal Ability">Verbal Ability</option>
                      <option value="Technical Aptitude">Technical Aptitude</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="glass-input w-full text-sm appearance-none bg-slate-900"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Question Options Input Fields */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    Option Choices
                  </label>
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-400 w-6">
                        Option {String.fromCharCode(65 + idx)}
                      </span>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="glass-input w-full text-sm py-1.5"
                        placeholder={`Option ${String.fromCharCode(65 + idx)} description`}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Correct Option index
                    </label>
                    <select
                      value={correctAnswerIndex}
                      onChange={(e) => setCorrectAnswerIndex(e.target.value)}
                      className="glass-input w-full text-sm appearance-none bg-slate-900"
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                      <option value={3}>Option D</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Solution Explanation (Optional)
                  </label>
                  <textarea
                    rows="2.5"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="glass-input w-full text-sm"
                    placeholder="Provide detailed explanation/working out of the correct solution..."
                  />
                </div>

                {/* Modal Footer actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-slate-850 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-md shadow-brand-600/15"
                  >
                    {isEditing ? 'Save Changes' : 'Create Question'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminQuestions;
