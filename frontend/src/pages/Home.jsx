import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Sparkles, TrendingUp, BarChart2, ShieldAlert, Award } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] animated-bg flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex-1 flex flex-col justify-center items-center text-center mt-8">
        
        {/* Banner */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold mb-6 animate-fade-in-up">
          <Sparkles className="h-4 w-4" />
          <span>Next Gen Placement Prep Driven by AI</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up">
          Master Your Placement Aptitude with <br />
          <span className="gradient-text">Smart AI Diagnostics</span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl text-slate-400 text-lg sm:text-xl mb-10 leading-relaxed animate-fade-in-up">
          Practice mock test assessments, view visual charts of your progress, and let our Gemini-driven AI highlight your weak subjects and compute your Placement Readiness Score.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-16 animate-fade-in-up">
          {user ? (
            <Link
              to={user.role === 'admin' ? '/admin/questions' : '/dashboard'}
              className="px-8 py-3 rounded-lg font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-lg shadow-brand-600/30 hover:scale-105 duration-200"
            >
              Go to {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="px-8 py-3 rounded-lg font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-lg shadow-brand-600/30 hover:scale-105 duration-200"
              >
                Sign Up as Student
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white transition-all hover:scale-105 duration-200"
              >
                Log In
              </Link>
            </>
          )}
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left mt-6">
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl">
            <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 mb-4 border border-brand-500/20">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Practice Assessments</h3>
            <p className="text-slate-400 text-sm">
              Custom mock exams in Quantitative, Logical, Verbal, and Technical Aptitude with immediate explanation support.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-2xl">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/20">
              <BarChart2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Progress Analytics</h3>
            <p className="text-slate-400 text-sm">
              Visualize your scores and completion times over time to understand where your learning curve is pointing.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-2xl">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Gemini AI Diagnostics</h3>
            <p className="text-slate-400 text-sm">
              Instantly compute a career-ready Placement Readiness Score and receive high-impact weak area suggestions.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center text-xs text-slate-500">
        © 2026 Smart Placement Coach. All rights reserved. Registered to mock server.
      </div>
    </div>
  );
};

export default Home;
