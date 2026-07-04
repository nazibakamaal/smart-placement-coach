import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  TrendingUp,
  Award,
  Clock,
  Activity,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  HelpCircle,
  GraduationCap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard');
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError('Failed to fetch dashboard data.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to backend failed. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 font-semibold text-slate-300">Loading placement insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 px-4">
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center border-red-500/20">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button 
            onClick={handleRefresh}
            className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary, categoryPerformance, history, aiDiagnostics } = stats;

  const BAR_COLORS = ['#0c87eb', '#6366f1', '#10b981', '#f59e0b'];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 60) return 'text-brand-400 border-brand-500/20 bg-brand-500/5';
    return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
  };

  const getReadinessBg = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-brand-500';
    return 'bg-amber-500';
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Student Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Track your progress and get AI coaching evaluations.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors text-sm font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <Link
              to="/practice"
              className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all shadow-md shadow-brand-600/10"
            >
              <span>Take a Test</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {summary.totalTests === 0 ? (
          /* Empty State Banner */
          <div className="glass-panel p-8 rounded-2xl text-center max-w-3xl mx-auto space-y-6 border-brand-500/15 py-12">
            <GraduationCap className="h-16 w-16 text-brand-400 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Welcome to Smart Placement Coach!</h2>
              <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
                Take your first practice mock exam to generate metrics, visual charts, AI weak area detection, and your Placement Readiness Score.
              </p>
            </div>
            <Link
              to="/practice"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-600/20 transition-all hover:scale-105"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Start Practice Assessment</span>
            </Link>
          </div>
        ) : (
          /* Main Dashboard Content */
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-panel p-5 rounded-2xl flex items-center space-x-4">
                <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tests Attempted</p>
                  <p className="text-2xl font-bold text-white mt-0.5">{summary.totalTests}</p>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl flex items-center space-x-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Overall Accuracy</p>
                  <p className="text-2xl font-bold text-white mt-0.5">{summary.overallAccuracy}%</p>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl flex items-center space-x-4">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Attempted</p>
                  <p className="text-2xl font-bold text-white mt-0.5">{summary.totalQuestionsAnswered} Qs</p>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl flex items-center space-x-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Avg Time / Test</p>
                  <p className="text-2xl font-bold text-white mt-0.5">
                    {Math.floor(summary.averageDurationPerTest / 60)}m {summary.averageDurationPerTest % 60}s
                  </p>
                </div>
              </div>
            </div>

            {/* AI Diagnostics Core Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Placement Readiness Score Dial */}
              <div className="glass-panel p-6 rounded-2xl lg:col-span-1 flex flex-col justify-between items-center text-center">
                <div className="w-full text-left flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-200">AI Readiness Score</h3>
                  <div className="flex items-center text-xs text-slate-500 space-x-1">
                    <Sparkles className="h-3 w-3 text-brand-400" />
                    <span className="capitalize">{aiDiagnostics.source} Model</span>
                  </div>
                </div>
                
                {/* Visual score circle */}
                <div className="relative my-4 flex items-center justify-center">
                  <div className="w-36 h-36 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-extrabold ${getScoreColor(aiDiagnostics.readinessScore).split(' ')[0]}`}>
                      {aiDiagnostics.readinessScore}
                    </span>
                    <span className="text-xs text-slate-500 font-medium mt-1">Ready</span>
                  </div>
                  <div className="absolute inset-0 border-4 border-transparent rounded-full pointer-events-none animate-pulse"></div>
                </div>

                <div className="w-full mt-4">
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${getReadinessBg(aiDiagnostics.readinessScore)}`} 
                      style={{ width: `${aiDiagnostics.readinessScore}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-4 leading-relaxed italic text-left w-full border-t border-slate-800/80 pt-4">
                  <strong>Evaluation:</strong> {aiDiagnostics.readinessRationale}
                </p>
              </div>

              {/* AI Weak Area Diagnostics & Feedback */}
              <div className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="font-bold text-slate-200 flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-brand-400" />
                    <span>AI Coaching Analysis</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Diagnosing performance flaws across test attempts.</p>
                </div>

                {/* Weak Areas Display */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    <span>Identified Gap Areas</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {aiDiagnostics.weakAreas.map((topic, i) => (
                      <span 
                        key={i} 
                        className="px-3 py-1 rounded-full text-xs font-medium border bg-red-500/5 border-red-500/20 text-red-400 flex items-center space-x-1.5"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                        <span>{topic}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actionable Feedback */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-brand-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <h5 className="text-sm font-semibold text-slate-200">Recommended Action Plan</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">{aiDiagnostics.feedback}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Line Chart: Test Score History */}
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="font-bold text-slate-200 mb-1">Score Tracker</h3>
                <p className="text-xs text-slate-500 mb-6">Chronological graph of mock test results.</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0c87eb" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#0c87eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="testIndex" stroke="#64748b" fontSize={11} />
                      <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                        itemStyle={{ color: '#0c87eb' }}
                      />
                      <Area type="monotone" dataKey="score" stroke="#0c87eb" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart: Accuracy by Category */}
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="font-bold text-slate-200 mb-1">Accuracy by Category</h3>
                <p className="text-xs text-slate-500 mb-6">Subject accuracy mapped as percent correct.</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryPerformance} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="category" stroke="#64748b" fontSize={9} />
                      <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value) => [`${value}% Accuracy`, 'Accuracy']}
                      />
                      <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                        {categoryPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
