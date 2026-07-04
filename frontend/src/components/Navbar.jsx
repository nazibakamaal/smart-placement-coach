import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, LayoutDashboard, Database, HelpCircle, Users, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-brand-400 bg-brand-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/50';
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight text-white group">
              <GraduationCap className="h-8 w-8 text-brand-500 group-hover:scale-110 transition-transform duration-200" />
              <span>Smart <span className="text-brand-500">Placement</span> Coach</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'student' && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard')}`}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/practice"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/practice')}`}
                    >
                      <HelpCircle className="h-4 w-4" />
                      <span>Aptitude Tests</span>
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link
                      to="/admin/questions"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin/questions')}`}
                    >
                      <Database className="h-4 w-4" />
                      <span>Manage Questions</span>
                    </Link>
                    <Link
                      to="/admin/users"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin/users')}`}
                    >
                      <Users className="h-4 w-4" />
                      <span>Manage Users</span>
                    </Link>
                  </>
                )}

                <Link
                  to="/chat"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/chat')}`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>AI Coach</span>
                </Link>

                <div className="h-5 w-px bg-slate-800"></div>

                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-400 font-semibold">{user.role.toUpperCase()}</p>
                    <p className="text-sm font-medium text-slate-200">{user.name}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md shadow-brand-600/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
