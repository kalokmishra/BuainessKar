import React, { useState, useMemo } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Search,
  X,
  BookOpen,
  Code,
  Info,
  HelpCircle,
  Sparkles,
  AlertTriangle,
  Building2,
  CreditCard,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { generateITR4Json, validateITR4SchemaCompliance } from '../engine/itr4Schema';
import { PresumptiveTaxResult, AdvanceTaxResult } from '../engine/types';
import { FieldTooltip } from './FieldTooltip';

interface ITR4MapperTabProps {
  presumptiveData?: PresumptiveTaxResult;
  advanceTaxData?: AdvanceTaxResult;
  calculatorInput?: {
    grossReceipts?: number;
    cashReceipts?: number;
    tdsClaimed?: number;
    optedNewRegime?: boolean;
    workflowRoute?: 'SECTION_44ADA' | 'SECTION_44AD' | 'STANDARD_AUDIT_REQUIRED';
  };
}

interface ITR4SectionGuide {
  id: string;
  title: string;
  category: 'CreationInfo' | 'PersonalInfo' | 'BusinessDetails' | 'IncomeDeductions' | 'TaxComputation' | 'AdvanceTaxAndTDS' | 'BankDetails';
  statutoryRef: string;
  description: string;
  instructions: string[];
  fields: {
    jsonKey: string;
    label: string;
    value: string | number | boolean;
    explanation: string;
  }[];
}

