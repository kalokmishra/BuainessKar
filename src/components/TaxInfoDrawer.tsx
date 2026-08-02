import React, { useState } from 'react';
import { X, Search, BookOpen, Info, Sparkles, HelpCircle, Check, ArrowRight } from 'lucide-react';

interface TaxTerm {
  id: string;
  term: string;
  section?: string;
  category: 'Presumptive' | 'Advance Tax' | 'GST & Export' | 'Regimes & Deductions' | 'Capital Gains';
  simpleDefinition: string;
  example?: string;
  whyItMatters: string;
}

const TAX_GLOSSARY_TERMS: TaxTerm[] = [
  {
    id: 'presumptive-tax',
    term: 'Presumptive Taxation',
    section: 'Sec 44AD / 44ADA',
    category: 'Presumptive',
    simpleDefinition: 'A special tax scheme designed for small businesses and freelancers that lets you declare a fixed percentage of your revenue as income without maintaining complex account books or undergoing tax audits.',
    example: 'If a freelance software developer earns ₹30 Lakhs, they can declare 50% (₹15 Lakhs) as taxable income under Sec 44ADA and deduct normal expenses without saving every single expense receipt.',
    whyItMatters: 'Saves time and accounting fees while providing peace of mind from tax audit hassles.',
  },
  {
    id: 'deemed-profit',
    term: 'Deemed Profit Rate',
    section: 'Sec 44AD (6%/8%) & Sec 44ADA (50%)',
    category: 'Presumptive',
    simpleDefinition: 'The minimum statutory percentage of your total gross receipts that the tax department assumes is your actual profit.',
    example: 'For 44ADA professionals, deemed profit is 50%. For 44AD small businesses, deemed profit is 6% on digital revenue and 8% on cash revenue.',
    whyItMatters: 'You are taxed only on this deemed percentage, not your full revenue.',
  },
  {
    id: 'cash-limit-rule',
    term: '5% Cash Receipts Limit Rule',
    section: 'Proviso to Sec 44AD / 44ADA',
    category: 'Presumptive',
    simpleDefinition: 'A government rule encouraging digital payments: if your cash collections are 5% or less of total revenue, your maximum revenue limit under presumptive tax increases significantly.',
    example: 'A freelancer making ₹70 Lakhs digitally (0% cash) can use 44ADA because the limit expands from ₹50L to ₹75L when cash is ≤ 5%.',
    whyItMatters: 'Keeping cash receipts under 5% unlocks higher revenue caps (₹75L for professionals, ₹3Cr for businesses).',
  },
  {
    id: 'gross-receipts',
    term: 'Gross Annual Receipts / Turnover',
    section: 'Section 44AA',
    category: 'Presumptive',
    simpleDefinition: 'The total income or revenue billed to all your clients/customers in a single financial year before deducting any expenses.',
    example: 'If you issued 12 monthly invoices of $3,000 USD each at ₹83/USD, your gross receipts are ₹29,88,000.',
    whyItMatters: 'Determines whether you qualify for presumptive taxation or need a mandatory tax audit.',
  },
  {
    id: 'advance-tax',
    term: 'Advance Tax',
    section: 'Sec 208 / 211',
    category: 'Advance Tax',
    simpleDefinition: 'Paying your income tax in quarterly installments throughout the year as you earn, rather than paying everything in a lump sum at filing time.',
    example: 'If your estimated net tax for the year is ₹40,000, you pay installments in June (15%), Sept (45%), Dec (75%), and March (100%).',
    whyItMatters: 'Prevents interest penalties under Sections 234B and 234C.',
  },
  {
    id: '234c-penalty',
    term: 'Section 234C Interest Penalty',
    section: 'Sec 234C',
    category: 'Advance Tax',
    simpleDefinition: 'A 1% per month simple interest penalty charged if you delay or underpay your advance tax quarterly installments.',
    example: 'Presumptive taxpayers (44AD/44ADA) get a special exemption and only need to pay 100% advance tax by March 15 in a single payment!',
    whyItMatters: 'Understanding this rule helps you avoid unnecessary interest charges.',
  },
  {
    id: 'tds-26as',
    term: 'TDS (Tax Deducted at Source) & Form 26AS',
    section: 'Sec 194J / 194C',
    category: 'Advance Tax',
    simpleDefinition: 'Money that clients withhold from your payment (usually 10% under Sec 194J or 1% under 194C) and deposit directly with the government under your PAN.',
    example: 'If a client owes you ₹1,00,000, they pay you ₹90,000 and send ₹10,000 to the Income Tax Dept. You claim this ₹10,000 as a tax credit.',
    whyItMatters: 'TDS reduces your final tax bill or generates a tax refund if overpaid.',
  },
  {
    id: 'lut-export',
    term: 'LUT (Letter of Undertaking) & Zero-Rated Export',
    section: 'GST Sec 16 (IGST Act)',
    category: 'GST & Export',
    simpleDefinition: 'An online document filed on the GST portal that allows exporters of services (e.g. remote developers working for US clients) to bill foreign clients without charging 18% GST.',
    example: 'Filing an annual LUT (RFD-11) lets you legally invoice foreign clients at 0% GST as a zero-rated export.',
    whyItMatters: 'Keeps foreign client invoices clean and avoids locking up money in GST refunds.',
  },
  {
    id: 'sac-code',
    term: 'SAC Code (Service Accounting Code)',
    section: 'GST Tariff Code',
    category: 'GST & Export',
    simpleDefinition: 'A standard 6-digit classification code assigned by the GST Department to identify specific types of services.',
    example: 'SAC 998314 stands for "Information Technology consultancy and software development services".',
    whyItMatters: 'Required on all GST invoices and export documentation for legal compliance.',
  },
  {
    id: 'tax-regimes',
    term: 'New Tax Regime vs Old Tax Regime',
    section: 'Sec 115BAC',
    category: 'Regimes & Deductions',
    simpleDefinition: 'The New Regime offers lower tax rate slabs but removes most deductions. The Old Regime has higher tax slabs but allows deductions like 80C, 80D, and HRA.',
    example: 'Under New Regime in FY 2026-27, income up to ₹12 Lakhs incurs zero tax due to Section 87A rebate!',
    whyItMatters: 'Picking the optimal regime can save you thousands of rupees every year.',
  },
  {
    id: 'standard-deduction',
    term: 'Standard Deduction',
    section: 'Sec 16(ia)',
    category: 'Regimes & Deductions',
    simpleDefinition: 'A flat deduction automatically subtracted from salaried income before calculating tax, without requiring any investment proof.',
    example: 'For FY 2026-27 under the New Regime, salaried individuals automatically get a ₹75,000 standard deduction.',
    whyItMatters: 'Directly lowers your taxable salary income.',
  },
  {
    id: 'chapter-6a',
    term: 'Chapter VI-A Deductions (80C, 80D, 80E)',
    section: 'Chapter VI-A',
    category: 'Regimes & Deductions',
    simpleDefinition: 'Tax-saving deductions allowed in the Old Tax Regime for investments in EPF, PPF, ELSS mutual funds (80C up to ₹1.5L), health insurance (80D), or education loans (80E).',
    example: 'Investing ₹1.5 Lakhs in ELSS under Section 80C reduces your taxable income under the Old Regime.',
    whyItMatters: 'Crucial for reducing tax liability if you opt for the Old Tax Regime.',
  },
  {
    id: 'capital-gains',
    term: 'Capital Gains (STCG & LTCG)',
    section: 'Sec 111A, 112A, 112',
    category: 'Capital Gains',
    simpleDefinition: 'Profits earned from selling capital assets like stock market shares, equity mutual funds, real estate, or gold.',
    example: 'LTCG on equity shares held for >12 months enjoys an annual ₹1.25 Lakh tax-free exemption; profits above that are taxed at 12.5%.',
    whyItMatters: 'Capital gains are taxed at special flat rates separate from your normal salary or freelance tax slabs.',
  },
  {
    id: 'itr-4-sugam',
    term: 'ITR-4 Sugam',
    section: 'CBDT Form ITR-4',
    category: 'Presumptive',
    simpleDefinition: 'The simplified income tax return form specifically designed for resident Individuals, HUFs, and Firms opting for Section 44AD or 44ADA presumptive tax.',
    example: 'Filing ITR-4 requires declaring gross receipts, deemed income, and basic bank details—no balance sheet required.',
    whyItMatters: 'The official return form you or your CA file with the Income Tax Department.',
  },
];

