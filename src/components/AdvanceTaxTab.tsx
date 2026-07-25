import React, { useState } from 'react';
import { Calendar, ShieldCheck, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { calculateAdvanceTax } from '../engine/advanceTax';
import { AdvanceTaxPayment } from '../engine/types';

export const AdvanceTaxTab: React.FC = () => {
  const [taxLiability, setTaxLiability] = useState<number>(180000); // ₹1.8 Lakhs
  const [tdsCredit, setTdsCredit] = useState<number>(30000); // ₹30,000 TDS
  const [isPresumptive, setIsPresumptive] = useState<boolean>(true); // Sec 211 privilege

  const [q1Paid, setQ1Paid] = useState<number>(0);
  const [q2Paid, setQ2Paid] = useState<number>(0);
  const [q3Paid, setQ3Paid] = useState<number>(0);
  const [q4Paid, setQ4Paid] = useState<number>(150000); // Paid 150k in Q4

  const paymentsMade: AdvanceTaxPayment[] = [
    { quarter: 'Q1', paidAmount: q1Paid },
    { quarter: 'Q2', paidAmount: q2Paid },
    { quarter: 'Q3', paidAmount: q3Paid },
    { quarter: 'Q4', paidAmount: q4Paid },
  ];

  const advanceTaxResult = calculateAdvanceTax({
    estimatedAnnualTaxLiability: taxLiability,
    tdsTcsCredit: tdsCredit,
    paymentsMade,
    isPresumptiveTaxpayer: isPresumptive,
  });

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 text-white">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Advance Tax Quarterly Schedule & Section 234C Planner
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Computes quarterly installment targets and evaluates Section 234C and 234B interest penalties. Presumptive taxpayers under 44AD/44ADA enjoy Section 211 single March 15 deadline benefits.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
            Input Tax & Payments
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Estimated Total Annual Tax Liability (₹)
            </label>
            <input
              type="number"
              value={taxLiability}
              onChange={(e) => setTaxLiability(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              TDS / TCS Credits Claimed (₹)
            </label>
            <input
              type="number"
              value={tdsCredit}
              onChange={(e) => setTdsCredit(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={isPresumptive}
                onChange={(e) => setIsPresumptive(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 bg-slate-950 border-slate-800 focus:ring-emerald-500"
              />
              <span className="font-semibold text-emerald-400">
                Presumptive Taxpayer (Sec 44AD / 44ADA)
              </span>
            </label>
            <p className="text-[11px] text-slate-400 mt-1">
              Enables Section 211(1)(b) single March 15 payment privilege (no Q1-Q3 penalty).
            </p>
          </div>

          {/* Payment Inputs */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 block">Actual Payments Completed:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-400 block text-[11px]">Q1 (By June 15)</label>
                <input
                  type="number"
                  value={q1Paid}
                  onChange={(e) => setQ1Paid(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-400 block text-[11px]">Q2 (By Sept 15)</label>
                <input
                  type="number"
                  value={q2Paid}
                  onChange={(e) => setQ2Paid(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-400 block text-[11px]">Q3 (By Dec 15)</label>
                <input
                  type="number"
                  value={q3Paid}
                  onChange={(e) => setQ3Paid(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-400 block text-[11px]">Q4 (By March 15)</label>
                <input
                  type="number"
                  value={q4Paid}
                  onChange={(e) => setQ4Paid(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Schedule & Penalty Results Column */}
        <div className="lg:col-span-8 space-y-5">
          {/* Statutory Privilege Note */}
          <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-emerald-300 block mb-0.5">
                Section 211(1)(b) Special Privilege Active
              </span>
              <p className="text-slate-300 leading-relaxed">
                {advanceTaxResult.presumptiveSpecialBenefitNote}
              </p>
            </div>
          </div>

          {/* Quarterly Schedule Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
              <span>Quarterly Installment Targets</span>
              <span className="text-emerald-400">
                Net Payable: {formatINR(advanceTaxResult.netTaxLiabilityAfterTDS)}
              </span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-200">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950">
                    <th className="p-2.5">Quarter</th>
                    <th className="p-2.5">Due Date</th>
                    <th className="p-2.5">Target %</th>
                    <th className="p-2.5">Target (₹)</th>
                    <th className="p-2.5">Cum. Paid (₹)</th>
                    <th className="p-2.5">Shortfall</th>
                    <th className="p-2.5">234C Interest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {advanceTaxResult.schedule.map((q) => (
                    <tr key={q.quarter} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-slate-100">{q.quarter}</td>
                      <td className="p-2.5 text-slate-300">{q.dueDate}</td>
                      <td className="p-2.5 text-slate-300">{q.minPercent}%</td>
                      <td className="p-2.5 font-semibold">{formatINR(q.targetAmount)}</td>
                      <td className="p-2.5 text-emerald-400">{formatINR(q.cumulativePaid)}</td>
                      <td className="p-2.5 font-semibold">
                        {q.shortfall > 0 ? (
                          <span className="text-amber-400">{formatINR(q.shortfall)}</span>
                        ) : (
                          <span className="text-slate-500">₹0</span>
                        )}
                      </td>
                      <td className="p-2.5 font-bold">
                        {q.penalty234C > 0 ? (
                          <span className="text-rose-400">{formatINR(q.penalty234C)}</span>
                        ) : (
                          <span className="text-emerald-400">₹0 (Exempt)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Interest Penalty Summary Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-950 p-3 rounded-xl">
              <div>
                <span className="text-slate-400 block">Total Paid to Date:</span>
                <span className="font-bold text-emerald-400">
                  {formatINR(advanceTaxResult.totalPaidToDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Section 234C Interest:</span>
                <span className="font-bold text-rose-400">
                  {formatINR(advanceTaxResult.totalInterest234C)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Section 234B Status:</span>
                <span className={`font-bold ${advanceTaxResult.isInterest234BApplicable ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {advanceTaxResult.isInterest234BApplicable ? 'Applicable (< 90% paid)' : 'Compliant (≥ 90% paid)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