export const ITR4MapperTab: React.FC<ITR4MapperTabProps> = ({
  presumptiveData,
  advanceTaxData,
  calculatorInput,
}) => {
  const [pan, setPan] = useState<string>('ABCDE1234F');
  const [fullName, setFullName] = useState<string>('Rahul Sharma');
  const [grossReceipts, setGrossReceipts] = useState<number>(calculatorInput?.grossReceipts || 4800000);
  const [cashReceipts, setCashReceipts] = useState<number>(calculatorInput?.cashReceipts || 100000);
  const [tdsClaimed, setTdsClaimed] = useState<number>(calculatorInput?.tdsClaimed || 25000);
  const [businessCode, setBusinessCode] = useState<string>('09028');
  const [tradeName, setTradeName] = useState<string>('Software Consultancy Services');
  const [ifsCode, setIfsCode] = useState<string>('SBIN0001234');
  const [accountNumber, setAccountNumber] = useState<string>('998877665544');
  const [bankName, setBankName] = useState<string>('State Bank of India');
  const [optedNewRegime, setOptedNewRegime] = useState<boolean>(calculatorInput?.optedNewRegime !== false);
  const [copied, setCopied] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'GUIDE' | 'JSON'>('GUIDE');

  // Fallbacks if not provided from parent evaluation
  const defaultPresumptive: PresumptiveTaxResult = presumptiveData || {
    workflowRoute: 'SECTION_44ADA',
    presumptiveRateAppliedText: '50% of gross professional receipts',
    deemedProfit: grossReceipts * 0.5,
    oldRegime: {
      grossDeemedProfit: grossReceipts * 0.5,
      declaredProfitUsed: grossReceipts * 0.5,
      otherIncome: 0,
      grossTotalIncome: grossReceipts * 0.5,
      deductionsApplied: 150000,
      totalTaxableIncome: Math.max(0, grossReceipts * 0.5 - 150000),
      baseTaxBeforeRebate: 487500,
      rebate87A: 0,
      netTaxAfterRebate: 487500,
      cess: 19500,
      totalTaxLiability: 507000,
      effectiveTaxRate: 21.13,
    },
    newRegime: {
      grossDeemedProfit: grossReceipts * 0.5,
      declaredProfitUsed: grossReceipts * 0.5,
      otherIncome: 0,
      grossTotalIncome: grossReceipts * 0.5,
      deductionsApplied: 0,
      totalTaxableIncome: grossReceipts * 0.5,
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
    netTaxLiabilityAfterTDS: Math.max(0, defaultPresumptive.newRegime.totalTaxLiability - tdsClaimed),
    totalPaidToDate: Math.max(0, defaultPresumptive.newRegime.totalTaxLiability - tdsClaimed),
    schedule: [],
    totalShortfall: 0,
    totalInterest234C: 0,
    isInterest234BApplicable: false,
    presumptiveSpecialBenefitNote: 'Presumptive privilege active.',
  };

  const itr4Output = generateITR4Json({
    pan,
    fullName,
    workflowRoute: calculatorInput?.workflowRoute || 'SECTION_44ADA',
    grossReceipts,
    cashReceipts,
    presumptiveResult: defaultPresumptive,
    advanceTaxResult: defaultAdvanceTax,
    tdsClaimed,
    optedNewRegime,
    businessDetails: {
      businessCode,
      tradeName,
      description: 'Professional Services under Section 44ADA',
    },
    bankDetails: [
      {
        ifsCode,
        bankName,
        accountNumber,
        accountType: 'SAVINGS',
        isPrimaryForRefund: true,
      },
    ],
  });

  const jsonString = JSON.stringify(itr4Output, null, 2);

  const complianceValidation = useMemo(() => {
    return validateITR4SchemaCompliance({
      pan,
      fullName,
      workflowRoute: calculatorInput?.workflowRoute || 'SECTION_44ADA',
      grossReceipts,
      cashReceipts,
      presumptiveResult: defaultPresumptive,
      advanceTaxResult: defaultAdvanceTax,
      tdsClaimed,
      optedNewRegime,
      businessDetails: { businessCode, tradeName },
      bankDetails: [{ ifsCode, bankName, accountNumber, accountType: 'SAVINGS', isPrimaryForRefund: true }],
    });
  }, [pan, fullName, grossReceipts, cashReceipts, tdsClaimed, optedNewRegime, businessCode, tradeName, ifsCode, bankName, accountNumber]);

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
    a.download = `ITR4_AY2027-28_${pan.toUpperCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Structured Section Data for Search & Interactive Guidance
  const itr4Sections: ITR4SectionGuide[] = useMemo(() => {
    const itr = itr4Output.ITR.ITR4;
    return [
      {
        id: 'CreationInfo',
        title: 'Creation Metadata (Schema Header)',
        category: 'CreationInfo',
        statutoryRef: 'ITD RaC Spec v1.0.0',
        description: 'System metadata validating statutory payload compliance for official IT Department upload.',
        instructions: [
          'Version 1.0.0 maps directly to CBDT e-filing JSON schema specifications for AY 2027-28 (FY 2026-27).',
          'Timestamp is captured in ISO 8601 UTC format upon generation.',
          'Ensure the source tag reflects the verified Rules-as-Code (RaC) calculation engine.',
        ],
        fields: [
          { jsonKey: 'Source', label: 'Engine Source', value: itr.CreationInfo.Source, explanation: 'Identifies the verified RaC engine generator.' },
          { jsonKey: 'Version', label: 'Schema Version', value: itr.CreationInfo.Version, explanation: 'Current tax rule schema version.' },
          { jsonKey: 'Timestamp', label: 'Generation Timestamp', value: itr.CreationInfo.Timestamp, explanation: 'Exact system timestamp of JSON compilation.' },
        ],
      },
      {
        id: 'PersonalInfo',
        title: 'Personal Info & Tax Regime Option',
        category: 'PersonalInfo',
        statutoryRef: 'Section 115BAC & Section 139(1)',
        description: 'Taxpayer identity details, Permanent Account Number (PAN), and tax regime election.',
        instructions: [
          'PAN must be a valid 10-character alphanumeric code allotted by the Income Tax Department.',
          'Under Section 115BAC, the New Tax Regime is the default regime for AY 2027-28 unless explicitly opted out.',
          'Filing Section 139(1) indicates return filed on or before the statutory due date (July 31 for non-audit cases).',
        ],
        fields: [
          { jsonKey: 'pan', label: 'Permanent Account Number', value: itr.PersonalInfo.pan, explanation: 'Assessee unique PAN identifier.' },
          { jsonKey: 'fullName', label: 'Assessee Legal Name', value: itr.PersonalInfo.fullName, explanation: 'Full name matching Income Tax portal registration.' },
          { jsonKey: 'assessmentYear', label: 'Assessment Year', value: itr.PersonalInfo.assessmentYear, explanation: 'AY 2027-28 (corresponding to FY 2026-27).' },
          { jsonKey: 'financialYear', label: 'Financial Year', value: itr.PersonalInfo.financialYear, explanation: 'FY 2026-27 (April 1, 2026 to March 31, 2027).' },
          { jsonKey: 'employerCategory', label: 'Employer Category', value: itr.PersonalInfo.employerCategory, explanation: 'Categorized as OTHERS_FREELANCE_BUSINESS for non-salaried assessees.' },
          { jsonKey: 'filingSection', label: 'Filing Section Code', value: itr.PersonalInfo.filingSection, explanation: '139(1) - Return filed within original statutory due date.' },
          { jsonKey: 'optedNewTaxRegime', label: 'New Tax Regime (Sec 115BAC)', value: itr.PersonalInfo.optedNewTaxRegime ? 'Yes (Default)' : 'No (Opted Out)', explanation: 'Election status for Section 115BAC concessional slab rates.' },
        ],
      },
      {
        id: 'BusinessDetails',
        title: 'Business & Trade Classification',
        category: 'BusinessDetails',
        statutoryRef: 'CBDT Nature of Business Codes',
        description: 'Official nature of business code and registered trade name for 44AD/44ADA filing.',
        instructions: [
          'Business Code 09028 identifies Software Consultancy & IT Services.',
          'Trade Name should reflect your registered business or freelancing brand name.',
          'Presumptive taxpayers do not require full Balance Sheet submission under ITR-4 Sugam.',
        ],
        fields: [
          { jsonKey: 'businessCode', label: 'Nature of Business Code', value: itr.BusinessDetails?.businessCode || businessCode, explanation: 'Official CBDT classification code for business or profession.' },
          { jsonKey: 'tradeName', label: 'Trade / Business Name', value: itr.BusinessDetails?.tradeName || tradeName, explanation: 'Name under which profession or business is carried out.' },
          { jsonKey: 'description', label: 'Activity Description', value: itr.BusinessDetails?.description || 'Professional Services', explanation: 'Summary description of professional activities.' },
        ],
      },
      {
        id: 'IncomeDeductions',
        title: 'Income & Presumptive Profit (Sec 44AD / 44ADA)',
        category: 'IncomeDeductions',
        statutoryRef: 'Section 44AD & Section 44ADA',
        description: 'Presumptive gross receipts, minimum deemed profit percentage, and Chapter VI-A deductions.',
        instructions: [
          'Section 44ADA applies to specified professionals with gross receipts up to ₹50 Lakhs (or ₹75 Lakhs if cash receipts <= 5%). Deemed profit is minimum 50%.',
          'Section 44AD applies to eligible small businesses with turnover up to ₹2 Crores (or ₹3 Crores if cash <= 5%). Deemed profit is 6% on digital / 8% on cash receipts.',
          'Chapter VI-A deductions (e.g. 80C, 80D) are allowed ONLY under the Old Tax Regime. They are restricted under Section 115BAC New Regime.',
        ],
        fields: [
          ...(itr.IncomeDeductions.GrossReceipts44ADA !== undefined ? [{ jsonKey: 'GrossReceipts44ADA', label: '44ADA Professional Receipts', value: `₹${itr.IncomeDeductions.GrossReceipts44ADA.toLocaleString('en-IN')}`, explanation: 'Total gross receipts from professional services rendered.' }] : []),
          ...(itr.IncomeDeductions.PresumptiveIncome44ADA !== undefined ? [{ jsonKey: 'PresumptiveIncome44ADA', label: '44ADA Presumptive Income', value: `₹${itr.IncomeDeductions.PresumptiveIncome44ADA.toLocaleString('en-IN')}`, explanation: 'Deemed taxable profit declared under Section 44ADA (min 50%).' }] : []),
          ...(itr.IncomeDeductions.GrossReceipts44AD_Digital !== undefined ? [{ jsonKey: 'GrossReceipts44AD_Digital', label: '44AD Digital Receipts', value: `₹${itr.IncomeDeductions.GrossReceipts44AD_Digital.toLocaleString('en-IN')}`, explanation: 'Turnover received through banking / digital modes (6% deemed profit).' }] : []),
          ...(itr.IncomeDeductions.GrossReceipts44AD_Cash !== undefined ? [{ jsonKey: 'GrossReceipts44AD_Cash', label: '44AD Cash Receipts', value: `₹${itr.IncomeDeductions.GrossReceipts44AD_Cash.toLocaleString('en-IN')}`, explanation: 'Turnover received in cash (8% deemed profit rate).' }] : []),
          ...(itr.IncomeDeductions.PresumptiveIncome44AD !== undefined ? [{ jsonKey: 'PresumptiveIncome44AD', label: '44AD Presumptive Income', value: `₹${itr.IncomeDeductions.PresumptiveIncome44AD.toLocaleString('en-IN')}`, explanation: 'Deemed business profit declared under Section 44AD.' }] : []),
          { jsonKey: 'GrossTotalIncome', label: 'Gross Total Income', value: `₹${itr.IncomeDeductions.GrossTotalIncome.toLocaleString('en-IN')}`, explanation: 'Total income before applying Chapter VI-A statutory deductions.' },
          { jsonKey: 'DeductionsUnderChapterVIA', label: 'Chapter VI-A Deductions', value: `₹${itr.IncomeDeductions.DeductionsUnderChapterVIA.toLocaleString('en-IN')}`, explanation: 'Total deductions claimed under Section 80C, 80D, 80G, etc.' },
          { jsonKey: 'TotalIncome', label: 'Net Total Taxable Income', value: `₹${itr.IncomeDeductions.TotalIncome.toLocaleString('en-IN')}`, explanation: 'Net taxable income post deductions used for tax computation.' },
        ],
      },
      {
        id: 'TaxComputation',
        title: 'Tax Computation, Rebate & Health/Education Cess',
        category: 'TaxComputation',
        statutoryRef: 'Section 87A & Finance Act 2026',
        description: 'Gross tax liability before rebate, Section 87A tax relief, net tax, and 4% Health & Education Cess.',
        instructions: [
          'Section 87A Tax Rebate provides 100% tax relief up to ₹25,000 for taxable income up to ₹7,00,000 under New Regime (or ₹12,500 for income up to ₹5,00,000 under Old Regime).',
          'Health & Education Cess is levied at a flat rate of 4% on net tax liability after applying Section 87A rebate.',
          'Effective tax rate reflects total tax payable as a percentage of gross total receipts.',
        ],
        fields: [
          { jsonKey: 'GrossTaxLiability', label: 'Gross Tax Liability', value: `₹${itr.TaxComputation.GrossTaxLiability.toLocaleString('en-IN')}`, explanation: 'Tax computed on total taxable income per statutory slab rates.' },
          { jsonKey: 'Section87ARebate', label: 'Section 87A Tax Rebate', value: `₹${itr.TaxComputation.Section87ARebate.toLocaleString('en-IN')}`, explanation: 'Statutory tax relief granted under Section 87A.' },
          { jsonKey: 'NetTaxLiability', label: 'Net Tax After Rebate', value: `₹${itr.TaxComputation.NetTaxLiability.toLocaleString('en-IN')}`, explanation: 'Tax liability after subtracting Section 87A rebate.' },
          { jsonKey: 'EducationCess', label: 'Health & Education Cess (4%)', value: `₹${itr.TaxComputation.EducationCess.toLocaleString('en-IN')}`, explanation: 'Mandatory statutory cess levied at 4%.' },
          { jsonKey: 'TotalTaxPayable', label: 'Total Tax Payable', value: `₹${itr.TaxComputation.TotalTaxPayable.toLocaleString('en-IN')}`, explanation: 'Final tax liability before adjusting advance tax and TDS.' },
        ],
      },
      {
        id: 'AdvanceTaxAndTDS',
        title: 'Advance Tax & TDS Pre-payments (Form 26AS/AIS)',
        category: 'AdvanceTaxAndTDS',
        statutoryRef: 'Section 211(1)(b) & Form 26AS',
        description: 'Credits for TDS deducted under Section 194J/194C/194O and advance tax paid.',
        instructions: [
          'Under Section 211(1)(b), presumptive taxpayers under 44AD/44ADA are exempt from quarterly advance tax installments (June, Sept, Dec) and need pay only 100% on or before March 15.',
          'Ensure Total TDS claimed matches tax credits reflected in Form 26AS / Annual Information Statement (AIS) on the e-filing portal.',
          'If Net Balance Payable > ₹0, pay via Self-Assessment Tax challan (ITNS 280 / Section 140A) prior to submitting return.',
        ],
        fields: [
          { jsonKey: 'TotalTDSClaimed', label: 'Total TDS Credit Claimed', value: `₹${itr.AdvanceTaxAndTDS.TotalTDSClaimed.toLocaleString('en-IN')}`, explanation: 'TDS deducted by clients/deductors under Section 194J/194C/194O.' },
          { jsonKey: 'TotalAdvanceTaxPaid', label: 'Advance Tax Paid', value: `₹${itr.AdvanceTaxAndTDS.TotalAdvanceTaxPaid.toLocaleString('en-IN')}`, explanation: 'Advance tax deposited via ITNS 280 challan during the financial year.' },
          { jsonKey: 'NetBalancePayableOrRefund', label: itr.AdvanceTaxAndTDS.NetBalancePayableOrRefund >= 0 ? 'Net Tax Payable (Sec 140A)' : 'Refund Due to Assessee', value: `₹${Math.abs(itr.AdvanceTaxAndTDS.NetBalancePayableOrRefund).toLocaleString('en-IN')}`, explanation: itr.AdvanceTaxAndTDS.NetBalancePayableOrRefund >= 0 ? 'Self-assessment tax payable before filing.' : 'Refund refundable to assessee bank account.' },
        ],
      },
      {
        id: 'BankDetails',
        title: 'Bank Accounts & Refund Account',
        category: 'BankDetails',
        statutoryRef: 'Section 237 & RBI IFSC Rules',
        description: 'Bank account details for income tax refund credit and record maintenance.',
        instructions: [
          'At least one bank account must be designated as the primary account for receiving tax refunds directly.',
          'IFSC code must match the branch allotted by the Reserve Bank of India.',
        ],
        fields: [
          { jsonKey: 'ifsCode', label: 'Bank IFSC Code', value: itr.BankDetails?.[0]?.ifsCode || ifsCode, explanation: '11-character RBI bank branch IFSC code.' },
          { jsonKey: 'bankName', label: 'Bank Name', value: itr.BankDetails?.[0]?.bankName || bankName, explanation: 'Name of the banking institution.' },
          { jsonKey: 'accountNumber', label: 'Account Number', value: itr.BankDetails?.[0]?.accountNumber || accountNumber, explanation: 'Masked/Full bank account number.' },
          { jsonKey: 'isPrimaryForRefund', label: 'Primary Refund Account', value: itr.BankDetails?.[0]?.isPrimaryForRefund ? 'Yes' : 'No', explanation: 'Designated account for electronic refund credit.' },
        ],
      },
    ];
  }, [itr4Output, businessCode, tradeName, ifsCode, bankName, accountNumber]);

  // Filter sections based on category and search query
  const filteredSections = useMemo(() => {
    return itr4Sections.filter((section) => {
      // 1. Category Filter
      if (selectedCategory !== 'ALL' && section.category !== selectedCategory) {
        return false;
      }

      // 2. Search Query Filter
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();

      const matchesTitle = section.title.toLowerCase().includes(q);
      const matchesRef = section.statutoryRef.toLowerCase().includes(q);
      const matchesDesc = section.description.toLowerCase().includes(q);
      const matchesInstructions = section.instructions.some((inst) => inst.toLowerCase().includes(q));
      const matchesFields = section.fields.some(
        (f) =>
          f.jsonKey.toLowerCase().includes(q) ||
          f.label.toLowerCase().includes(q) ||
          String(f.value).toLowerCase().includes(q) ||
          f.explanation.toLowerCase().includes(q)
      );

      return matchesTitle || matchesRef || matchesDesc || matchesInstructions || matchesFields;
    });
  }, [itr4Sections, selectedCategory, searchQuery]);

  const categoriesList = [
    { id: 'ALL', label: 'All Sections' },
    { id: 'PersonalInfo', label: 'Personal Info' },
    { id: 'BusinessDetails', label: 'Business & Trade' },
    { id: 'IncomeDeductions', label: 'Receipts & Profit (44AD/44ADA)' },
    { id: 'TaxComputation', label: 'Tax & Rebate' },
    { id: 'AdvanceTaxAndTDS', label: 'TDS & Advance Tax' },
    { id: 'BankDetails', label: 'Bank Details' },
    { id: 'CreationInfo', label: 'Schema Metadata' },
  ];

  return (
    <div className="space-y-6 text-white">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-100">
                Government ITR-4 (Sugam) Section Explorer & JSON Generator
              </h2>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                AY 2027-28 (FY 2026-27)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Search ITR-4 form sections, review statutory instructions, and export financial calculations directly into the Income Tax Department's official e-filing JSON structure.
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ITR-4 form sections, fields, instructions (e.g., '44ADA', 'Rebate', '139(1)', 'PAN', 'TDS')..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 p-0.5 rounded-lg hover:bg-slate-800 transition-all"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Mode Toggle Switch */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('GUIDE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'GUIDE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Section Guide & Instructions</span>
            </button>
            <button
              onClick={() => setActiveTab('JSON')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'JSON'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Raw JSON Payload</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Filter:
          </span>
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl font-medium transition-all text-xs shrink-0 whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-800/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Results Summary */}
        {(searchQuery || selectedCategory !== 'ALL') && (
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800/60">
            <div>
              Found <span className="font-bold text-emerald-400">{filteredSections.length}</span> matching section{filteredSections.length !== 1 ? 's' : ''}
              {searchQuery && (
                <span>
                  {' '}for query "<span className="text-slate-200 font-medium">{searchQuery}</span>"
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="text-emerald-400 hover:underline text-[11px] font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Taxpayer Input Controls & Validation */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Taxpayer & Business Meta</span>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-500/20">LIVE MAPPER</span>
            </h3>

            {/* PAN */}
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
                <span>Permanent Account Number (PAN)</span>
                <FieldTooltip
                  section="PersonalInfo"
                  title="Assessee PAN"
                  rule="10-character alphanumeric unique taxpayer identifier required for statutory ITR-4 filing."
                />
              </label>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold"
                maxLength={10}
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
                <span>Full Legal Name</span>
                <FieldTooltip
                  section="PersonalInfo"
                  title="Taxpayer Name"
                  rule="Legal name as registered on the Income Tax Department e-filing portal / PAN database."
                />
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
              />
            </div>

            {/* Business Code & Trade Name */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
                  <span>Nature Code</span>
                  <FieldTooltip
                    section="BusinessDetails"
                    title="Business Activity Code"
                    rule="Official CBDT activity code (e.g., 09028 for Software Consultancy, 09025 for Legal, 09021 for Medical)."
                  />
                </label>
                <input
                  type="text"
                  value={businessCode}
                  onChange={(e) => setBusinessCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200"
                  placeholder="09028"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
                  <span>Trade Name</span>
                  <FieldTooltip
                    section="BusinessDetails"
                    title="Proprietorship Name"
                    rule="Name under which the professional service or business is operated."
                  />
                </label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                  placeholder="Software Consulting"
                />
              </div>
            </div>

            {/* Gross Receipts & TDS */}
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
                <span>Gross Professional Receipts (₹)</span>
                <FieldTooltip
                  section="IncomeDeductions"
                  title="Total Presumptive Revenue"
                  rule="Gross professional revenue to be declared under Schedule BP in ITR-4 Sugam."
                />
              </label>
              <input
                type="number"
                value={grossReceipts}
                onChange={(e) => setGrossReceipts(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
                <span>TDS Claimed under 26AS (₹)</span>
                <FieldTooltip
                  section="AdvanceTaxAndTDS"
                  title="Tax Deducted at Source"
                  rule="Total TDS credit claimed under Section 194J/194C as populated in Form 26AS / AIS."
                />
              </label>
              <input
                type="number"
                value={tdsClaimed}
                onChange={(e) => setTdsClaimed(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
              />
            </div>

            {/* Bank Details */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Primary Refund Bank Account
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-slate-400 block mb-0.5">IFSC Code</label>
                  <input
                    type="text"
                    value={ifsCode}
                    onChange={(e) => setIfsCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs font-mono text-slate-200 uppercase"
                    maxLength={11}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-400 block mb-0.5">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs font-mono text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Tax Regime Option */}
            <div className="border-t border-slate-800 pt-3">
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Tax Regime Selection</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOptedNewRegime(true)}
                  className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                    optedNewRegime
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  New Regime (115BAC)
                </button>
                <button
                  type="button"
                  onClick={() => setOptedNewRegime(false)}
                  className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                    !optedNewRegime
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Old Regime
                </button>
              </div>
            </div>

            {/* Statutory Defaults */}
            <div className="pt-2 text-xs text-slate-400 bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-slate-200 block border-b border-slate-800/80 pb-1">Statutory Defaults:</span>
              <ul className="space-y-1 text-[11px]">
                <li className="flex justify-between"><span className="text-slate-400">Assessment Year:</span> <span className="font-mono text-emerald-400">2027-28</span></li>
                <li className="flex justify-between"><span className="text-slate-400">Financial Year:</span> <span className="font-mono text-emerald-400">2026-27</span></li>
                <li className="flex justify-between"><span className="text-slate-400">Employer Category:</span> <span className="text-slate-200 font-medium">OTHERS</span></li>
                <li className="flex justify-between"><span className="text-slate-400">Filing Due Section:</span> <span className="text-slate-200 font-medium">139(1)</span></li>
              </ul>
            </div>
          </div>

          {/* Schema Compliance Status Card */}
          <div className={`p-4 rounded-2xl border ${
            complianceValidation.isValid
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {complianceValidation.isValid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <h4 className="text-xs font-bold uppercase tracking-wider">
                {complianceValidation.isValid ? 'Schema Validation Passed' : 'Schema Warnings Found'}
              </h4>
            </div>
            {complianceValidation.isValid ? (
              <p className="text-xs text-emerald-300/90 leading-relaxed">
                JSON payload passes all statutory format checks (PAN, IFSC, 44ADA 50% profit floor, AY 2027-28). Ready for direct upload to <span className="font-mono underline">incometax.gov.in</span>.
              </p>
            ) : (
              <ul className="space-y-1 text-xs text-amber-300">
                {complianceValidation.errors.map((err, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span>•</span> <span>{err}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* E-Filing Portal Upload Guide */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>e-Filing Upload Instructions</span>
              <a
                href="https://www.incometax.gov.in"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Portal</span> <ExternalLink className="w-3 h-3" />
              </a>
            </h4>
            <ol className="space-y-2 text-[11px] text-slate-300 list-decimal list-inside">
              <li>Click <strong className="text-emerald-400">Download JSON</strong> to save the official ITR-4 payload.</li>
              <li>Log in to <strong className="text-slate-100">incometax.gov.in</strong> using your PAN and credentials.</li>
              <li>Navigate to <strong className="text-slate-100">e-File &gt; Income Tax Returns &gt; File Income Tax Return</strong>.</li>
              <li>Select <strong className="text-slate-100">AY 2027-28</strong>, Mode: <strong className="text-slate-100">Offline (JSON Upload)</strong>, Form: <strong className="text-slate-100">ITR-4 (Sugam)</strong>.</li>
              <li>Upload the downloaded JSON file and submit after e-Verification via Aadhaar OTP.</li>
            </ol>
          </div>
        </div>

        {/* Right Column: Dynamic Section Guide OR Raw JSON */}
        <div className="lg:col-span-8 space-y-4">
          {activeTab === 'GUIDE' ? (
            /* SECTION GUIDE & INSTRUCTIONS VIEW */
            <div className="space-y-4">
              {filteredSections.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">No matching ITR-4 form sections found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try searching for different keywords like "44ADA", "Tax", "Rebate", "PAN", "139(1)", or select "All Sections".
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('ALL');
                    }}
                    className="mt-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl"
                  >
                    Clear Search Filters
                  </button>
                </div>
              ) : (
                filteredSections.map((sec) => (
                  <div
                    key={sec.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all rounded-2xl p-5 space-y-4 shadow-sm"
                  >
                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                            {sec.id}
                          </span>
                          <h3 className="text-sm font-bold text-slate-100">{sec.title}</h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{sec.description}</p>
                      </div>

                      <span className="text-[11px] font-semibold text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 self-start sm:self-auto shrink-0 flex items-center gap-1">
                        <Info className="w-3 h-3 text-emerald-400" /> {sec.statutoryRef}
                      </span>
                    </div>

                    {/* Mapped Fields Grid */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Auto-Mapped JSON Fields ({sec.fields.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {sec.fields.map((f, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1 hover:border-emerald-500/30 transition-all"
                          >
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-mono text-emerald-400 font-semibold text-[11px]">{f.jsonKey}</span>
                              <span className="font-bold text-slate-100 bg-slate-900 px-2 py-0.5 rounded text-[11px]">{String(f.value)}</span>
                            </div>
                            <p className="text-[11px] font-medium text-slate-300">{f.label}</p>
                            <p className="text-[10px] text-slate-400 leading-normal">{f.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section Instructions & Filing Rules */}
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                      <h4 className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                        Official Filing Instructions & Statutory Guidelines
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {sec.instructions.map((inst, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                            <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                            <span>{inst}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* RAW JSON PAYLOAD VIEW */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
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

              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-emerald-300 font-mono overflow-x-auto max-h-[580px]">
                {jsonString}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
