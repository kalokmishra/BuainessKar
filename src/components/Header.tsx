import React, { useState, useRef, useEffect } from 'react';
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
  Play,
  HelpCircle,
  Key,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTaxData } from '../context/TaxDataContext';
import { Logo } from './Logo';
import { ChangePasswordModal } from './ChangePasswordModal';
import { TaxInfoDrawer } from './TaxInfoDrawer';

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
  const { openTour } = useTaxData();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const tabs = [
    { id: 'calculator', label: 'Engine Calculator', icon: Calculator },
    { id: 'comprehensive', label: 'Multi-Head & Salary Tax', icon: Briefcase },
    { id: 'ai-advisor', label: 'Tax Advisor', icon: Sparkles },
    { id: 'surveillance', label: 'Cash Surveillance', icon: AlertTriangle },
    { id: 'advancetax', label: 'Advance Tax & 234C', icon: Calendar },
    { id: 'invoice', label: 'GST & LUT Export', icon: FileSpreadsheet },
    { id: 'itr4', label: 'ITR-4 JSON Schema', icon: FileText },
    { id: 'rac', label: 'Tax Rules & Config', icon: Code2 },
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
                Income Tax & Presumptive Tax Calculator for Freelancers & Small Businesses
              </p>
            </div>
          </div>

          {/* Right: Actions & User Profile Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap sm:flex-nowrap justify-end">
            {/* Tax Glossary Button */}
            <button
              onClick={() => setIsInfoDrawerOpen(true)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-semibold shadow-sm"
              title="Open Tax Terms Glossary & Plain-English Definitions"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tax Glossary</span>
            </button>

            {/* Small Tour Icon Launcher */}
            <button
              onClick={openTour}
              className="px-2 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-1 text-xs font-bold"
              title="Launch Guided Setup Tour (Pre-populates your active data)"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tour</span>
            </button>

            {/* Guided Setup Button */}
            <button
              onClick={openTour}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg border border-emerald-500/50 text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
              title="Launch Guided Setup Wizard"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Guided Setup</span>
            </button>

            {currentUser && (
              <div className="relative shrink-0" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-slate-950/90 hover:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-800 transition-all cursor-pointer shadow-sm text-left"
                  title="User Profile & Settings"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
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
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      isProfileMenuOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-white animate-fade-in divide-y divide-slate-800/80">
                    {/* User Summary Header */}
                    <div className="px-3.5 py-2.5">
                      <p className="text-xs font-bold text-slate-100 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5 truncate">
                        {currentUser.type === 'email' ? (
                          <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
                        ) : (
                          <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                        )}
                        <span className="truncate">{currentUser.identifier}</span>
                      </p>
                    </div>

                    {/* Actions List */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setShowChangePasswordModal(true);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:text-amber-300 hover:bg-slate-800/90 flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
                      >
                        <Key className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Reset Password</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:text-rose-400 hover:bg-slate-800/90 flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
                      >
                        <LogOut className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
        />

        {/* Tax Info & Glossary Drawer */}
        <TaxInfoDrawer
          isOpen={isInfoDrawerOpen}
          onClose={() => setIsInfoDrawerOpen(false)}
        />

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

