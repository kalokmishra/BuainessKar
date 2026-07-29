import React from 'react';
import {
  FileText,
  Calculator,
  AlertTriangle,
  Calendar,
  FileSpreadsheet,
  Code2,
  Sparkles,
  Briefcase,
  User as UserIcon,
  LogOut,
  Mail,
  Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

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
  const { currentUser, logout } = useAuth();

  const tabs = [
    { id: 'calculator', label: 'Engine Calculator', icon: Calculator },
    { id: 'comprehensive', label: 'Multi-Head & Salary Tax', icon: Briefcase },
    { id: 'ai-advisor', label: 'Tax Advisor', icon: Sparkles },
    { id: 'surveillance', label: 'Cash Surveillance', icon: AlertTriangle },
    { id: 'advancetax', label: 'Advance Tax & 234C', icon: Calendar },
    { id: 'invoice', label: 'GST & LUT Export', icon: FileSpreadsheet },
    { id: 'itr4', label: 'ITR-4 JSON Schema', icon: FileText },
    { id: 'rac', label: 'Rules-as-Code Payload', icon: Code2 },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Logo, Title & FY/AY Badge */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
              <Logo className="w-8 h-8" showText={false} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <h1 className="font-bold text-lg text-slate-100 tracking-tight flex items-center gap-1 leading-none">
                  <span>Business</span>
                  <span className="text-emerald-400">कर</span>
                </h1>
                {/* FY / AY 2-line badge */}
                <span className="text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded flex flex-col leading-tight text-center tracking-tight">
                  <span>FY {financialYear}</span>
                  <span>AY {assessmentYear}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Section 44AD & 44ADA Presumptive Tax Utility
              </p>
            </div>
          </div>

          {/* Right: Shortened User Profile Badge */}
          {currentUser && (
            <div className="flex items-center gap-1.5 bg-slate-950/90 px-2 py-1 rounded-lg border border-slate-800 shrink-0">
              <div
                className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0"
                title={currentUser.name}
              >
                <UserIcon className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:block text-left pr-1">
                <span className="text-xs font-bold text-slate-200 block leading-none truncate max-w-[110px]">
                  {currentUser.name}
                </span>
                <span className="text-[9px] text-slate-400 font-mono flex items-center gap-0.5 mt-0.5">
                  {currentUser.type === 'email' ? (
                    <Mail className="w-2.5 h-2.5 text-slate-400" />
                  ) : (
                    <Phone className="w-2.5 h-2.5 text-slate-400" />
                  )}
                  <span className="truncate max-w-[90px]">{currentUser.identifier}</span>
                </span>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 p-1.5 sm:px-2 sm:py-1 rounded-md border border-slate-800 transition-colors font-medium ml-0.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 mt-2 overflow-x-auto pb-0.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/20 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

