import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { AnimatedGlobe } from '../components/common/AnimatedGlobe';

export const SplashWelcome: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [introFinished, setIntroFinished] = useState(false);

  useEffect(() => {
    // Synchronize 4-second introductory progress bar smoothly
    const startTime = performance.now();
    const DURATION = 4000; // 4 seconds

    let animId: number;
    const updateProgress = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, Math.round((elapsed / DURATION) * 100));
      setProgress(pct);

      if (elapsed < DURATION) {
        animId = requestAnimationFrame(updateProgress);
      } else {
        setIntroFinished(true);
      }
    };

    animId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#E8F0E5] select-none flex flex-col justify-between overflow-x-hidden">
      {/* 1. Atmospheric Pristine Background (Misty green hills, clouds, sunburst - NO baked-in text or static globe) */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: 'url(/launch_bg_final.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Subtle atmospheric vignette */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/10 via-transparent to-black/15 pointer-events-none" />

      {/* 2. Top Header Bar */}
      <header className="relative z-10 w-full px-6 sm:px-10 py-5 flex items-center justify-between">
        {/* Top-Left: UniSphere Logo & Brand Name */}
        <div className="flex items-center gap-2.5">
          <Logo size="md" inverted={true} />
        </div>

        {/* Top-Right Tagline: Smart Analytics, Brighter Futures */}
        <div className="text-right text-white/95 text-xs sm:text-sm font-semibold tracking-wide drop-shadow-sm leading-tight">
          <div>Smart Analytics</div>
          <div className="text-emerald-100 font-medium">Brighter Futures</div>
        </div>
      </header>

      {/* 3. Center Hero Section: Animated Globe + Single Heading + Subtitle + Indicator + CTA */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2 text-center max-w-4xl mx-auto w-full">
        {/* 4-Second Animated 3D Globe with Vertical Rotation & Pulsing Orbital Trails */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 flex items-center justify-center">
          {/* Subtle luminous ambient aura behind globe */}
          <div className="absolute inset-0 rounded-full bg-emerald-400/25 blur-3xl pointer-events-none scale-110" />

          {/* 3D Three.js Rotating Globe */}
          <AnimatedGlobe
            onIntroComplete={() => setIntroFinished(true)}
            className="w-full h-full"
          />
        </div>

        {/* Vertical Layout: Heading -> Subtitle -> Loading Indicator -> CTA Button */}
        <div className="mt-4 sm:mt-5 flex flex-col items-center max-w-xl mx-auto">
          {/* Single Main Heading (No duplicate text behind it!) */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#07361F] tracking-tight leading-none"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            UniSphere
          </h1>

          {/* Subtitle */}
          <p className="mt-2.5 sm:mt-3 text-sm sm:text-base md:text-lg text-[#16432B] font-semibold tracking-normal max-w-md sm:max-w-lg leading-snug">
            Smart Campus Analytics for a Brighter Tomorrow
          </p>

          {/* Slim Green Loading Indicator (Synchronized with 4s Globe Intro) */}
          <div className="mt-4 sm:mt-5 w-36 sm:w-44 h-2.5 rounded-full bg-[#083A20]/80 p-0.5 overflow-hidden shadow-inner flex items-center">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0D5B34] via-[#10B981] to-[#34D399] transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Primary CTA Button: Enter UniSphere Portal → */}
          <div className="mt-6 sm:mt-7">
            <button
              onClick={() => navigate('/login')}
              className="group px-7 py-3 rounded-full bg-[#0A4D2F] hover:bg-[#063820] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer"
            >
              <span>Enter UniSphere Portal</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </main>

      {/* 4. Bottom Footer (Clean, readable, non-overlapping) */}
      <footer className="relative z-10 w-full px-6 py-3.5 text-center text-[11px] sm:text-xs text-[#133D27]/85 font-medium">
        KPMG in India Challenge • HacXLerate 2026 • “Every Student. A Better Future.”
      </footer>
    </div>
  );
};
