import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BrainCircuit,
  TrendingUp,
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
  RefreshCw,
  Zap,
  BookOpen,
  ArrowRight,
  Send,
  Loader2,
} from 'lucide-react';
import { AITaxAdvisorResponse, AITaxTip } from '../engine/types';

interface AITaxAdvisorTabProps {
  calculatorInput?: {
    entityType?: string;
    activityType?: string;
    professionCategory?: string;
    businessCategory?: string;
    grossReceipts: number;
    cashReceipts: number;
    chapterVIADeductions: number;
    tdsClaimed?: number;
  };
}

export const AITaxAdvisorTab: React.FC<AITaxAdvisorTabProps> = ({ calculatorInput }) => {
  const defaultInput = calculatorInput || {
    entityType: 'INDIVIDUAL',
    activityType: 'PROFESSION',
    professionCategory: 'IT_SOFTWARE',
    grossReceipts: 4800000,
    cashReceipts: 120000,
    chapterVIADeductions: 150000,
    tdsClaimed: 25000,
  };

  const [inputData, setInputData] = useState(defaultInput);
  const [loading, setLoading] = useState<boolean>(false);
  const [advisorData, setAdvisorData] = useState<AITaxAdvisorResponse | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [followUpAnswer, setFollowUpAnswer] = useState<string | null>(null);
  const [askingFollowUp, setAskingFollowUp] = useState<boolean>(false);

  useEffect(() => {
    if (calculatorInput) {
      setInputData(calculatorInput);
    }
  }, [calculatorInput]);

  const fetchAITips = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tax/ai-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          setAdvisorData(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch AI tips:', err);
    } finally {
      setLoading(false);
    }
  };

  // Remove auto-trigger on mount so AI analysis only runs when requested by user

  const handleAskFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setAskingFollowUp(true);
    try {
      const res = await fetch('/api/tax/ai-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...inputData,
          customQuestion: customQuestion.trim(),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.overallStrategy) {
          setFollowUpAnswer(json.data.overallStrategy);
        }
      }
    } catch (err) {
      console.error('Follow-up error:', err);
    } finally {
      setAskingFollowUp(false);
    }
  };

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const formatINR = (val: number) => `₹${(val || 0).toLocaleString('en-IN')}`;

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'REGIME_OPTIMIZATION':
        return { label: 'Regime Strategy', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'CASH_SURVEILLANCE':
        return { label: 'Cash Compliance', style: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'ADVANCE_TAX':
        return { label: 'Advance Tax Sec 211', style: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'GST_LUT':
        return { label: 'GST LUT Export', style: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'DEDUCTIONS':
        return { label: 'Chapter VI-A', style: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
      default:
        return { label: 'Tax Optimization', style: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  Businessकर AI Tax Advisor
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                  <BrainCircuit className="w-3 h-3" /> Smart Analysis
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Generates personalized statutory tax-saving strategies, regime optimization pathways, and advance tax checklists tailored directly to your turnover and income metrics.
              </p>
            </div>
          </div>

          <button
            onClick={fetchAITips}
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all shrink-0 self-start md:self-auto"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>{loading ? 'Analyzing Tax Data...' : advisorData ? 'Re-analyze Tax Data' : 'Run AI Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Input Data Context Summary Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <span className="text-slate-400 block text-[11px]">Gross Annual Turnover</span>
          <span className="font-bold text-slate-100 text-sm">{formatINR(inputData.grossReceipts)}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Cash Portion</span>
          <span className="font-bold text-emerald-400 text-sm">
            {formatINR(inputData.cashReceipts)} (
            {((inputData.cashReceipts / (inputData.grossReceipts || 1)) * 100).toFixed(1)}%)
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Deductions Claimed</span>
          <span className="font-bold text-amber-300 text-sm">{formatINR(inputData.chapterVIADeductions)}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Taxpayer Category</span>
          <span className="font-bold text-slate-200 text-sm truncate block">
            {inputData.professionCategory || inputData.activityType || '44ADA Professional'}
          </span>
        </div>
      </div>

      {!loading && !advisorData && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center space-y-4">
          <div className="inline-flex p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-slate-100">Ready to Analyze Your Tax Profile</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click the button below to generate personalized statutory tax-saving strategies, regime optimization pathways, and advance tax checklists tailored directly to your turnover and income metrics.
            </p>
          </div>
          <button
            onClick={fetchAITips}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate AI Tax Analysis</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="inline-flex p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400 animate-pulse">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Consulting Tax Advisor Engine...</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Evaluating Section 44AD/44ADA rules, Section 87A rebate thresholds, Chapter VI-A deductions, and advance tax schedules...
            </p>
          </div>
        </div>
      ) : advisorData ? (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              Executive Tax Strategy Overview
            </div>

            <p className="text-sm font-semibold text-slate-100 leading-relaxed">
              {advisorData.summary}
            </p>

            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-emerald-400 block mb-1">Chartered Accountant Strategy Note:</span>
              {advisorData.overallStrategy}
            </div>
          </div>

          {/* Tips Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Tailored Statutory Tax-Saving Recommendations ({advisorData.tips.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advisorData.tips.map((tip: AITaxTip, idx: number) => {
                const badge = getCategoryBadge(tip.category);
                return (
                  <div
                    key={idx}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.style}`}>
                          {badge.label}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {tip.statutoryRef}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-100">{tip.title}</h4>

                      <p className="text-xs text-slate-300 leading-relaxed">{tip.recommendation}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">Estimated Benefit:</span>
                      <span className="font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded">
                        {tip.impact}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Checklist */}
          {advisorData.actionChecklist && advisorData.actionChecklist.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Year-End Execution Checklist (Before March 31, 2027)
              </h3>

              <div className="space-y-2">
                {advisorData.actionChecklist.map((task: string, idx: number) => {
                  const isChecked = checkedItems[idx] || false;
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(idx)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-300 line-through opacity-75'
                          : 'bg-slate-950 border-slate-800 text-slate-100 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600'
                      }`}>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs leading-relaxed">{task}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ask Follow-Up Tax Question Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              Ask Tax Advisor a Custom Follow-Up Question
            </h3>

            <form onSubmit={handleAskFollowUp} className="flex gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="e.g. How can I optimize Section 80D health insurance claims?"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={askingFollowUp || !customQuestion.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0"
              >
                {askingFollowUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Ask Question
              </button>
            </form>

            {followUpAnswer && (
              <div className="p-3.5 bg-slate-950 rounded-xl border border-emerald-500/30 text-xs text-slate-200 leading-relaxed mt-3">
                <span className="font-bold text-emerald-400 block mb-1">Advisor Strategy Response:</span>
                {followUpAnswer}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
