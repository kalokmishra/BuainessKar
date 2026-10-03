import React from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { TaxDataState } from '../context/TaxDataContext';

export interface PersonaItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  demoValues: Partial<TaxDataState> | null;
  defaultTab: 'calculator' | 'comprehensive' | 'ai-advisor' | 'surveillance' | 'advancetax' | 'invoice' | 'itr4' | 'rac';
}

export const PERSONAS_DATA: PersonaItem[] = [
  {
    id: 'salaried-consultant',
    title: '🧑‍💼 Salaried Consultant',
    subtitle: 'Salary + side freelance/consulting',
    icon: '🧑‍💼',
    demoValues: {
      hasSalary: true,
      grossSalary: 1200000,
      activityType: 'PROFESSION',
      professionCategory: 'TECHNICAL_CONSULTANCY',
      grossReceipts: 500000,
      cashReceipts: 100000, // 20%
      sec80C: 150000,
      chapterVIADeductions: 150000,
    },
    defaultTab: 'comprehensive',
  },
  {
    id: 'full-time-developer',
    title: '👨‍💻 Full-Time Freelancer',
    subtitle: 'Contract/freelance income only',
    icon: '👨‍💻',
    demoValues: {
      activityType: 'PROFESSION',
      professionCategory: 'IT_SOFTWARE',
      grossReceipts: 4800000,
      cashReceipts: 720000, // 15%
      hasSalary: false,
      grossSalary: 0,
      sec80C: 150000,
      sec80D: 25000,
      chapterVIADeductions: 175000,
    },
    defaultTab: 'calculator',
  },
  {
    id: 'stock-investor',
    title: '📈 Stock Investor + Professional',
    subtitle: 'Salary/freelance + stock gains',
    icon: '📈',
    demoValues: {
      hasSalary: true,
      grossSalary: 1000000,
      activityType: 'PROFESSION',
      professionCategory: 'TECHNICAL_CONSULTANCY',
      grossReceipts: 500000,
      cashReceipts: 50000,
      hasCapitalGains: true,
      stcgEquity: 150000,
      ltcgEquity: 300000,
      sec80C: 150000,
      chapterVIADeductions: 150000,
    },
    defaultTab: 'comprehensive',
  },
  {
    id: 'international-freelancer',
    title: '🌐 International Freelancer',
    subtitle: 'Service exports to US/EU clients',
    icon: '🌐',
    demoValues: {
      activityType: 'PROFESSION',
      professionCategory: 'IT_SOFTWARE',
      grossReceipts: 7500000,
      cashReceipts: 0, // 0% cash, 100% digital inward remittance
      isExport: true,
      lutNumber: 'AD270326001928X',
      hasSalary: false,
      grossSalary: 0,
      sec80C: 150000,
      chapterVIADeductions: 150000,
    },
    defaultTab: 'invoice',
  },
  {
    id: 'small-business',
    title: '🏬 Small Business Owner',
    subtitle: 'Retail/e-commerce (₹50L-3Cr)',
    icon: '🏬',
    demoValues: {
      activityType: 'BUSINESS',
      businessCategory: 'RETAIL_TRADING',
      grossReceipts: 15000000,
      cashReceipts: 3750000, // 25% cash
      hasSalary: false,
      grossSalary: 0,
    },
    defaultTab: 'calculator',
  },
  {
    id: 'first-time-filer',
    title: '💰 First-Time Filer',
    subtitle: 'Filing your first income tax return',
    icon: '💰',
    demoValues: null,
    defaultTab: 'calculator',
  },
];

interface PersonaSelectorStepProps {
  selectedPersonaId: string | null;
  onSelectPersona: (persona: PersonaItem) => void;
  onSkip: () => void;
}

export const PersonaSelectorStep: React.FC<PersonaSelectorStepProps> = ({
  selectedPersonaId,
  onSelectPersona,
  onSkip,
}) => {
  return (
    <div className="space-y-6 py-2">
      {/* Introduction Banner */}
      <div className="text-center max-w-xl mx-auto space-y-1.5">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 0: Personalized Onboarding</span>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
          📋 Tell Us About Yourself (Optional)
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Select the profile that best describes your work. We'll tailor your starting figures and route you to the most relevant tax tools first.
        </p>
      </div>

      {/* Persona Cards Grid (2 cols on mobile, 3 cols on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {PERSONAS_DATA.map((persona) => {
          const isSelected = selectedPersonaId === persona.id;
          return (
            <div
              key={persona.id}
              onClick={() => onSelectPersona(persona)}
              className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between text-left ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 hover:shadow-md'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl filter drop-shadow-sm">{persona.icon}</span>
                  {isSelected ? (
                    <div className="p-1 rounded-full bg-emerald-500 text-slate-950">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 group-hover:text-emerald-400 transition-colors flex items-center gap-0.5">
                      Select <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                    {persona.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                    {persona.subtitle}
                  </p>
                </div>
              </div>

              {/* Tag for Recommended Destination */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Destination:</span>
                <span className="font-mono font-medium text-emerald-400/90 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  {persona.defaultTab === 'comprehensive'
                    ? 'Multi-Head & Salary'
                    : persona.defaultTab === 'invoice'
                    ? 'GST & LUT Export'
                    : 'Engine Calculator'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Skip Button Footer */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors underline-offset-4 hover:underline cursor-pointer inline-flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-800/50"
        >
          <span>Skip This, Go to Wizard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
