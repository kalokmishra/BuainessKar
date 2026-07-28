import React, { useState, useEffect } from 'react';
import {
  Calculator,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Info,
  Bookmark,
  History,
  Save,
  Trash2,
  Clock,
  RotateCcw,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
} from 'lucide-react';
import {
  EligibilityResult,
  PresumptiveTaxResult,
  CashSurveillanceResult,
  EntityType,
  ProfessionCategory,
  BusinessCategory,
} from '../engine/types';
import { generateTaxCalculationPdf } from '../utils/pdfExporter';
import { generateITR4Json } from '../engine/itr4Schema';
import { calculateAdvanceTax } from '../engine/advanceTax';

interface SavedCalculation {
  id: string;
  timestamp: string;
  title: string;
  inputs: {
    entityType: EntityType;
    activityType: 'PROFESSION' | 'BUSINESS';
    professionCategory: ProfessionCategory;
    businessCategory: BusinessCategory;
    grossReceipts: number;
    cashReceipts: number;
    declaredProfit?: string;
    otherIncome: number;
    chapterVIADeductions: number;
  };
  summary: {
    isEligible: boolean;
    workflowRoute: string;
    deemedProfit: number;
    recommendedRegime: 'NEW' | 'OLD';
    newRegimeTax: number;
    oldRegimeTax: number;
    taxSavings: number;
  };
}

interface CalculatorTabProps {
  onEvaluate: (data: any) => void;
  evaluationData: {
    eligibility: EligibilityResult;
    cashSurveillance: CashSurveillanceResult;
    presumptive: PresumptiveTaxResult;
  } | null;
  onNavigateToAI?: () => void;
}

const LOCAL_STORAGE_KEY = 'tax_engine_saved_calculations';

