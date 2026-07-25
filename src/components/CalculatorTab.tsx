import React, { useState, useEffect } from 'react';
import {
  Calculator,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  EligibilityResult,
  PresumptiveTaxResult,
  CashSurveillanceResult,
  EntityType,
  ProfessionCategory,
  BusinessCategory,
} from '../engine/types';

interface CalculatorTabProps {
  onEvaluate: (data: any) => void;
  evaluationData: {
    eligibility: EligibilityResult;
    cashSurveillance: CashSurveillanceResult;
    presumptive: PresumptiveTaxResult;
  } | null;
}

export const CalculatorTab: React.FC<CalculatorTabProps> = ({
  onEvaluate,
  evaluationData,
}) => {
  const [entityType, setEntityType] = useState<EntityType>('INDIVIDUAL');
  const [activityType, setActivityType] = useState<'PROFESSION' | 'BUSINESS'>('PROFESSION');
  const [professionCategory, setProfessionCategory] = useState<ProfessionCategory>('IT_SOFTWARE');
  const [businessCategory, setBusinessCategory] = useState<BusinessCategory>('RETAIL_TRADING');
  const [grossReceipts, setGrossReceipts] = useState<number>(4800000); // ₹48 Lakhs default
  const [cashReceipts, setCashReceipts] = useState<number>(120000); // ₹1.2 Lakhs default (2.5%)
  const [declaredProfit, setDeclaredProfit] = useState<string>('');
  const [otherIncome, setOtherIncome] = useState<number>(0);
  const [chapterVIADeductions, setChapterVIADeductions] = useState<number>(150000);

  const handleRunEvaluation = () => {
    onEvaluate({
      entityType,
      activityType,
      professionCategory,
      businessCategory,
      grossReceipts: Number(grossReceipts) || 0,
      cashReceipts: Number(cashReceipts) || 0,
      declaredProfit: declaredProfit ? Number(declaredProfit) : undefined,
      otherIncome: Number(otherIncome) || 0,
      chapterVIADeductions: Number(chapterVIADeductions) || 0,
    });
  };

  useEffect(() => {
    handleRunEvaluation();
  }, [
    entityType,
    activityType,
    professionCategory,
    businessCategory,
    grossReceipts,
    cashReceipts,
    declaredProfit,
    otherIncome,
    chapterVIADeductions,
  ]);

  const eligibility = evaluationData?.eligibility;
  const presumptive = evaluationData?.presumptive;
  const cashSurveillance = evaluationData?.cashSurveillance;

  const formatINR = (val: number) => `₹${(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400 mt-0.5">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Presumptive Tax Eligibility & Regime Selector
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Evaluates Section 44ADA (Professional 50%) and Section 44AD (Business 6%/8%) rules, cash turnover limits (₹50L / ₹75L / ₹2Cr / ₹3Cr), and compares Old vs New Tax Regime.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Column */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-white">
          <h3 className="text-sm font-semibold text-slate-200 pb-2 border-b border-slate-800 flex items-center justify-between">
            <span>Taxpayer Parameters</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              FY 2026-27
            </span>
          </h3>

          {/* Entity Type */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              1. Entity Structure
            </label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as EntityType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="INDIVIDUAL">Individual / Freelancer / Consultant</option>
              <option value="HUF">Hindu Undivided Family (HUF)</option>
              <option value="PARTNERSHIP">Partnership Firm (non-LLP)</option>
              <option value="LLP">Limited Liability Partnership (LLP) - Disqualified</option>
              <option value="PRIVATE_LIMITED font-bold">Private Limited Company - Disqualified</option>
            </select>
          </div>

          {/* Activity Type */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              2. Activity Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActivityType('PROFESSION')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                  activityType === 'PROFESSION'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Profession (Sec 44ADA)
              </button>
              <button
                type="button"
                onClick={() => setActivityType('BUSINESS')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                  activityType === 'BUSINESS'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Business (Sec 44AD)
              </button>
            </div>
          </div>

          {/* Sub category */}
          {activityType === 'PROFESSION' ? (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Profession Category
              </label>
              <select
                value={professionCategory}
                onChange={(e) => setProfessionCategory(e.target.value as ProfessionCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="IT_SOFTWARE">IT Software & Development Consultancy</option>
                <option value="TECHNICAL_CONSULTANCY">Technical & Management Consultancy</option>
                <option value="LEGAL">Legal Practice / Advocate</option>
                <option value="MEDICAL">Medical Practitioner / Doctor</option>
                <option value="ENGINEERING">Engineering & Architecture</option>
                <option value="ACCOUNTANCY">Accountancy / CA / Financial Services</option>
                <option value="INTERIOR_DECORATION">Interior Decoration</option>
                <option value="FILM_ARTIST">Film Artist & Creative Professional</option>
                <option value="COMPANY_SECRETARY">Company Secretary (CS)</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Business Category
              </label>
              <select
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value as BusinessCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="RETAIL_TRADING">Retail Trading & E-commerce</option>
                <option value="WHOLESALE_TRADING">Wholesale Distribution</option>
                <option value="MANUFACTURING">Micro Manufacturing</option>
                <option value="SERVICES_GENERAL">General Services</option>
                <option value="COMMISSION_OR_BROKERAGE">Commission / Brokerage - Prohibited</option>
                <option value="AGENCY_BUSINESS">Agency Business - Prohibited</option>
              </select>
            </div>
          )}

          {/* Gross Receipts */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">
                Gross Annual Receipts / Turnover (₹)
              </label>
              <span className="text-[11px] text-emerald-400 font-semibold">
                {formatINR(grossReceipts)}
              </span>
            </div>
            <input
              type="number"
              value={grossReceipts}
              onChange={(e) => setGrossReceipts(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            {/* Quick Chips */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {[2500000, 4800000, 7000000, 15000000, 25000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setGrossReceipts(val)}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
                >
                  ₹{(val / 100000).toFixed(0)}L
                </button>
              ))}
            </div>
          </div>

          {/* Cash Receipts */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">
                Cash Receipts Portion (₹)
              </label>
              <span className={`text-[11px] font-semibold ${
                (cashSurveillance?.cashPercentage || 0) > 5 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {formatINR(cashReceipts)} ({cashSurveillance?.cashPercentage || 0}%)
              </span>
            </div>
            <input
              type="number"
              value={cashReceipts}
              onChange={(e) => setCashReceipts(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Optional Chapter VI-A Deductions */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Chapter VI-A Deductions (Old Regime only e.g., 80C, 80D)
            </label>
            <input
              type="number"
              value={chapterVIADeductions}
              onChange={(e) => setChapterVIADeductions(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              placeholder="150000"
            />
          </div>
        </div>

        {/* Right Evaluation Results Column */}
        <div className="lg:col-span-7 space-y-5 text-white">
          {/* Eligibility Routing Badge */}
          {eligibility && (
            <div
              className={`p-4 rounded-2xl border ${
                eligibility.isEligible
                  ? 'bg-emerald-950/40 border-emerald-500/40'
                  : 'bg-rose-950/40 border-rose-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">
                  Routing Outcome
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    eligibility.isEligible
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {eligibility.workflowRoute}
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                {eligibility.isEligible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {eligibility.recommendation}
                  </p>
                  {eligibility.disqualificationReasons.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-rose-300">
                      {eligibility.disqualificationReasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          • <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Statutory Turnover Limit:</span>{' '}
                  <span className="font-bold text-slate-200">
                    {formatINR(eligibility.applicableTurnoverLimit)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Extended Limit Benefit:</span>{' '}
                  <span
                    className={`font-bold ${
                      eligibility.isExtendedLimitApplied
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {eligibility.isExtendedLimitApplied ? 'ACTIVE (Cash ≤ 5%)' : 'FORFEITED (Cash > 5%)'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Deemed Profit Summary */}
          {presumptive && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Presumptive Deemed Income</span>
                <span className="text-emerald-400 lowercase">{presumptive.presumptiveRateAppliedText}</span>
              </h4>

              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 block">Gross Receipts</span>
                  <span className="text-base font-bold text-slate-100">
                    {formatINR(grossReceipts)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Calculated Deemed Profit</span>
                  <span className="text-lg font-extrabold text-emerald-400">
                    {formatINR(presumptive.deemedProfit)}
                  </span>
                </div>
              </div>

              {/* Tax Regimes Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* New Tax Regime Card */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    presumptive.recommendedRegime === 'NEW'
                      ? 'bg-emerald-950/20 border-emerald-500/50 ring-1 ring-emerald-500/30'
                      : 'bg-slate-950 border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-200">New Tax Regime</span>
                    {presumptive.recommendedRegime === 'NEW' && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Recommended
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Taxable Income:</span>
                      <span className="font-semibold text-slate-200">
                        {formatINR(presumptive.newRegime.totalTaxableIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Base Tax:</span>
                      <span>{formatINR(presumptive.newRegime.baseTaxBeforeRebate)}</span>
                    </div>
                    {presumptive.newRegime.rebate87A > 0 && (
                      <div className="flex justify-between text-emerald-400 font-medium">
                        <span>Sec 87A Rebate:</span>
                        <span>-{formatINR(presumptive.newRegime.rebate87A)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400">
                      <span>Health & Edu Cess (4%):</span>
                      <span>{formatINR(presumptive.newRegime.cess)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold">
                      <span>Total Tax Liability:</span>
                      <span className="text-emerald-400">
                        {formatINR(presumptive.newRegime.totalTaxLiability)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Old Tax Regime Card */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    presumptive.recommendedRegime === 'OLD'
                      ? 'bg-emerald-950/20 border-emerald-500/50 ring-1 ring-emerald-500/30'
                      : 'bg-slate-950 border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-200">Old Tax Regime</span>
                    {presumptive.recommendedRegime === 'OLD' && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Recommended
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Deductions Applied:</span>
                      <span className="text-amber-400 font-semibold">
                        -{formatINR(presumptive.oldRegime.deductionsApplied)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Taxable Income:</span>
                      <span className="font-semibold text-slate-200">
                        {formatINR(presumptive.oldRegime.totalTaxableIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Base Tax:</span>
                      <span>{formatINR(presumptive.oldRegime.baseTaxBeforeRebate)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold">
                      <span>Total Tax Liability:</span>
                      <span className="text-slate-200">
                        {formatINR(presumptive.oldRegime.totalTaxLiability)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax Savings Note */}
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-3 text-xs">
                <TrendingDown className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-400">
                    Net Tax Savings: {formatINR(presumptive.taxSavings)}
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Option for {presumptive.recommendedRegime} Tax Regime yields lower tax outlay.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
