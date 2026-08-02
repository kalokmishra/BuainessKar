import React from 'react';
import { Sparkles, Play, X } from 'lucide-react';
import { useTaxData } from '../context/TaxDataContext';

export const OnboardingPromptBanner: React.FC = () => {
  const { isZeroData, isBannerDismissed, dismissBanner, openTour, taxData } =
    useTaxData();

  if (isBannerDismissed && !isZeroData) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden mb-6">
      {/* Glow accent decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 max-w-2xl">
          <div className="p-2.5 bg-emerald-500/15 rounded-xl border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>Welcome to Businessकर Tax Engine</span>
              </h3>
              {taxData.isDemoDataLoaded && (
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Sample Demo Data Active
                </span>
              )}
              {isZeroData && (
                <span className="text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">
                  Clean Zero Profile
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isZeroData
                ? 'Your tax profile currently contains 0 values. Launch our step-by-step Guided Setup Wizard to enter your custom entries, or click "Load Demo Data" inside the wizard to explore calculations with sample figures.'
                : 'Want to update your financial details or explore sample calculations? Launch our Guided Setup Wizard anytime.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto shrink-0">
          <button
            onClick={openTour}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Guided Setup Wizard</span>
          </button>

          <button
            onClick={dismissBanner}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title="Dismiss Banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
