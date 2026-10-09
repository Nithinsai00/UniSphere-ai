import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Logo } from '../components/common/Logo';

export const SplashWelcome: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    // Subtle animated progress indicator
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 15;
      });
    }, 180);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#E5EFE6] select-none flex flex-col justify-between overflow-hidden">
      {/* Background Graphic from 01_launch_page.png */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-90"
        style={{
          backgroundImage: 'url(/photos/01_launch_page.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Subtle overlay gradient to ensure text readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/20 via-transparent to-white/30 pointer-events-none" />

      {/* Top Header matching 01_launch_page.png */}
      <header className="relative z-10 px-6 sm:px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size="md" inverted={true} />
        </div>

        <div className="text-right text-white/95 text-xs sm:text-sm font-semibold tracking-wide drop-shadow-sm leading-tight">
          <div>Smart Analytics</div>
          <div className="text-emerald-100">Brighter Futures</div>
        </div>
      </header>

      {/* Center 3D Globe Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Glowing aura around globe */}
        <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full pointer-events-none relative flex items-center justify-center">
          {/* Subtle pulse */}
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-2xl animate-pulse" />
        </div>

        {/* Title and Subtitle matching 01_launch_page.png */}
        <div className="mt-8 max-w-xl">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-[#08361F] tracking-tight drop-shadow-sm">
            UniSphere
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[#143B27] font-semibold tracking-normal">
            Smart Campus Analytics for a Brighter Tomorrow
          </p>

          {/* Progress Capsule Pill matching 01_launch_page.png */}
          <div className="mt-5 mx-auto w-32 sm:w-40 h-3 rounded-full bg-[#094326] p-0.5 overflow-hidden shadow-inner flex items-center">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0E6038] via-[#10B981] to-[#34D399] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Action to proceed to Login */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 rounded-full bg-[#0B4A2B] hover:bg-[#073820] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Enter UniSphere Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-xs text-[#17462F]/80 font-medium">
        KPMG in India Challenge • HacXLerate 2026 • “Every Student. A Better Future.”
      </footer>
    </div>
  );
};
