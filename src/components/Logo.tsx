import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textSize?: string;
  lightText?: boolean;
}

export const LogoIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <img 
      src="/logo.svg" 
      alt="Businessकर Logo" 
      className={`object-contain ${className}`}
    />
  );
};

export const Logo: React.FC<LogoProps> = ({
  className = "w-9 h-9",
  showText = true,
  textSize = "text-xl",
  lightText = true,
}) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="relative flex items-center justify-center shrink-0">
        <img 
          src="/logo.svg" 
          alt="Businessकर Logo" 
          className={`object-contain filter drop-shadow-sm ${className}`}
        />
      </div>
      {showText && (
        <div className="flex items-baseline font-bold tracking-tight">
          <span className={lightText ? "text-slate-100" : "text-slate-900"}>
            Business
          </span>
          <span className="text-emerald-400 ml-0.5 font-sans font-black">
            कर
          </span>
        </div>
      )}
    </div>
  );
};
