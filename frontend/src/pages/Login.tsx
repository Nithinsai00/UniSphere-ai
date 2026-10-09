import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Users,
  Settings,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const initialRole = (searchParams.get('role') as 'student' | 'faculty' | 'admin') || 'student';
  const [activeRole, setActiveRole] = useState<'student' | 'faculty' | 'admin'>(initialRole);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = searchParams.get('role') as 'student' | 'faculty' | 'admin';
    if (r && ['student', 'faculty', 'admin'].includes(r)) {
      setActiveRole(r);
    }
  }, [searchParams]);

  // Demo auto-fill helpers
  const fillDemo = (role: 'student' | 'faculty' | 'admin') => {
    setActiveRole(role);
    setError(null);
    if (role === 'admin') {
      setIdentifier('admin');
      setPassword('Hope@50');
    } else if (role === 'faculty') {
      setIdentifier('FAC001');
      setPassword('Faculty@2026');
    } else {
      setIdentifier('STU1001');
      setPassword('Student@2026');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your ID and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(identifier, password, activeRole);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'faculty') {
        navigate('/faculty/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDF5EE] uni-sage-bg flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Top Header matching 02_login_page.png */}
      <header className="flex items-center justify-between w-full max-w-5xl mx-auto py-2">
        <Logo size="md" />
        <div className="text-sm font-semibold text-[#143B27] tracking-wide">
          Smart Campus Analytics
        </div>
      </header>

      {/* Main Split Content: Left Wheel + Right Login Card */}
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col md:flex-row items-center justify-center gap-10 lg:gap-16 py-6">
        {/* Left Side: Interactive Role Selector Wheel matching 02_login_page.png */}
        <div className="flex flex-col items-center">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* Outer Ring Circle */}
            <div className="absolute inset-0 rounded-full border-4 border-white/80 shadow-md bg-[#E4EFE3]/60 backdrop-blur-xs" />

            {/* SVG Interactive Wheel */}
            <svg
              className="absolute inset-0 w-full h-full transform -rotate-90 cursor-pointer"
              viewBox="0 0 200 200"
            >
              <defs>
                <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5EEAD4" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
              </defs>

              {/* Segment 1: Student (Top / centered around 90 deg in standard cartesian) */}
              <path
                d="M 100 10 A 90 90 0 0 1 177.94 145 L 143.3 125 A 50 50 0 0 0 100 50 Z"
                fill={activeRole === 'student' ? 'url(#activeGrad)' : '#E9F2E7'}
                stroke="#FFFFFF"
                strokeWidth="3"
                className="transition-all duration-200 hover:opacity-90"
                onClick={() => setActiveRole('student')}
              />

              {/* Segment 2: Admin (Bottom-Right) */}
              <path
                d="M 177.94 145 A 90 90 0 0 1 22.06 145 L 56.7 125 A 50 50 0 0 0 143.3 125 Z"
                fill={activeRole === 'admin' ? 'url(#activeGrad)' : '#E9F2E7'}
                stroke="#FFFFFF"
                strokeWidth="3"
                className="transition-all duration-200 hover:opacity-90"
                onClick={() => setActiveRole('admin')}
              />

              {/* Segment 3: Faculty (Bottom-Left) */}
              <path
                d="M 22.06 145 A 90 90 0 0 1 100 10 L 100 50 A 50 50 0 0 0 56.7 125 Z"
                fill={activeRole === 'faculty' ? 'url(#activeGrad)' : '#E9F2E7'}
                stroke="#FFFFFF"
                strokeWidth="3"
                className="transition-all duration-200 hover:opacity-90"
                onClick={() => setActiveRole('faculty')}
              />
            </svg>

            {/* Role 1 Label & Icon: Student (Top) */}
            <div
              onClick={() => setActiveRole('student')}
              className={`absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer transition-all select-none ${
                activeRole === 'student' ? 'scale-105 font-bold text-[#0A3B24]' : 'text-[#2D4F3C] font-medium'
              }`}
            >
              <GraduationCap className="w-6 h-6 stroke-[2.2]" />
              <span className="text-xs mt-0.5">Student</span>
            </div>

            {/* Role 2 Label & Icon: Faculty (Middle-Left) */}
            <div
              onClick={() => setActiveRole('faculty')}
              style={{ left: '19%', top: '56%' }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all select-none ${
                activeRole === 'faculty' ? 'scale-105 font-bold text-[#0A3B24]' : 'text-[#2D4F3C] font-medium'
              }`}
            >
              <Users className="w-6 h-6 stroke-[2.2]" />
              <span className="text-xs mt-0.5">Faculty</span>
            </div>

            {/* Role 3 Label & Icon: Admin (Middle-Right) */}
            <div
              onClick={() => setActiveRole('admin')}
              style={{ left: '81%', top: '56%' }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all select-none ${
                activeRole === 'admin' ? 'scale-105 font-bold text-[#0A3B24]' : 'text-[#2D4F3C] font-medium'
              }`}
            >
              <Settings className="w-6 h-6 stroke-[2.2]" />
              <span className="text-xs mt-0.5">Admin</span>
            </div>

            {/* Center Disc matching 02_login_page.png */}
            <div className="z-10 w-24 h-24 rounded-full bg-white shadow-sm border border-[#E2ECE2] flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <User className="w-6 h-6 text-[#0A4A2B] stroke-[2.2]" />
              <div className="text-[11px] font-bold text-[#0A3B24] leading-tight mt-1">
                Select
                <br />
                Your Role
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card matching 02_login_page.png */}
        <div className="w-full max-w-sm bg-white rounded-3xl p-7 sm:p-8 shadow-md border border-[#E2ECE2]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-full bg-[#E5EFE6] flex items-center justify-center text-[#0A4A2B]">
              <User className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h2 className="text-xl font-bold text-[#0A2818]">
              {activeRole === 'student'
                ? 'Student Login'
                : activeRole === 'faculty'
                ? 'Faculty Login'
                : 'Admin Login'}
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0A2818] mb-1.5">
                {activeRole === 'student'
                  ? 'Student ID'
                  : activeRole === 'faculty'
                  ? 'Faculty ID'
                  : 'Admin ID'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your ID"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#D5E2D7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0A2818] mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#D5E2D7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link matching 02_login_page.png */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => alert(`Password reset request submitted for ${activeRole}. An administrator has been notified.`)}
                className="text-xs text-[#059669] hover:underline font-semibold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button matching 02_login_page.png */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-[#0A4D2F] hover:bg-[#073D24] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill Banner */}
          <div className="mt-5 pt-4 border-t border-[#E8F0EA] flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Demo:
            </span>
            <button
              type="button"
              onClick={() => fillDemo(activeRole)}
              className="text-[11px] font-bold text-[#0A4D2F] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Fill Demo Credentials
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[11px] text-[#29563E]/70 py-2">
        UniSphere AI • Student Success Intelligence Platform
      </footer>
    </div>
  );
};
