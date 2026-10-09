import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  inverted = false,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-extrabold',
    xl: 'text-4xl font-extrabold tracking-tight',
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Authentic Emerald Leaf Circular Badge */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            <linearGradient id="leafGradBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="leafGradInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>
          
          {/* Circular Base */}
          <circle cx="50" cy="50" r="48" fill="url(#leafGradBg)" />
          
          {/* Stylized Curved Leaf Blade 1 (Left & Center) */}
          <path
            d="M50 18 C30 35 25 60 48 82 C42 62 48 40 50 18 Z"
            fill="url(#leafGradInner)"
            opacity="0.95"
          />
          {/* Stylized Curved Leaf Blade 2 (Right Accent) */}
          <path
            d="M50 18 C65 38 68 62 52 82 C60 62 60 38 50 18 Z"
            fill="#FFFFFF"
            opacity="0.75"
          />
        </svg>
      </div>

      {showText && (
        <span
          className={`tracking-tight leading-none ${textSizes[size]} ${
            inverted ? 'text-white' : 'text-[#0A3B24]'
          }`}
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}
        >
          UniSphere
        </span>
      )}
    </div>
  );
};