export const CalculatorTab: React.FC<CalculatorTabProps> = ({
  onEvaluate,
  evaluationData,
  onNavigateToAI,
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

  // Local storage state
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>(() => {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Error reading saved calculations from localStorage:', err);
      return [];
    }
  });

  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState<boolean>(false);
  const [scenarioTitle, setScenarioTitle] = useState<string>('');
  const [notificationMsg, setNotificationMsg] = useState<string>('');

  // Persist to localStorage whenever savedCalculations changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedCalculations));
    } catch (err) {
      console.error('Error persisting calculations to localStorage:', err);
    }
  }, [savedCalculations]);

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

  const triggerNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg('');
    }, 3500);
  };

  const handleSaveCurrentResult = () => {
    if (!evaluationData) return;

    const categoryText = activityType === 'PROFESSION' ? professionCategory : businessCategory;
    const defaultTitle = `${entityType} • ${categoryText.replace(/_/g, ' ')} • ${formatINR(grossReceipts)}`;

    const newRecord: SavedCalculation = {
      id: `calc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      title: (scenarioTitle || defaultTitle).trim(),
      inputs: {
        entityType,
        activityType,
        professionCategory,
        businessCategory,
        grossReceipts,
        cashReceipts,
        declaredProfit,
        otherIncome,
        chapterVIADeductions,
      },
      summary: {
        isEligible: eligibility?.isEligible ?? false,
        workflowRoute: eligibility?.workflowRoute || 'N/A',
        deemedProfit: presumptive?.deemedProfit || 0,
        recommendedRegime: presumptive?.recommendedRegime || 'NEW',
        newRegimeTax: presumptive?.newRegime?.totalTaxLiability || 0,
        oldRegimeTax: presumptive?.oldRegime?.totalTaxLiability || 0,
        taxSavings: presumptive?.taxSavings || 0,
      },
    };

    setSavedCalculations((prev) => [newRecord, ...prev]);
    setScenarioTitle('');
    setShowSaveModal(false);
    triggerNotification(`Calculation "${newRecord.title}" saved to local storage!`);
  };

  const handleLoadSavedResult = (item: SavedCalculation) => {
    setEntityType(item.inputs.entityType);
    setActivityType(item.inputs.activityType);
    if (item.inputs.professionCategory) setProfessionCategory(item.inputs.professionCategory);
    if (item.inputs.businessCategory) setBusinessCategory(item.inputs.businessCategory);
    setGrossReceipts(item.inputs.grossReceipts);
    setCashReceipts(item.inputs.cashReceipts);
    setDeclaredProfit(item.inputs.declaredProfit || '');
    setOtherIncome(item.inputs.otherIncome || 0);
    setChapterVIADeductions(item.inputs.chapterVIADeductions || 0);

    triggerNotification(`Loaded scenario: "${item.title}"`);
  };

  const handleDeleteSavedResult = (id: string, title: string) => {
    setSavedCalculations((prev) => prev.filter((calc) => calc.id !== id));
    triggerNotification(`Deleted calculation: "${title}"`);
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all saved calculation results?')) {
      setSavedCalculations([]);
      triggerNotification('All saved calculations cleared.');
    }
  };

  const handleExportPdf = () => {
    const categoryLabel = activityType === 'PROFESSION' 
      ? professionCategory.replace(/_/g, ' ') 
      : businessCategory.replace(/_/g, ' ');

    generateTaxCalculationPdf({
      entityType,
      activityType,
      categoryLabel,
      grossReceipts,
      cashReceipts,
      chapterVIADeductions,
      eligibility: eligibility || null,
      presumptive: presumptive || null,
    });

    triggerNotification('PDF Tax Report exported successfully!');
  };

  const handleExportITR4Json = () => {
    if (!presumptive) return;
    const adv = calculateAdvanceTax({
      estimatedAnnualTaxLiability:
        presumptive.recommendedRegime === 'NEW'
          ? presumptive.newRegime.totalTaxLiability
          : presumptive.oldRegime.totalTaxLiability,
      paymentsMade: [],
      isPresumptiveTaxpayer: true,
    });
    const itr4 = generateITR4Json({
      pan: 'ABCDE1234F',
      fullName: 'Valued Taxpayer',
      workflowRoute: eligibility?.workflowRoute || 'SECTION_44ADA',
      grossReceipts,
      cashReceipts,
      presumptiveResult: presumptive,
      advanceTaxResult: adv,
      tdsClaimed: 0,
      optedNewRegime: presumptive.recommendedRegime === 'NEW',
    });
    const jsonString = JSON.stringify(itr4, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ITR4_AY2027-28_ABCDE1234F.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerNotification('Official ITR-4 (Sugam) e-Filing JSON downloaded successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="bg-emerald-900/60 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{notificationMsg}</span>
          </div>
          <button
            onClick={() => setNotificationMsg('')}
            className="text-emerald-300 hover:text-white p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Intro banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400 mt-0.5">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Presumptive Tax Eligibility & Regime Selector
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Evaluates Section 44ADA (Professional 50%) and Section 44AD (Business 6%/8%) rules, cash turnover limits (₹50L / ₹75L / ₹2Cr / ₹3Cr), and compares Old vs New Tax Regime.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 font-semibold px-3 py-2 rounded-xl text-xs transition-all shadow-sm"
              title="Export current calculation result to a formatted PDF document"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-2 rounded-xl text-xs transition-all shadow-sm"
              title="Save current calculation to browser local storage"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save Result</span>
            </button>
            <button
              onClick={() => setShowHistoryPanel((prev) => !prev)}
              className={`flex items-center gap-1.5 border px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                showHistoryPanel
                  ? 'bg-slate-800 border-emerald-500 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5 text-emerald-400" />
              <span>Saved History ({savedCalculations.length})</span>
              {showHistoryPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Save Scenario Modal / Form */}
      {showSaveModal && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 text-white space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              Save Current Calculation Result
            </h3>
            <button
              onClick={() => setShowSaveModal(false)}
              className="text-slate-400 hover:text-white p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Save these calculation parameters and tax regime evaluation to your browser's local storage so you can retrieve or compare them later.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={scenarioTitle}
              onChange={(e) => setScenarioTitle(e.target.value)}
              placeholder={`Scenario title (e.g. ${entityType} - ${activityType === 'PROFESSION' ? professionCategory : businessCategory} - ${formatINR(grossReceipts)})`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleSaveCurrentResult}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        </div>
      )}

      {/* Saved History Panel */}
      {showHistoryPanel && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-white">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Saved Calculations History ({savedCalculations.length})
              </h3>
            </div>
            {savedCalculations.length > 0 && (
              <button
                onClick={handleClearAllHistory}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
          </div>

          {savedCalculations.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
              <p>No saved calculation results in local storage yet.</p>
              <p className="mt-1 text-slate-600">
                Click "Save Result" above to save your calculation scenarios.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedCalculations.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-3 text-xs flex flex-col justify-between transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-slate-100 truncate block text-xs" title={item.title}>
                        {item.title}
                      </span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0 font-medium">
                        {item.summary.recommendedRegime} Regime
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{item.timestamp}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-900 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Gross Turnover</span>
                        <span className="font-semibold text-slate-200">
                          {formatINR(item.inputs.grossReceipts)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Deemed Profit</span>
                        <span className="font-semibold text-emerald-400">
                          {formatINR(item.summary.deemedProfit)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Recommended Tax</span>
                        <span className="font-semibold text-slate-200">
                          {formatINR(
                            item.summary.recommendedRegime === 'NEW'
                              ? item.summary.newRegimeTax
                              : item.summary.oldRegimeTax
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Net Savings</span>
                        <span className="font-semibold text-emerald-400">
                          {formatINR(item.summary.taxSavings)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-900">
                    <button
                      onClick={() => handleLoadSavedResult(item)}
                      className="flex-1 bg-slate-900 hover:bg-emerald-950/50 hover:text-emerald-300 text-slate-200 border border-slate-800 hover:border-emerald-500/40 py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all text-[11px]"
                    >
                      <RotateCcw className="w-3 h-3 text-emerald-400" />
                      <span>Load into Calculator</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSavedResult(item.id, item.title)}
                      className="text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 p-1.5 rounded-lg transition-colors border border-transparent hover:border-rose-900/50"
                      title="Delete from local storage"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span>Presumptive Deemed Income</span>
                  <span className="text-emerald-400 lowercase font-normal">({presumptive.presumptiveRateAppliedText})</span>
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportITR4Json}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all"
                    title="Export e-Filing JSON for Income Tax Portal"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export ITR-4 JSON</span>
                  </button>
                  <button
                    onClick={handleExportPdf}
                    className="text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all"
                    title="Download PDF report for current computation"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download PDF Report</span>
                  </button>
                </div>
              </div>

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
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
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

                {onNavigateToAI && (
                  <button
                    onClick={onNavigateToAI}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm shrink-0 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Get Tax Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
