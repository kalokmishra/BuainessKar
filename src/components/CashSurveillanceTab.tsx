import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Languages, ArrowUpRight } from 'lucide-react';
import { evaluateCashSurveillance } from '../engine/cashSurveillance';

export const CashSurveillanceTab: React.FC = () => {
  const [grossReceipts, setGrossReceipts] = useState<number>(6000000); // ₹60 Lakhs
  const [cashReceipts, setCashReceipts] = useState<number>(285000); // ₹2.85 Lakhs (4.75% -> Tier 1)

  const surveillance = evaluateCashSurveillance({ grossReceipts, cashReceipts });
  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 text-white">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Cash Surveillance & Statutory 5% Limit Monitor
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Under Section 44AD and Section 44ADA, taxpayers are entitled to extended turnover limits (₹3 Crore / ₹75 Lakhs) ONLY if cash receipts do not exceed 5.0% of gross turnover.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
            Surveillance Simulator
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Gross Receipts (Total Turnover)
            </label>
            <input
              type="number"
              value={grossReceipts}
              onChange={(e) => setGrossReceipts(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[11px] text-emerald-400 mt-1 block">
              {formatINR(grossReceipts)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Cash Receipts Portion (₹)
            </label>
            <input
              type="number"
              value={cashReceipts}
              onChange={(e) => setCashReceipts(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[11px] text-amber-400 mt-1 block">
              {formatINR(cashReceipts)} ({surveillance.cashPercentage}% of Gross)
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[11px] font-semibold text-slate-400 block">Test Threshold Scenarios:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { setGrossReceipts(6000000); setCashReceipts(180000); }} // 3.0%
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-emerald-500 text-[11px] text-slate-300 rounded-lg"
              >
                Normal (3%)
              </button>
              <button
                onClick={() => { setGrossReceipts(6000000); setCashReceipts(288000); }} // 4.8%
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-amber-500 text-[11px] text-slate-300 rounded-lg"
              >
                Tier 1 Warning (4.8%)
              </button>
              <button
                onClick={() => { setGrossReceipts(6000000); setCashReceipts(360000); }} // 6.0%
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-rose-500 text-[11px] text-slate-300 rounded-lg"
              >
                Tier 2 Breach (6%)
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Indicator Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Status Gauge Header Card */}
          <div
            className={`p-5 rounded-2xl border ${
              surveillance.status === 'NORMAL'
                ? 'bg-emerald-950/30 border-emerald-500/40'
                : surveillance.status === 'TIER_1_WARNING'
                ? 'bg-amber-950/30 border-amber-500/40'
                : 'bg-rose-950/30 border-rose-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Surveillance Gauge
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                  surveillance.status === 'NORMAL'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : surveillance.status === 'TIER_1_WARNING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {surveillance.status}
              </span>
            </div>

            {/* Visual Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span>0%</span>
                <span className="text-amber-400">4.5% Warning</span>
                <span className="text-rose-400">5.0% Limit</span>
                <span>10%</span>
              </div>
              <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800 p-0.5 relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    surveillance.status === 'NORMAL'
                      ? 'bg-emerald-500'
                      : surveillance.status === 'TIER_1_WARNING'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, (surveillance.cashPercentage / 10) * 100)}%` }}
                />
              </div>
              <div className="text-right text-xs font-bold text-slate-200 pt-1">
                Current Cash Ratio: {surveillance.cashPercentage}%
              </div>
            </div>

            {/* Alert Message */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                {surveillance.status === 'NORMAL' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {surveillance.status === 'TIER_1_WARNING' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {surveillance.status === 'TIER_2_VIOLATION' && <ShieldAlert className="w-4 h-4 text-rose-400" />}
                {surveillance.alertTitle}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {surveillance.alertMessage}
              </p>
            </div>
          </div>

          {/* Localized Hindi / Hinglish Advice Box */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Languages className="w-4 h-4" />
              <span>Localized Hindi Compliance Advisory (हिंदी टैक्स सलाह)</span>
            </div>
            <p className="text-xs text-slate-300 italic bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
              "{surveillance.localizedHindiAlert}"
            </p>
          </div>

          {/* Action Required Box */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" /> Action Required
            </h4>
            <p className="text-xs text-slate-200">
              {surveillance.actionRequired}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
