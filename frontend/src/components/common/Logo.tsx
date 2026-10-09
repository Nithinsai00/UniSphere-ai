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
    md: 'text-lg font-bold',
    lg: 'text-2xl font-extrabold',
    xl: 'text-3xl font-black',
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* SVG Sphere with Graduation Cap and Connected Intelligence Nodes */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Outer Sphere Orbital Rings */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke={inverted ? '#93C5FD' : '#245BB5'}
            strokeWidth="4"
            strokeDasharray="4 3"
            opacity="0.4"
          />
          <circle
            cx="50"
            cy="50"
            r="38"
            fill={inverted ? 'rgba(255,255,255,0.08)' : '#F3F7FF'}
            stroke={inverted ? '#60A5FA' : '#102B57'}
            strokeWidth="3.5"
          />

          {/* Connected Network Nodes */}
          <line x1="28" y1="62" x2="50" y2="76" stroke="#F58B35" strokeWidth="2.5" />
          <line x1="50" y1="76" x2="72" y2="62" stroke="#F58B35" strokeWidth="2.5" />
          <line x1="28" y1="62" x2="50" y2="44" stroke="#3B82F6" strokeWidth="2.5" />
          <line x1="72" y1="62" x2="50" y2="44" stroke="#3B82F6" strokeWidth="2.5" />

          {/* Graduation Cap Peak on Top */}
          <path
            d="M50 20 L80 34 L50 48 L20 34 Z"
            fill={inverted ? '#F58B35' : '#245BB5'}
          />
          <path
            d="M32 40 V52 C32 58 68 58 68 52 V40"
            stroke={inverted ? '#FDBA74' : '#102B57'}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Cap Tassel */}
          <path d="M75 36 V48 L77 50" stroke="#F58B35" strokeWidth="2" strokeLinecap="round" />

          {/* Intelligence Spherical Node Anchors */}
          <circle cx="28" cy="62" r="5" fill="#F58B35" />
          <circle cx="72" cy="62" r="5" fill="#F58B35" />
          <circle cx="50" cy="76" r="6" fill="#102B57" stroke="#FFF" strokeWidth="2" />
          <circle cx="50" cy="44" r="4.5" fill="#3B82F6" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className={`tracking-tight flex items-center leading-none ${textSizes[size]}`}>
            <span className={inverted ? 'text-white' : 'text-[#102B57]'}>Uni</span>
            <span className="text-[#245BB5]">Sphere</span>
            <span className="ml-1 text-[#F58B35] font-extrabold text-[0.7em] uppercase tracking-wider bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
              AI
            </span>
          </div>
          {size === 'lg' || size === 'xl' ? (
            <span className={`text-xs mt-0.5 font-medium ${inverted ? 'text-blue-200' : 'text-slate-500'}`}>
              Student Success Intelligence
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};
