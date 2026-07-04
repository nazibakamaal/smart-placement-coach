import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogIn, Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errMessage, setErrMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrMessage('');

    if (!email || !password) {
      setErrMessage('Please enter both email and password.');
      setLoading(false);
      return;
    }

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin/questions');
      } else {
        navigate('/dashboard');
      }
    } else {
      setErrMessage(res.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] animated-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <GraduationCap className="mx-auto h-12 w-12 text-brand-500" />
        <h2 className="mt-4 text-3xl font-extrabold text-white">Sign in to your account</h2>
        <p className="mt-2 text-sm text-slate-400">
          Or{' '}
          <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
            create a student account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-2xl shadow-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errMessage && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg flex items-center space-x-2 text-sm animate-fade-in-up">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{errMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input pl-10 w-full"
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input pl-10 w-full"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-md shadow-brand-600/20"
              >
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Seed accounts notice */}
          <div className="mt-8 border-t border-slate-800/80 pt-6">
            <h4 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">Seed Accounts Info:</h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p>🧑‍🎓 <strong>Student:</strong> <code className="text-slate-300 font-mono">student@placementcoach.com</code> (pw: <code className="text-slate-300 font-mono">studentpassword123</code>)</p>
              <p>🔑 <strong>Admin:</strong> <code className="text-slate-300 font-mono">admin@placementcoach.com</code> (pw: <code className="text-slate-300 font-mono">adminpassword123</code>)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