interface TaxInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaxInfoDrawer: React.FC<TaxInfoDrawerProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Presumptive', 'Advance Tax', 'GST & Export', 'Regimes & Deductions', 'Capital Gains'];

  const filteredTerms = TAX_GLOSSARY_TERMS.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.simpleDefinition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.section && item.section.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col h-full animate-slide-in">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-1.5">
                  <span>Tax Terms & Concepts</span>
                  <span className="text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                    Plain English Guide
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simple explanations of technical tax jargon used across Businessकर
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close tax info drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Categories */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 space-y-3 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tax terms e.g. 44ADA, TDS, LUT, 234C..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Terms List Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {filteredTerms.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-950/40 rounded-2xl border border-slate-800/60">
                <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-300">No matching tax terms found</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Try searching for another keyword or selecting "All" categories.
                </p>
              </div>
            ) : (
              filteredTerms.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                        <span>{item.term}</span>
                      </h4>
                      {item.section && (
                        <span className="inline-block mt-0.5 text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {item.section}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full shrink-0">
                      {item.category}
                    </span>
                  </div>

                  {/* Simple Definition */}
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {item.simpleDefinition}
                  </p>

                  {/* Real-world Example */}
                  {item.example && (
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-300 space-y-0.5">
                      <span className="font-bold text-emerald-400 block text-[10px] uppercase tracking-wider">
                        Real-World Example:
                      </span>
                      <p className="text-slate-300 leading-normal">{item.example}</p>
                    </div>
                  )}

                  {/* Why it matters */}
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/90 pt-0.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    <span>{item.whyItMatters}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Tax rules apply to FY 2026-27 (AY 2027-28)</span>
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
