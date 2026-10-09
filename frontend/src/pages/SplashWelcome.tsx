import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Target,
  Sparkles,
} from 'lucide-react';

export const SplashWelcome: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Subtle loading animation (800ms)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 200);
          return 100;
        }
        return prev + 25;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#102B57] via-[#1a3d75] to-[#245BB5] flex flex-col items-center justify-center p-6 text-white select-none">
        <div className="flex flex-col items-center animate-fade-in text-center max-w-sm">
          <Logo size="xl" showText={false} inverted={true} />
          <h1 className="text-3xl font-black mt-4 tracking-tight">
            Uni<span className="text-blue-300">Sphere</span> <span className="text-[#F58B35]">AI</span>
          </h1>
          <p className="text-sm text-blue-200 mt-1 italic font-light">
            “Every Student. A Better Future.”
          </p>

          <div className="w-56 bg-white/20 h-1.5 rounded-full overflow-hidden mt-8">
            <div
              className="bg-[#F58B35] h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[11px] text-blue-300 mt-2 font-mono">
            Initializing Intelligence Models...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F7FF] flex flex-col text-[#10213A]">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#DCE5F3] bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <Logo size="md" />
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#245BB5] hover:bg-[#102B57] text-white font-medium text-sm transition-all shadow-sm cursor-pointer"
        >
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 lg:py-20 max-w-6xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          <span>HacXLerate 2026 • KPMG in India Challenge Solution</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#102B57] tracking-tight max-w-4xl">
          “Your Campus. Your Future. <span className="text-[#245BB5]">One Sphere.”</span>
        </h1>

        <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
          A smarter way to combine student data, understand student performance, discover potential,
          and support success.
        </p>

        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#F58B35] hover:bg-orange-600 text-white font-bold text-base transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <a
            href="#portals"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#102B57] font-semibold text-base border border-[#DCE5F3] shadow-xs transition-all"
          >
            <span>Explore Portals</span>
          </a>
        </div>

        {/* Brand Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 w-full text-left">
          <div className="uni-card p-5 bg-white/80">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#245BB5] flex items-center justify-center mb-3">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-[#10213A]">Predict Risk</h4>
            <p className="text-xs text-slate-500 mt-1">
              Dual-vector academic and placement risk identification with explainable indicators.
            </p>
          </div>
          <div className="uni-card p-5 bg-white/80">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#F58B35] flex items-center justify-center mb-3">
              <Target className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-[#10213A]">Discover Potential</h4>
            <p className="text-xs text-slate-500 mt-1">
              Multi-dimensional Student Success Score (0-100) normalized across 5 campus streams.
            </p>
          </div>
          <div className="uni-card p-5 bg-white/80">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-[#10213A]">Improve Success</h4>
            <p className="text-xs text-slate-500 mt-1">
              Actionable faculty interventions, mentoring workflows, and personalized student next steps.
            </p>
          </div>
        </div>
      </section>

      {/* 3 Portal Cards */}
      <section id="portals" className="px-6 py-12 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102B57]">
            Tailored Experiences for Every Stakeholder
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Role-based security ensuring data privacy and relevant actionability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student Portal Card */}
          <div className="uni-card p-6 flex flex-col justify-between hover:border-blue-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#F58B35] flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#10213A]">Student Portal</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Transparent view of personal milestones and growth guidance.
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F58B35]" />
                  <span>View academic progress & CGPA trends</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F58B35]" />
                  <span>Monitor attendance & shortage alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F58B35]" />
                  <span>Understand placement readiness & next steps</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/login?role=student')}
              className="mt-6 w-full py-2.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Student Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Faculty Portal Card */}
          <div className="uni-card p-6 flex flex-col justify-between hover:border-blue-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#245BB5] flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#10213A]">Faculty Portal</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Departmental triage and mentoring management.
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#245BB5]" />
                  <span>Identify students needing academic support</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#245BB5]" />
                  <span>Review student performance & risk explanations</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#245BB5]" />
                  <span>Track mentoring interventions & outcomes</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/login?role=faculty')}
              className="mt-6 w-full py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#245BB5] font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Faculty Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Admin Portal Card */}
          <div className="uni-card p-6 flex flex-col justify-between hover:border-blue-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-[#102B57] flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#10213A]">Admin Portal</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Comprehensive institution-wide command center.
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#102B57]" />
                  <span>Manage student & faculty accounts</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#102B57]" />
                  <span>Integrate campus data via staged CSV import</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#102B57]" />
                  <span>Monitor institutional analytics & scoring weights</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/login?role=admin')}
              className="mt-6 w-full py-2.5 rounded-lg bg-[#102B57] hover:bg-blue-950 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Admin Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#DCE5F3] bg-white py-6 px-6 text-center text-xs text-slate-500">
        <p>
          UniSphere AI — Smart Campus Analytics Platform • Built for HacXLerate 2026 (KPMG in India
          Challenge)
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Tagline: “Every Student. A Better Future.” • Supporting Tagline: “Predict Risk. Discover
          Potential. Improve Success.”
        </p>
      </footer>
    </div>
  );
};
