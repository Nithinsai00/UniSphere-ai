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
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-extrabold',
    xl: 'text-4xl font-extrabold tracking-tight',
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Shared UniSphere Logo Icon Image */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <img
          src="/unisphere-logo.png"
          alt="UniSphere Icon"
          className="w-full h-full object-contain drop-shadow-xs"
        />
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
