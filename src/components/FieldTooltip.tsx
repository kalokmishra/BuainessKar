import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface FieldTooltipProps {
  title?: string;
  rule: string;
  section?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const FieldTooltip: React.FC<FieldTooltipProps> = ({
  title,
  rule,
  section,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-flex items-center ml-1.5 align-middle"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <button
        type="button"
        tabIndex={-1}
        className="text-slate-400 hover:text-emerald-400 focus:text-emerald-400 cursor-help transition-colors p-0.5 rounded-full inline-flex items-center justify-center focus:outline-none"
        aria-label="View Tax Rule details"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isVisible && (
        <div
          className={`absolute z-50 w-64 sm:w-72 p-3 bg-slate-950/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md text-white text-xs space-y-1 pointer-events-none animate-fade-in ${
            position === 'top'
              ? 'bottom-full mb-2 left-1/2 -translate-x-1/2'
              : position === 'bottom'
              ? 'top-full mt-2 left-1/2 -translate-x-1/2'
              : position === 'right'
              ? 'left-full ml-2 top-1/2 -translate-y-1/2'
              : 'right-full mr-2 top-1/2 -translate-y-1/2'
          }`}
        >
          {section && (
            <span className="inline-block text-[10px] font-bold font-mono text-emerald-400 bg-emerald-950/90 border border-emerald-500/30 px-1.5 py-0.5 rounded">
              {section}
            </span>
          )}
          {title && <h5 className="font-bold text-slate-100 text-[11px]">{title}</h5>}
          <p className="text-[11px] leading-relaxed text-slate-300 font-normal">{rule}</p>
        </div>
      )}
    </div>
  );
};
