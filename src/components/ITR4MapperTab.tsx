import React, { useState } from 'react';
import { FileText, Copy, Check, Download, ShieldCheck } from 'lucide-react';
import { generateITR4Json } from '../engine/itr4Schema';
import { PresumptiveTaxResult, AdvanceTaxResult } from '../engine/types';

interface ITR4MapperTabProps {
  presumptiveData?: PresumptiveTaxResult;
  advanceTaxData?: AdvanceTaxResult;
}

export const ITR4MapperTab: React.FC<ITR4MapperTabProps> = ({
  presumptiveData,
  advanceTaxData,
}) => {
  const [pan, setPan] = useState<string>('ABCDE1234F');
  const [fullName, setFullName] = useState<string>('Rahul Sharma');
  const [grossReceipts, setGrossReceipts] = useState<number>(4800000);
  const [cashReceipts, setCashReceipts] = useState<number>(100000);
  const [tdsClaimed, setTdsClaimed] = useState<number>(25000);
  const [copied, setCopied] = useState<boolean>(false);

  // Fallbacks if not provided from parent evaluation
  const defaultPresumptive: PresumptiveTaxResult = presumptiveData || {
    workflowRoute: 'SECTION_44ADA',
    presumptiveRateAppliedText: '50% of gross professional receipts',
    deemedProfit: 2400000,
    oldRegime: {
      grossDeemedProfit: 2400000,
      declaredProfitUsed: 2400000,
      otherIncome: 0,
      grossTotalIncome: 2400000,
      deductionsApplied: 150000,
      totalTaxableIncome: 2250000,
      baseTaxBeforeRebate: 487500,
      rebate87A: 0,
      netTaxAfterRebate: 487500,
      cess: 19500,
      totalTaxLiability: 507000,
      effectiveTaxRate: 21.13,
    },
    newRegime: {
      grossDeemedProfit: 2400000,
      declaredProfitUsed: 2400000,
      otherIncome: 0,
      grossTotalIncome: 2400000,
      deductionsApplied: 0,
      totalTaxableIncome: 2400000,
      baseTaxBeforeRebate: 380000,
      rebate87A: 0,
      netTaxAfterRebate: 380000,
      cess: 15200,
      totalTaxLiability: 395200,
      effectiveTaxRate: 16.47,
    },
    recommendedRegime: 'NEW',
    taxSavings: 111800,
    complianceNotes: [],
  };

  const defaultAdvanceTax: AdvanceTaxResult = advanceTaxData || {
    netTaxLiabilityAfterTDS: 370200,
    totalPaidToDate: 370200,
    schedule: [],
    totalShortfall: 0,
    totalInterest234C: 0,
    isInterest234BApplicable: false,
    presumptiveSpecialBenefitNote: 'Presumptive privilege active.',
  };

  const itr4Output = generateITR4Json({
    pan,
    fullName,
    workflowRoute: 'SECTION_44ADA',
    grossReceipts,
    cashReceipts,
    presumptiveResult: defaultPresumptive,
    advanceTaxResult: defaultAdvanceTax,
    tdsClaimed,
    optedNewRegime: true,
  });

  const jsonString = JSON.stringify(itr4Output, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ITR4_AY2027-28_${pan}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Government ITR-4 (Sugam) JSON Payload Generator
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Exports financial calculations directly into the Income Tax Department's official ITR-4 Sugam field mapping structure for AY 2027-28 (FY 2026-27).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Taxpayer Meta Form */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
            Taxpayer Meta Details
          </h3>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Permanent Account Number (PAN)</label>
            <input
              type="text"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-emerald-400 uppercase"
              maxLength={10}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Full Legal Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Gross Professional Receipts (₹)</label>
            <input
              type="number"
              value={grossReceipts}
              onChange={(e) => setGrossReceipts(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">TDS Claimed under 26AS (₹)</label>
            <input
              type="number"
              value={tdsClaimed}
              onChange={(e) => setTdsClaimed(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
            />
          </div>

          <div className="pt-2 text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">Auto-Mapped Field Identifiers:</span>
            <ul className="space-y-0.5 text-[11px] list-disc list-inside">
              <li>Assessment Year: 2027-28</li>
              <li>Financial Year: 2026-27</li>
              <li>Employer Category: OTHERS</li>
              <li>Filing Section: 139(1)</li>
            </ul>
          </div>
        </div>

        {/* JSON Code Viewer */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ITR-4 Sugam Official Schema JSON
            </span>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Payload'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download JSON
              </button>
            </div>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-emerald-300 font-mono overflow-x-auto max-h-[480px]">
            {jsonString}
          </pre>
        </div>
      </div>
    </div>
  );
};
