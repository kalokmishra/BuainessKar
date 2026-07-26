import React from 'react';
import { ShieldCheck, FileText, Calculator, AlertTriangle, Calendar, FileSpreadsheet, Code2, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  financialYear: string;
  assessmentYear: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  financialYear,
  assessmentYear,
}) => {
  const tabs = [
    { id: 'calculator', label: 'Engine Calculator', icon: Calculator },
    { id: 'ai-advisor', label: 'Tax Advisor', icon: Sparkles },
    { id: 'surveillance', label: 'Cash Surveillance', icon: AlertTriangle },
    { id: 'advancetax', label: 'Advance Tax & 234C', icon: Calendar },
    { id: 'invoice', label: 'GST & LUT Export', icon: FileSpreadsheet },
    { id: 'itr4', label: 'ITR-4 JSON Schema', icon: FileText },
    { id: 'rac', label: 'Rules-as-Code Payload', icon: Code2 },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-100 tracking-tight">
                  Indian Tax Utility Engine
                </h1>
                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  FY {financialYear} (AY {assessmentYear})
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Section 44AD & 44ADA Rules-as-Code (RaC) Engine • Mobile-First MVP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60 self-start md:self-auto">
            <span className="text-slate-400 font-medium px-2">Jurisdiction: IN (Section 44AD / 44ADA)</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 mt-4 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
