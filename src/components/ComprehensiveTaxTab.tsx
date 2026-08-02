import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  Building2,
  FileText,
  Percent,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
  ShieldCheck,
  Layers,
  Award,
} from 'lucide-react';
import { calculateComprehensiveTax } from '../engine/comprehensiveTax';
import { ComprehensiveTaxInput, WorkflowRoute } from '../engine/types';
import { useTaxData } from '../context/TaxDataContext';

export const ComprehensiveTaxTab: React.FC = () => {
  const { taxData, updateTaxData } = useTaxData();

  // Input State initialized from taxData
  const [grossSalary, setGrossSalary] = useState<number>(taxData.grossSalary);
  const [workflowRoute, setWorkflowRoute] = useState<WorkflowRoute>(
    taxData.activityType === 'BUSINESS' ? 'SECTION_44AD' : 'SECTION_44ADA'
  );
  const [freelanceGrossReceipts, setFreelanceGrossReceipts] = useState<number>(taxData.grossReceipts);
  const [freelanceCashReceipts, setFreelanceCashReceipts] = useState<number>(taxData.cashReceipts);

  const [stcgEquity, setStcgEquity] = useState<number>(taxData.stcgEquity);
  const [stcgOther, setStcgOther] = useState<number>(taxData.stcgOther);
  const [ltcgEquity, setLtcgEquity] = useState<number>(taxData.ltcgEquity);
  const [ltcgOther, setLtcgOther] = useState<number>(taxData.ltcgOther);

  const [otherIncome, setOtherIncome] = useState<number>(taxData.otherIncome);
  const [chapterVIADeductions, setChapterVIADeductions] = useState<number>(taxData.chapterVIADeductions);

  // Sync state when global taxData updates
  useEffect(() => {
    setGrossSalary(taxData.grossSalary);
    setWorkflowRoute(taxData.activityType === 'BUSINESS' ? 'SECTION_44AD' : 'SECTION_44ADA');
    setFreelanceGrossReceipts(taxData.grossReceipts);
    setFreelanceCashReceipts(taxData.cashReceipts);
    setStcgEquity(taxData.stcgEquity);
    setStcgOther(taxData.stcgOther);
    setLtcgEquity(taxData.ltcgEquity);
    setLtcgOther(taxData.ltcgOther);
    setOtherIncome(taxData.otherIncome);
    setChapterVIADeductions(taxData.chapterVIADeductions);
  }, [taxData]);

  const inputPayload: ComprehensiveTaxInput = useMemo(
    () => ({
      grossSalary,
      workflowRoute,
      freelanceGrossReceipts,
      freelanceCashReceipts,
      capitalGains: {
        stcgEquity,
        stcgOther,
        ltcgEquity,
        ltcgOther,
      },
      otherIncome,
      chapterVIADeductions,
    }),
    [
      grossSalary,
      workflowRoute,
      freelanceGrossReceipts,
      freelanceCashReceipts,
      stcgEquity,
      stcgOther,
      ltcgEquity,
      ltcgOther,
      otherIncome,
      chapterVIADeductions,
    ]
  );

  const taxResult = useMemo(
    () => calculateComprehensiveTax(inputPayload),
    [inputPayload]
  );

  const { newRegime, oldRegime, recommendedRegime, taxSavings, complianceNotes } = taxResult;

  // Preset Handlers
  const applyPresetSalariedFreelancer = () => {
    setGrossSalary(800000);
    setWorkflowRoute('SECTION_44ADA');
    setFreelanceGrossReceipts(1500000);
    setFreelanceCashReceipts(25000);
    setStcgEquity(50000);
    setStcgOther(0);
    setLtcgEquity(100000);
    setLtcgOther(0);
    setOtherIncome(40000);
    setChapterVIADeductions(150000);
  };

  const applyPresetStockTraderFreelancer = () => {
    setGrossSalary(0);
    setWorkflowRoute('SECTION_44ADA');
    setFreelanceGrossReceipts(3500000);
    setFreelanceCashReceipts(100000);
    setStcgEquity(300000);
    setStcgOther(50000);
    setLtcgEquity(500000);
    setLtcgOther(200000);
    setOtherIncome(80000);
    setChapterVIADeductions(150000);
  };

  const applyPresetFullSpectrumInvestor = () => {
    setGrossSalary(1200000);
    setWorkflowRoute('SECTION_44AD');
    setFreelanceGrossReceipts(2500000);
    setFreelanceCashReceipts(100000);
    setStcgEquity(200000);
    setStcgOther(0);
    setLtcgEquity(350000);
    setLtcgOther(400000);
    setOtherIncome(120000);
    setChapterVIADeductions(200000);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-100">
                Multi-Head Income Tax Calculator (Salary + Freelance + Capital Gains)
              </h2>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                FY 2026-27 (AY 2027-28)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Consolidate gross salary, freelance presumptive profits (Sec 44AD/44ADA), equity/real estate capital gains (STCG Sec 111A / LTCG Sec 112A/112), and interest income into a unified tax computation across New vs Old Tax Regimes.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Quick Presets:
          </span>
          <button
            onClick={applyPresetSalariedFreelancer}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg transition-all"
          >
            Salaried Freelancer (₹8L Salary + ₹15L 44ADA)
          </button>
          <button
            onClick={applyPresetStockTraderFreelancer}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg transition-all"
          >
            Full-time Consultant + Equity Investor
          </button>
          <button
            onClick={applyPresetFullSpectrumInvestor}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg transition-all"
          >
            Full-Spectrum (Salary + 44AD + Stocks + Real Estate)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Income Head Inputs
              </span>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/20">
                5 HEADS
              </span>
            </h3>

            {/* 1. Salary Income */}
            <div className="space-y-2 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  Head 1: Salary Income
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Std Ded: ₹75k (New) / ₹50k (Old)
                </span>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Gross Salary Income (₹)</label>
                <input
                  type="number"
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-semibold focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* 2. Freelance / Presumptive Income */}
            <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Head 2: Presumptive Business / Freelance
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Sec 44AD / 44ADA</span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Presumptive Scheme</label>
                <select
                  value={workflowRoute}
                  onChange={(e) => setWorkflowRoute(e.target.value as WorkflowRoute)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-medium focus:border-emerald-500 outline-none"
                >
                  <option value="SECTION_44ADA">Section 44ADA (Professionals - 50% Deemed Profit)</option>
                  <option value="SECTION_44AD">Section 44AD (Small Business - 6% Digital / 8% Cash)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">Gross Receipts (₹)</label>
                  <input
                    type="number"
                    value={freelanceGrossReceipts}
                    onChange={(e) => setFreelanceGrossReceipts(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-semibold focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">Cash Receipts (₹)</label>
                  <input
                    type="number"
                    value={freelanceCashReceipts}
                    onChange={(e) => setFreelanceCashReceipts(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-semibold focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Capital Gains Income */}
            <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Head 3: Capital Gains
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Special Tax Rates</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-slate-300 block mb-1">
                    STCG Equity (Sec 111A) <span className="text-emerald-400">(20%)</span>
                  </label>
                  <input
                    type="number"
                    value={stcgEquity}
                    onChange={(e) => setStcgEquity(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-semibold focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-300 block mb-1">
                    STCG Other <span className="text-slate-400">(Slab Rates)</span>
                  </label>
                  <input
                    type="number"
                    value={stcgOther}
                    onChange={(e) => setStcgOther(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-semibold focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-slate-300 block mb-1">
                    LTCG Equity (Sec 112A) <span className="text-emerald-400">(12.5% &gt; ₹1.25L)</span>
                  </label>
                  <input
                    type="number"
                    value={ltcgEquity}
                    onChange={(e) => setLtcgEquity(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-semibold focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-300 block mb-1">
                    LTCG Other (Real Estate/Gold) <span className="text-emerald-400">(12.5%)</span>
                  </label>
                  <input
                    type="number"
                    value={ltcgOther}
                    onChange={(e) => setLtcgOther(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-semibold focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. Other Income & 5. Chapter VI-A Deductions */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <label className="text-[11px] font-bold text-emerald-400 block mb-1">Head 4: Other Income</label>
                <input
                  type="number"
                  value={otherIncome}
                  onChange={(e) => setOtherIncome(Number(e.target.value))}
                  placeholder="Interest / Rent"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-semibold focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <label className="text-[11px] font-bold text-amber-400 block mb-1">Chapter VI-A Deductions</label>
                <input
                  type="number"
                  value={chapterVIADeductions}
                  onChange={(e) => setChapterVIADeductions(Number(e.target.value))}
                  placeholder="80C / 80D (Old Regime)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-semibold focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Results & Regime Comparison */}
        <div className="lg:col-span-7 space-y-4">
          {/* Recommendation Banner */}
          <div
            className={`p-5 rounded-2xl border shadow-sm transition-all ${
              recommendedRegime === 'NEW'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                : 'bg-indigo-950/40 border-indigo-500/40 text-indigo-100'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Optimal Tax Regime Recommendation
                  </span>
                </div>
                <h3 className="text-lg font-extrabold mt-1">
                  {recommendedRegime === 'NEW' ? 'New Tax Regime (Section 115BAC)' : 'Old Tax Regime'}
                </h3>
                <p className="text-xs opacity-90 mt-0.5">
                  Save up to <span className="font-bold font-mono text-emerald-300">₹{taxSavings.toLocaleString('en-IN')}</span> in net tax liability for FY 2026-27.
                </p>
              </div>

              <div className="text-right sm:text-right bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 shrink-0">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Recommended Liability</span>
                <span className="text-lg font-mono font-extrabold text-emerald-400">
                  ₹{(recommendedRegime === 'NEW' ? newRegime : oldRegime).totalTaxLiability.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Effective Rate: {(recommendedRegime === 'NEW' ? newRegime : oldRegime).effectiveTaxRateOnTotalIncome}%
                </span>
              </div>
            </div>
          </div>

          {/* Regime Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Tax Regime Card */}
            <div
              className={`bg-slate-900 rounded-2xl p-4 border space-y-3 transition-all ${
                recommendedRegime === 'NEW'
                  ? 'border-emerald-500/60 ring-1 ring-emerald-500/30'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200">New Tax Regime (Sec 115BAC)</span>
                {recommendedRegime === 'NEW' && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    RECOMMENDED
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Gross Salary:</span>
                  <span className="font-mono">₹{newRegime.grossSalary.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>(-) Salaried Std Deduction:</span>
                  <span className="font-mono text-emerald-400">-₹{newRegime.salariedStandardDeduction.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>(+) Freelance Deemed Profit:</span>
                  <span className="font-mono">₹{newRegime.freelanceDeemedProfit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>(+) Capital Gains (STCG+LTCG):</span>
                  <span className="font-mono">₹{(newRegime.stcgEquity + newRegime.stcgOther + newRegime.ltcgEquity + newRegime.ltcgOther).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-300 border-t border-slate-800/80 pt-1 font-semibold">
                  <span>Gross Total Income:</span>
                  <span className="font-mono text-slate-100">₹{newRegime.grossTotalIncome.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Slab Base Tax:</span>
                  <span className="font-mono">₹{newRegime.normalSlabBaseTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>STCG Sec 111A Tax (20%):</span>
                  <span className="font-mono">₹{newRegime.stcgEquityTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>LTCG Sec 112A Tax (12.5%):</span>
                  <span className="font-mono">₹{newRegime.ltcgEquityTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>LTCG Other Tax (12.5%):</span>
                  <span className="font-mono">₹{newRegime.ltcgOtherTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-400 text-[11px]">
                  <span>(-) Sec 87A Rebate:</span>
                  <span className="font-mono">-₹{newRegime.rebate87A.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>(+) Cess (4%):</span>
                  <span className="font-mono">₹{newRegime.cess.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-100 font-bold border-t border-slate-800 pt-1 text-sm">
                  <span>Total Tax Payable:</span>
                  <span className="font-mono text-emerald-400">₹{newRegime.totalTaxLiability.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Old Tax Regime Card */}
            <div
              className={`bg-slate-900 rounded-2xl p-4 border space-y-3 transition-all ${
                recommendedRegime === 'OLD'
                  ? 'border-emerald-500/60 ring-1 ring-emerald-500/30'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200">Old Tax Regime</span>
                {recommendedRegime === 'OLD' && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    RECOMMENDED
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Gross Salary:</span>
                  <span className="font-mono">₹{oldRegime.grossSalary.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>(-) Salaried Std Deduction:</span>
                  <span className="font-mono text-emerald-400">-₹{oldRegime.salariedStandardDeduction.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>(+) Freelance Deemed Profit:</span>
                  <span className="font-mono">₹{oldRegime.freelanceDeemedProfit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-amber-400 text-[11px]">
                  <span>(-) Chapter VI-A Deductions:</span>
                  <span className="font-mono">-₹{oldRegime.chapterVIADeductionsApplied.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-300 border-t border-slate-800/80 pt-1 font-semibold">
                  <span>Net Taxable Normal Income:</span>
                  <span className="font-mono text-slate-100">₹{oldRegime.normalSlabTaxableIncome.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Slab Base Tax:</span>
                  <span className="font-mono">₹{oldRegime.normalSlabBaseTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>STCG Sec 111A Tax (20%):</span>
                  <span className="font-mono">₹{oldRegime.stcgEquityTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>LTCG Sec 112A Tax (12.5%):</span>
                  <span className="font-mono">₹{oldRegime.ltcgEquityTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>LTCG Other Tax (12.5%):</span>
                  <span className="font-mono">₹{oldRegime.ltcgOtherTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-400 text-[11px]">
                  <span>(-) Sec 87A Rebate:</span>
                  <span className="font-mono">-₹{oldRegime.rebate87A.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>(+) Cess (4%):</span>
                  <span className="font-mono">₹{oldRegime.cess.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-100 font-bold border-t border-slate-800 pt-1 text-sm">
                  <span>Total Tax Payable:</span>
                  <span className="font-mono text-emerald-400">₹{oldRegime.totalTaxLiability.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance & Statutory Guidelines */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Statutory Notes & Calculation Principles
            </h4>
            <ul className="space-y-1 text-xs text-slate-300">
              {complianceNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[11px]">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
