import React, { useState } from 'react';
import { X, RefreshCw, Scale, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { TaxDataState } from '../context/TaxDataContext';
import { PersonaItem } from './PersonaSelectorStep';
import { computeBaselineTax } from '../engine/deterministicCopilot';

interface ProfileOverwriteModalProps {
  isOpen: boolean;
  persona: PersonaItem | null;
  currentData: TaxDataState;
  onOption: (choice: 'replace' | 'compare' | 'cancel') => void;
  onClose: () => void;
}

export const ProfileOverwriteModal: React.FC<ProfileOverwriteModalProps> = ({
  isOpen,
  persona,
  currentData,
  onOption,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'decision' | 'compare'>('decision');

  if (!isOpen || !persona) return null;

  const currentGross = Number(currentData.grossReceipts) || 0;
  const currentCash = Number(currentData.cashReceipts) || 0;
  const currentCashPct = currentGross > 0 ? ((currentCash / currentGross) * 100).toFixed(1) : '0.0';
  const currentBaseline = computeBaselineTax(currentData);

  const demoData: Partial<TaxDataState> = persona.demoValues || {};
  const demoGross = Number(demoData.grossReceipts) || 0;
  const demoCash = Number(demoData.cashReceipts) || 0;
  const demoCashPct = demoGross > 0 ? ((demoCash / demoGross) * 100).toFixed(1) : '0.0';
  const demoBaseline = computeBaselineTax(demoData as any);

  const formatINR = (val: number) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto animate-scale-in">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{persona.icon}</span>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                {viewMode === 'compare' ? '⚖️ Side-by-Side Profile Comparison' : 'Choose Your Path'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Switching to {persona.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {viewMode === 'decision' ? (
            <>
              <p className="text-slate-300 leading-relaxed">
                You are about to switch to the <strong className="text-emerald-400 font-bold">{persona.title}</strong> persona with recommended starting numbers.
                <br />
                What would you like to do with your current profile?
              </p>

              {/* Current Numbers Summary Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Your Current Numbers:
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Gross Receipts</span>
                    <span className="font-bold text-slate-200 text-xs">{formatINR(currentGross)}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Cash %</span>
                    <span className="font-bold text-emerald-400 text-xs">{currentCashPct}%</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Current Est. Tax</span>
                    <span className="font-bold text-amber-300 text-xs">{formatINR(currentBaseline.minTax)}</span>
                  </div>
                </div>
              </div>

              {/* 3 Action Options */}
              <div className="space-y-2.5 pt-1">
                {/* Option 1: Replace */}
                <button
                  type="button"
                  onClick={() => onOption('replace')}
                  className="w-full text-left p-3.5 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/40 hover:border-emerald-500 rounded-xl transition-all group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0">
                      <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
                        <span>↻ Replace with {persona.title} Demo</span>
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                        Load {persona.title} sample numbers into your calculation engine. (Your current profile is safely stored in cloud persistence and can be restored anytime).
                      </p>
                    </div>
                  </div>
                </button>

                {/* Option 2: Compare */}
                <button
                  type="button"
                  onClick={() => setViewMode('compare')}
                  className="w-full text-left p-3.5 bg-slate-950/70 hover:bg-slate-800/70 border border-slate-800 hover:border-teal-500/40 rounded-xl transition-all group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 mt-0.5 shrink-0">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-teal-300">
                        ⚖️ Compare Side-by-Side
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        See your active data vs. {persona.title} sample numbers in a side-by-side comparison without altering your current numbers.
                      </p>
                    </div>
                  </div>
                </button>

                {/* Option 3: Cancel */}
                <button
                  type="button"
                  onClick={() => onOption('cancel')}
                  className="w-full text-left p-3 bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-400 mt-0.5 shrink-0">
                      <X className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-300">
                        ✕ Never Mind, Keep My Data
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Stay with your current profile & active tax calculations.
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Reassurance text */}
              <p className="text-[11px] text-slate-400 italic flex items-center gap-1.5 pt-1 border-t border-slate-800/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>💡 Tip: Your data is always saved in cloud storage. You can undo or restore at any time.</span>
              </p>
            </>
          ) : (
            /* Comparison View */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                {/* Column Left: Current Data */}
                <div className="space-y-2 border-r border-slate-800/80 pr-3">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200 pb-1.5 border-b border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Your Current Data</span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gross Receipts:</span>
                      <span className="font-bold text-slate-200">{formatINR(currentGross)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cash Proportion:</span>
                      <span className="font-bold text-emerald-400">{currentCashPct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Salary Income:</span>
                      <span className="font-bold text-slate-200">{formatINR(Number(currentData.grossSalary) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Deductions (VI-A):</span>
                      <span className="font-bold text-slate-200">{formatINR(Number(currentData.chapterVIADeductions) || 0)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Recommended:</span>
                      <span className="font-bold text-teal-300">{currentBaseline.recommendedRegime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Est. Net Tax:</span>
                      <span className="font-bold text-amber-300">{formatINR(currentBaseline.minTax)}</span>
                    </div>
                  </div>
                </div>

                {/* Column Right: Persona Demo */}
                <div className="space-y-2 pl-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400 pb-1.5 border-b border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{persona.title} Demo</span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gross Receipts:</span>
                      <span className="font-bold text-emerald-300">{formatINR(demoGross)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cash Proportion:</span>
                      <span className="font-bold text-emerald-400">{demoCashPct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Salary Income:</span>
                      <span className="font-bold text-emerald-300">{formatINR(Number(demoData.grossSalary) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Deductions (VI-A):</span>
                      <span className="font-bold text-emerald-300">{formatINR(Number(demoData.chapterVIADeductions) || 0)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Recommended:</span>
                      <span className="font-bold text-teal-300">{demoBaseline.recommendedRegime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Est. Net Tax:</span>
                      <span className="font-bold text-emerald-300">{formatINR(demoBaseline.minTax)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions in Comparison Mode */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setViewMode('decision')}
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  ← Back to Options
                </button>
                <button
                  type="button"
                  onClick={() => onOption('replace')}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Load {persona.title} Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
