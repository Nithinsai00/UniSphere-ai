import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const initialRole = (searchParams.get('role') as 'student' | 'faculty' | 'admin') || 'admin';
  const [activeRole, setActiveRole] = useState<'student' | 'faculty' | 'admin'>(initialRole);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync role from query params if clicked from welcome
  useEffect(() => {
    const r = searchParams.get('role') as 'student' | 'faculty' | 'admin';
    if (r && ['student', 'faculty', 'admin'].includes(r)) {
      setActiveRole(r);
    }
  }, [searchParams]);

  // Demo auto-fill helpers
  const fillDemoCredentials = (role: 'student' | 'faculty' | 'admin') => {
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
      setError('Please provide both your ID / username and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(identifier, password, activeRole);
      // Route based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'faculty') {
        navigate('/faculty/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F7FF] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size="lg" />
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Sign in to access your role-specific intelligence portal
          </p>
        </div>

        {/* Card Container */}
        <div className="uni-card bg-white p-6 sm:p-8 shadow-xl">
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveRole('student');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                activeRole === 'student'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole('faculty');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                activeRole === 'faculty'
                  ? 'bg-white text-[#245BB5] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Faculty</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole('admin');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                activeRole === 'admin'
                  ? 'bg-white text-[#102B57] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>

          {/* Quick Demo Credentials Autofill Banner */}
          <div className="mb-5 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-blue-900 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Demo Quick Fill:</span>
            </div>
            <button
              type="button"
              onClick={() => fillDemoCredentials(activeRole)}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-white px-2 py-0.5 rounded shadow-2xs border border-blue-200 hover:bg-blue-50 transition-colors"
            >
              Autofill {activeRole.toUpperCase()}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#10213A] uppercase tracking-wider mb-1.5">
                {activeRole === 'student'
                  ? 'Student ID or Registered Phone'
                  : activeRole === 'faculty'
                  ? 'Faculty ID or Registered Phone'
                  : 'Admin Username or Email'}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  activeRole === 'student'
                    ? 'e.g. STU1001 or registered phone'
                    : activeRole === 'faculty'
                    ? 'e.g. FAC001 or registered phone'
                    : 'e.g. admin or admin@unisphere.edu'
                }
                className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-[#DCE5F3] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#10213A] uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">
                  {activeRole === 'admin' ? 'Initial prototype: Hope@50' : 'Default: ' + activeRole.charAt(0).toUpperCase() + activeRole.slice(1) + '@2026'}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-[#DCE5F3] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeRole === 'student'
                  ? 'bg-[#F58B35] hover:bg-orange-600'
                  : activeRole === 'faculty'
                  ? 'bg-[#245BB5] hover:bg-blue-700'
                  : 'bg-[#102B57] hover:bg-blue-950'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In as {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}</span>
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Need account assistance? Contact your institutional administrator.
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
          >
            ← Back to UniSphere Welcome
          </button>
        </div>
      </div>
    </div>
  );
};
