import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Briefcase,
  DollarSign,
  FileText,
  ShieldCheck,
  TrendingUp,
  Percent,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useTaxData, TaxDataState } from '../context/TaxDataContext';
import { ProfessionCategory, BusinessCategory, EntityType } from '../engine/types';

export const GuidedOnboardingTour: React.FC = () => {
  const { taxData, updateTaxData, closeTour, isTourOpen } = useTaxData();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState<boolean>(false);

  // Draft state initialized from current taxData
  const [draft, setDraft] = useState<TaxDataState>({ ...taxData });

  // Re-sync draft with latest valid taxData whenever the tour is launched
  useEffect(() => {
    if (isTourOpen) {
      setDraft({ ...taxData });
      setCurrentStep(1);
    }
  }, [isTourOpen, taxData]);

  // Update draft helper
  const updateDraft = (updates: Partial<TaxDataState>) => {
    setDraft((prev) => {
      const next = { ...prev, ...updates };

      // Calculate chapter VI-A sum dynamically if broken down fields changed
      if (
        updates.sec80C !== undefined ||
        updates.sec80D !== undefined ||
        updates.sec80CCD1B !== undefined ||
        updates.sec80TTA !== undefined
      ) {
        const sum80C = Math.min(next.sec80C || 0, 150000);
        const sum80D = next.sec80D || 0;
        const sum80CCD = Math.min(next.sec80CCD1B || 0, 50000);
        const sum80TTA = Math.min(next.sec80TTA || 0, 10000);
        next.chapterVIADeductions = sum80C + sum80D + sum80CCD + sum80TTA;
      }

      // Calculate otherIncome sum dynamically
      if (updates.savingsInterest !== undefined || updates.fdInterest !== undefined) {
        next.otherIncome = (next.savingsInterest || 0) + (next.fdInterest || 0);
      }

      return next;
    });
  };

  // Option 1: Restart Current Section
  const handleRestartCurrentSection = () => {
    if (currentStep === 1) {
      updateDraft({
        grossReceipts: 0,
        cashReceipts: 0,
        declaredProfit: '',
      });
    } else if (currentStep === 2) {
      updateDraft({
        hasSalary: false,
        grossSalary: 0,
        hasHouseProperty: false,
        rentalIncome: 0,
        hasCapitalGains: false,
        stcgEquity: 0,
        stcgOther: 0,
        ltcgEquity: 0,
        ltcgOther: 0,
        hasOtherIncome: false,
        savingsInterest: 0,
        fdInterest: 0,
        otherIncome: 0,
      });
    } else if (currentStep === 3) {
      updateDraft({
        sec80C: 0,
        sec80D: 0,
        sec80CCD1B: 0,
        sec80TTA: 0,
        chapterVIADeductions: 0,
        tdsClaimed: 0,
      });
    } else if (currentStep === 4) {
      updateDraft({
        isExport: false,
        lutNumber: '',
        q1Paid: 0,
        q2Paid: 0,
        q3Paid: 0,
        q4Paid: 0,
      });
    }
  };

  // Option 2: Restart Tour from Beginning
  const handleRestartTourFromBeginning = () => {
    setCurrentStep(1);
    setDraft({ ...taxData });
  };

  // Option 3: Exit Tour without Saving
  const handleExitClick = () => {
    setShowExitConfirmModal(true);
  };

  const handleConfirmExit = () => {
    setShowExitConfirmModal(false);
    closeTour();
  };

  // Complete & Save Setup
  const handleCompleteSetup = () => {
    updateTaxData({
      ...draft,
      hasCompletedWizard: true,
      isDemoDataLoaded: false,
    });
    closeTour();
  };

  const formatINR = (val: number) => `₹${(Number(val) || 0).toLocaleString('en-IN')}`;

  const stepsInfo = [
    { num: 1, title: 'Entity & Presumptive Income' },
    { num: 2, title: 'Multi-Head Income Sources' },
    { num: 3, title: 'Deductions & Tax Credits' },
    { num: 4, title: 'GST, Export & Advance Tax' },
  ];

  if (!isTourOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Modal Header & Progress */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>Guided Tax Setup Wizard</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Step {currentStep} of 4
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {stepsInfo[currentStep - 1].title}
                </p>
              </div>
            </div>

            {/* Header Right Action Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExitClick}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
                title="Exit Tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>

          {/* Step Indicator Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {stepsInfo.map((s) => (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border text-left transition-all truncate flex items-center gap-1.5 ${
                  s.num === currentStep
                    ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 font-bold'
                    : s.num < currentStep
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] shrink-0 font-bold">
                  {s.num < currentStep ? '✓' : s.num}
                </span>
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Step Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* STEP 1: Entity & Presumptive Income */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Basic Entity Profile & Presumptive Turnover (Sec 44AD / 44ADA)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select your legal constitution and enter your total annual turnover / professional receipts for FY 2026-27.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Entity Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Taxpayer Entity Type
                  </label>
                  <select
                    value={draft.entityType}
                    onChange={(e) =>
                      updateDraft({ entityType: e.target.value as EntityType })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="INDIVIDUAL">Individual / Proprietorship</option>
                    <option value="HUF">Hindu Undivided Family (HUF)</option>
                    <option value="PARTNERSHIP_FIRM">Partnership Firm (non-LLP)</option>
                  </select>
                </div>

                {/* Activity Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Primary Activity Type
                  </label>
                  <select
                    value={draft.activityType}
                    onChange={(e) =>
                      updateDraft({
                        activityType: e.target.value as 'PROFESSION' | 'BUSINESS',
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PROFESSION">Specified Profession (Section 44ADA - 50% Deemed Profit)</option>
                    <option value="BUSINESS">General Business / Trading (Section 44AD - 6%/8% Deemed Profit)</option>
                  </select>
                </div>

                {/* Category Dropdown */}
                {draft.activityType === 'PROFESSION' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Profession Sub-Category
                    </label>
                    <select
                      value={draft.professionCategory}
                      onChange={(e) =>
                        updateDraft({
                          professionCategory: e.target.value as ProfessionCategory,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="IT_SOFTWARE">IT Software & Consulting</option>
                      <option value="LEGAL">Legal Practice</option>
                      <option value="MEDICAL">Medical & Healthcare</option>
                      <option value="ENGINEERING">Engineering & Architecture</option>
                      <option value="ACCOUNTANCY">Accountancy & CA Services</option>
                      <option value="TECHNICAL_CONSULTANCY">Technical Consultancy</option>
                      <option value="INTERIOR_DECORATION">Interior Decoration</option>
                      <option value="OTHER_PROFESSION">Other Eligible Profession</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Business Sub-Category
                    </label>
                    <select
                      value={draft.businessCategory}
                      onChange={(e) =>
                        updateDraft({
                          businessCategory: e.target.value as BusinessCategory,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="RETAIL_TRADING">Retail Trading</option>
                      <option value="WHOLESALE_TRADING">Wholesale Trading</option>
                      <option value="MANUFACTURING">Manufacturing Unit</option>
                      <option value="SERVICE_PROVIDER">Service Provider</option>
                      <option value="COMMISSION_AGENCY">Commission Agency</option>
                      <option value="OTHER_BUSINESS">Other Eligible Business</option>
                    </select>
                  </div>
                )}

                {/* Gross Receipts */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Gross Annual Turnover / Receipts (₹)
                  </label>
                  <input
                    type="number"
                    value={draft.grossReceipts || ''}
                    placeholder="e.g. 4800000"
                    onChange={(e) =>
                      updateDraft({ grossReceipts: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* Cash Receipts */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Cash Receipts Included in Gross Turnover (₹)</span>
                    <span className="text-[10px] text-amber-400 font-mono">5% Statutory Limit</span>
                  </label>
                  <input
                    type="number"
                    value={draft.cashReceipts || ''}
                    placeholder="e.g. 120000"
                    onChange={(e) =>
                      updateDraft({ cashReceipts: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* Declared Profit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Higher Declared Profit Amount (Optional - ₹)
                  </label>
                  <input
                    type="number"
                    value={draft.declaredProfit}
                    placeholder="Leave blank for minimum statutory rate"
                    onChange={(e) => updateDraft({ declaredProfit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Quick Glance Summary of Section 1 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Quick Glance — Section 1 Entries</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Entity & Activity</span>
                    <span className="font-bold text-slate-200">{draft.entityType}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Gross Turnover</span>
                    <span className="font-bold text-emerald-400 font-mono">{formatINR(draft.grossReceipts)}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Cash Portion</span>
                    <span className="font-bold text-amber-300 font-mono">{formatINR(draft.cashReceipts)}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Cash % Ratio</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {draft.grossReceipts > 0
                        ? `${((draft.cashReceipts / draft.grossReceipts) * 100).toFixed(2)}%`
                        : '0.0%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Multi-Head Income Checklist & Dynamic Inputs */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Multi-Head Income Source Checklist</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Check all additional income sources applicable to you for FY 2026-27. Checking a source unlocks its detailed fields.
                </p>
              </div>

              {/* Source Checklist Cards */}
              <div className="space-y-4">
                {/* 1. Salary Income */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={draft.hasSalary}
                        onChange={(e) =>
                          updateDraft({
                            hasSalary: e.target.checked,
                            grossSalary: e.target.checked ? draft.grossSalary || 0 : 0,
                          })
                        }
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                      />
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-200">
                        1. Salary Income (Form 16 / CTC)
                      </span>
                    </div>
                    <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 font-mono">
                      Sec 15-17
                    </span>
                  </label>

                  {draft.hasSalary && (
                    <div className="pt-2 border-t border-slate-800/80 pl-6 space-y-2">
                      <label className="block text-xs font-semibold text-slate-300">
                        Gross Annual Salary Income (₹)
                      </label>
                      <input
                        type="number"
                        value={draft.grossSalary || ''}
                        placeholder="e.g. 800000"
                        onChange={(e) =>
                          updateDraft({ grossSalary: Math.max(0, Number(e.target.value)) })
                        }
                        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* 2. House Property / Rental Income */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={draft.hasHouseProperty}
                        onChange={(e) =>
                          updateDraft({
                            hasHouseProperty: e.target.checked,
                            rentalIncome: e.target.checked ? draft.rentalIncome || 0 : 0,
                          })
                        }
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                      />
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-200">
                        2. House Property / Rental Income
                      </span>
                    </div>
                    <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 font-mono">
                      Sec 22-27
                    </span>
                  </label>

                  {draft.hasHouseProperty && (
                    <div className="pt-2 border-t border-slate-800/80 pl-6 space-y-2">
                      <label className="block text-xs font-semibold text-slate-300">
                        Net Annual Rental Income Received (₹)
                      </label>
                      <input
                        type="number"
                        value={draft.rentalIncome || ''}
                        placeholder="e.g. 120000"
                        onChange={(e) =>
                          updateDraft({ rentalIncome: Math.max(0, Number(e.target.value)) })
                        }
                        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* 3. Capital Gains */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={draft.hasCapitalGains}
                        onChange={(e) =>
                          updateDraft({
                            hasCapitalGains: e.target.checked,
                            stcgEquity: e.target.checked ? draft.stcgEquity || 0 : 0,
                            ltcgEquity: e.target.checked ? draft.ltcgEquity || 0 : 0,
                          })
                        }
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                      />
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-200">
                        3. Capital Gains (Stocks, Mutual Funds, Real Estate)
                      </span>
                    </div>
                    <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 font-mono">
                      Sec 45-55
                    </span>
                  </label>

                  {draft.hasCapitalGains && (
                    <div className="pt-2 border-t border-slate-800/80 pl-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          STCG Equity (20% Sec 111A - ₹)
                        </label>
                        <input
                          type="number"
                          value={draft.stcgEquity || ''}
                          placeholder="e.g. 150000"
                          onChange={(e) =>
                            updateDraft({ stcgEquity: Math.max(0, Number(e.target.value)) })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          LTCG Equity (12.5% Sec 112A over 1.25L - ₹)
                        </label>
                        <input
                          type="number"
                          value={draft.ltcgEquity || ''}
                          placeholder="e.g. 250000"
                          onChange={(e) =>
                            updateDraft({ ltcgEquity: Math.max(0, Number(e.target.value)) })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          STCG Other (Slab Rate - ₹)
                        </label>
                        <input
                          type="number"
                          value={draft.stcgOther || ''}
                          placeholder="0"
                          onChange={(e) =>
                            updateDraft({ stcgOther: Math.max(0, Number(e.target.value)) })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          LTCG Other / Property (12.5%/20% - ₹)
                        </label>
                        <input
                          type="number"
                          value={draft.ltcgOther || ''}
                          placeholder="0"
                          onChange={(e) =>
                            updateDraft({ ltcgOther: Math.max(0, Number(e.target.value)) })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Other Income */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={draft.hasOtherIncome}
                        onChange={(e) =>
                          updateDraft({
                            hasOtherIncome: e.target.checked,
                            savingsInterest: e.target.checked ? draft.savingsInterest || 0 : 0,
                            fdInterest: e.target.checked ? draft.fdInterest || 0 : 0,
                          })
                        }
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                      />
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-200">
                        4. Savings & FD Interest / Dividends / Other Sources
                      </span>
                    </div>
                    <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 font-mono">
                      Sec 56-59
                    </span>
                  </label>

                  {draft.hasOtherIncome && (
                    <div className="pt-2 border-t border-slate-800/80 pl-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Savings Account Interest (₹)
                        </label>
                        <input
                          type="number"
                          value={draft.savingsInterest || ''}
                          placeholder="e.g. 15000"
                          onChange={(e) =>
                            updateDraft({ savingsInterest: Math.max(0, Number(e.target.value)) })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          FD Interest / Dividends / Misc (₹)
                        </label>
                        <input
                          type="number"
                          value={draft.fdInterest || ''}
                          placeholder="e.g. 45000"
                          onChange={(e) =>
                            updateDraft({ fdInterest: Math.max(0, Number(e.target.value)) })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Glance Summary of Section 2 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Quick Glance — Section 2 Multi-Head Summary</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Salary Income</span>
                    <span className="font-bold text-slate-200 font-mono">{formatINR(draft.grossSalary)}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Rental Income</span>
                    <span className="font-bold text-slate-200 font-mono">{formatINR(draft.rentalIncome)}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Capital Gains</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {formatINR(draft.stcgEquity + draft.stcgOther + draft.ltcgEquity + draft.ltcgOther)}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Other Interest Income</span>
                    <span className="font-bold text-slate-200 font-mono">{formatINR(draft.otherIncome)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Deductions & Tax Credits */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Chapter VI-A Deductions & TDS Credits (Form 26AS / AIS)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Enter statutory investments eligible under Old Tax Regime and pre-paid TDS credits claimed from clients/employers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 80C */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex justify-between">
                    <span>Section 80C Investments (₹)</span>
                    <span className="text-[10px] text-slate-400">Max ₹1,50,000</span>
                  </label>
                  <input
                    type="number"
                    value={draft.sec80C || ''}
                    placeholder="PPF, ELSS, EPF, Life Insurance"
                    onChange={(e) =>
                      updateDraft({ sec80C: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* 80D */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Section 80D Health Insurance (₹)
                  </label>
                  <input
                    type="number"
                    value={draft.sec80D || ''}
                    placeholder="Medical insurance self/family"
                    onChange={(e) =>
                      updateDraft({ sec80D: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* 80CCD1B */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex justify-between">
                    <span>Section 80CCD(1B) NPS Contribution (₹)</span>
                    <span className="text-[10px] text-slate-400">Max ₹50,000</span>
                  </label>
                  <input
                    type="number"
                    value={draft.sec80CCD1B || ''}
                    placeholder="NPS additional contribution"
                    onChange={(e) =>
                      updateDraft({ sec80CCD1B: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* 80TTA */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex justify-between">
                    <span>Section 80TTA Savings Interest (₹)</span>
                    <span className="text-[10px] text-slate-400">Max ₹10,000</span>
                  </label>
                  <input
                    type="number"
                    value={draft.sec80TTA || ''}
                    placeholder="Savings account interest deduction"
                    onChange={(e) =>
                      updateDraft({ sec80TTA: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* TDS Claimed */}
                <div className="md:col-span-2 bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-emerald-400 flex items-center justify-between">
                    <span>TDS Credits Claimed under Form 26AS / AIS (₹)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Section 194J / 194C / 192</span>
                  </label>
                  <input
                    type="number"
                    value={draft.tdsClaimed || ''}
                    placeholder="e.g. 30000"
                    onChange={(e) =>
                      updateDraft({ tdsClaimed: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Quick Glance Summary of Section 3 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Quick Glance — Section 3 Deductions & Tax Credits</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Total Chapter VI-A Claimed</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {formatINR(draft.chapterVIADeductions)}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">TDS Credit (Form 26AS)</span>
                    <span className="font-bold text-emerald-400 font-mono">{formatINR(draft.tdsClaimed)}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">80C + 80CCD Subtotal</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {formatINR((draft.sec80C || 0) + (draft.sec80CCD1B || 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: GST, Export & Advance Tax Preferences & Final Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>GST Export & Advance Tax History Preferences</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Configure zero-rated export details and advance tax installments paid in FY 2026-27.
                </p>
              </div>

              {/* GST Export Details */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={draft.isExport}
                      onChange={(e) => updateDraft({ isExport: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-xs font-bold text-slate-200">
                      Cross-Border Foreign Software Export (Zero-Rated GST)
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 font-mono">
                    GST LUT
                  </span>
                </label>

                {draft.isExport && (
                  <div className="pt-2 border-t border-slate-800/80 pl-6 space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Letter of Undertaking (LUT) Registration ARN
                    </label>
                    <input
                      type="text"
                      value={draft.lutNumber}
                      placeholder="e.g. AD270326001928X"
                      onChange={(e) => updateDraft({ lutNumber: e.target.value })}
                      className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Advance Tax Paid Quarters */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Advance Tax Paid History (FY 2026-27)</span>
                  <span className="text-[10px] text-emerald-400">Sec 211 Single March 15 Deadline for 44AD/ADA</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Q1 Paid (by June 15 - ₹)
                    </label>
                    <input
                      type="number"
                      value={draft.q1Paid || ''}
                      placeholder="0"
                      onChange={(e) =>
                        updateDraft({ q1Paid: Math.max(0, Number(e.target.value)) })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Q2 Paid (by Sept 15 - ₹)
                    </label>
                    <input
                      type="number"
                      value={draft.q2Paid || ''}
                      placeholder="0"
                      onChange={(e) =>
                        updateDraft({ q2Paid: Math.max(0, Number(e.target.value)) })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Q3 Paid (by Dec 15 - ₹)
                    </label>
                    <input
                      type="number"
                      value={draft.q3Paid || ''}
                      placeholder="0"
                      onChange={(e) =>
                        updateDraft({ q3Paid: Math.max(0, Number(e.target.value)) })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Q4 Paid (by March 15 - ₹)
                    </label>
                    <input
                      type="number"
                      value={draft.q4Paid || ''}
                      placeholder="e.g. 150000"
                      onChange={(e) =>
                        updateDraft({ q4Paid: Math.max(0, Number(e.target.value)) })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Final Complete Tax Profile Overview */}
              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Final Tax Profile Master Overview</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Presumptive Turnover</span>
                    <span className="font-bold text-emerald-400 font-mono truncate block">
                      {formatINR(draft.grossReceipts)}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Gross Salary</span>
                    <span className="font-bold text-slate-200 font-mono truncate block">
                      {formatINR(draft.grossSalary)}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Rental Income</span>
                    <span className="font-bold text-slate-200 font-mono truncate block">
                      {formatINR(draft.rentalIncome)}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Capital Gains</span>
                    <span className="font-bold text-slate-200 font-mono truncate block">
                      {formatINR(draft.stcgEquity + draft.ltcgEquity)}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Deductions (80C etc)</span>
                    <span className="font-bold text-emerald-300 font-mono truncate block">
                      {formatINR(draft.chapterVIADeductions)}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Advance Tax Paid</span>
                    <span className="font-bold text-emerald-400 font-mono truncate block">
                      {formatINR(draft.q1Paid + draft.q2Paid + draft.q3Paid + draft.q4Paid)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Toolbar & Options Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: 3 Required Options Toolbar */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <button
              onClick={handleRestartCurrentSection}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-amber-300 bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-800 transition-all"
              title="Reset inputs in this section to 0"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Reset Section</span>
            </button>

            <button
              onClick={handleRestartTourFromBeginning}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-cyan-300 bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-800 transition-all"
              title="Restart wizard from step 1"
            >
              <RefreshCw className="w-3 h-3 text-cyan-400" />
              <span>Restart Tour</span>
            </button>

            <button
              onClick={handleExitClick}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-800 transition-all"
              title="Exit without saving wizard changes"
            >
              <X className="w-3 h-3 text-rose-400" />
              <span>Exit Wizard</span>
            </button>
          </div>

          {/* Right: Step Navigation */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <span>Next Section</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCompleteSetup}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete & Apply Tax Setup</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Exit Popup Modal */}
      {showExitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="inline-flex p-3 bg-rose-500/10 rounded-full border border-rose-500/20 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-100">Exit Guided Tour?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to exit without saving? Any changes entered during this setup session will be discarded.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowExitConfirmModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 rounded-xl transition-all"
              >
                Continue Setup
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2 rounded-xl transition-all"
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
