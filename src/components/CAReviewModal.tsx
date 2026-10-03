import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Mail, Send, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTaxData } from '../context/TaxDataContext';

export interface CAReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileSummary?: {
    grossReceipts?: number;
    cashPercent?: number;
    selectedRegime?: string;
    estimatedTax?: number;
  };
}

export const CAReviewModal: React.FC<CAReviewModalProps> = ({
  isOpen,
  onClose,
  profileSummary,
}) => {
  const { currentUser } = useAuth();
  const { taxData } = useTaxData();

  const [name, setName] = useState<string>(currentUser?.name || '');
  const [email, setEmail] = useState<string>(currentUser?.email || (currentUser?.type === 'email' ? currentUser.identifier : ''));
  const [reviewType, setReviewType] = useState<string>('general');
  const [specificQuestions, setSpecificQuestions] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please enter both your name and a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const gross = profileSummary?.grossReceipts ?? taxData.grossReceipts;
    const cashPct = profileSummary?.cashPercent ?? (taxData.grossReceipts > 0 ? (taxData.cashReceipts / taxData.grossReceipts) * 100 : 0);

    const payload = {
      name: name.trim(),
      email: email.trim(),
      reviewType,
      notes: specificQuestions.trim(),
      profileSummary: {
        grossReceipts: gross,
        cashPercent: Number(cashPct.toFixed(2)),
        selectedRegime: profileSummary?.selectedRegime || 'NEW',
        estimatedTax: profileSummary?.estimatedTax || 0,
        activityType: taxData.activityType,
        hasSalary: taxData.hasSalary,
        hasCapitalGains: taxData.hasCapitalGains,
      },
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/ca-review-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to record review request on server');
      }

      setSubmitted(true);
    } catch (err: any) {
      console.warn('Network issue submitting to /api/ca-review-requests, saving locally:', err);
      // Fallback: save to localStorage so request is preserved
      try {
        const stored = JSON.parse(localStorage.getItem('businesskar_ca_reviews') || '[]');
        stored.push({ ...payload, status: 'pending_sync' });
        localStorage.setItem('businesskar_ca_reviews', JSON.stringify(stored));
      } catch (storageErr) {
        console.error('LocalStorage write failed:', storageErr);
      }
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in my-auto">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Get a Free Tax Review
              </h3>
              <p className="text-[11px] text-slate-400">
                Expert verification from qualified Chartered Accountants
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          /* Confirmation Success State */
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-slate-100">
                ✅ Thanks! We'll Review Your Numbers
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                Check your email (<span className="text-emerald-400 font-mono font-medium">{email}</span>) within 24 hours. A qualified tax expert will review your calculation breakdown and get back to you shortly.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-left text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Obligation Guarantee</span>
              </div>
              <p>
                Your first review is 100% free of charge. Once our formal CA partnership network opens, you'll receive a pre-applied 20% discount on optional full-service return filings.
              </p>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Your Full Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Email Address <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                What would you like reviewed?
              </label>
              <select
                value={reviewType}
                onChange={(e) => setReviewType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="general">General Tax Calculation</option>
                <option value="regime-choice">New vs Old Regime Choice</option>
                <option value="deductions">Deduction Strategy (80C / 80D / NPS)</option>
                <option value="cash-risk">Cash Receipt Risk & 5% Rule</option>
                <option value="advance-tax">Advance Tax Planning (Sec 234C)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Specific questions or notes (optional)
              </label>
              <textarea
                value={specificQuestions}
                onChange={(e) => setSpecificQuestions(e.target.value)}
                placeholder="e.g. I have foreign export receipts via Wise and want to double check my 44ADA eligibility."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>

            {/* Trust Assurances */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1 leading-snug">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>Free first review with no obligation</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>No spam, no automated sales calls</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>We'll use this information solely for your tax review</span>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Review Request...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send for Review</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
