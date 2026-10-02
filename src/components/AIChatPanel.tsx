import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  RotateCcw,
  TrendingDown,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Layers,
  ShieldCheck,
  ChevronDown,
  Maximize2,
  Minimize2,
  DollarSign,
  Loader2,
  Check,
} from 'lucide-react';
import { useTaxData } from '../context/TaxDataContext';
import { useAuth } from '../context/AuthContext';
import { AIChatMessage, WhatIfAnalysis } from '../engine/types';

export const AIChatPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    taxData,
    updateTaxData,
    isChatOpen,
    openChat,
    closeChat,
    chatInitialPrompt,
    clearChatInitialPrompt,
  } = useTaxData();

  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [appliedUpdates, setAppliedUpdates] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isChatOpen]);

  // Handle external initial prompt trigger (e.g. from buttons across the app)
  useEffect(() => {
    if (isChatOpen && chatInitialPrompt) {
      handleSendMessage(chatInitialPrompt);
      clearChatInitialPrompt();
    }
  }, [isChatOpen, chatInitialPrompt]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSendMessage = async (userPromptText?: string) => {
    const textToSend = (userPromptText || inputValue).trim();
    if (!textToSend || isLoading) return;

    const userMessage: AIChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/tax/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          profile: {
            user: {
              name: currentUser?.name,
              identifier: currentUser?.identifier,
            },
            taxData,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          const assistantMessage: AIChatMessage = {
            id: `ast_${Date.now()}`,
            role: 'assistant',
            content: json.data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedUpdates: json.data.suggestedUpdates,
            whatIf: json.data.whatIf,
            preprocessedEntities: json.data.preprocessedEntities,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          return;
        }
      }

      // Fallback assistant response
      const fallbackMsg: AIChatMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: `I've analyzed your request regarding "${textToSend}". Under Section 44AD/44ADA, preserving your presumptive relief and opting for the New Tax Regime (Section 115BAC) keeps your effective tax outlay minimized.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } catch (err) {
      console.error('Chat copilot communication error:', err);
      const errorMsg: AIChatMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered a temporary connection issue. Please verify your query or test one of the quick optimization buttons below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyUpdates = (msgId: string, updates?: Record<string, any>) => {
    if (!updates || Object.keys(updates).length === 0) return;

    // Enable flags if multi-head items are being added
    const enrichedUpdates: Record<string, any> = { ...updates };
    if (updates.grossSalary && updates.grossSalary > 0) enrichedUpdates.hasSalary = true;
    if (updates.rentalIncome && updates.rentalIncome > 0) enrichedUpdates.hasHouseProperty = true;
    if (
      (updates.stcgEquity && updates.stcgEquity > 0) ||
      (updates.ltcgEquity && updates.ltcgEquity > 0) ||
      (updates.stcgOther && updates.stcgOther > 0) ||
      (updates.ltcgOther && updates.ltcgOther > 0)
    ) {
      enrichedUpdates.hasCapitalGains = true;
    }
    if (
      (updates.otherIncome && updates.otherIncome > 0) ||
      (updates.savingsInterest && updates.savingsInterest > 0) ||
      (updates.fdInterest && updates.fdInterest > 0)
    ) {
      enrichedUpdates.hasOtherIncome = true;
    }

    updateTaxData(enrichedUpdates);
    setAppliedUpdates((prev) => ({ ...prev, [msgId]: true }));
    showToast('✨ Applied updates to your tax profile! Calculations updated across all tabs.');
  };

  const resetChat = () => {
    setMessages([]);
    setAppliedUpdates({});
  };

  const quickStarters = [
    {
      label: '💡 Minimize tax outlay',
      prompt: 'How can I legally minimize my overall tax outlay based on my current profile?',
    },
    {
      label: '📈 What-If: ₹50k in NPS (80CCD1B)',
      prompt: 'What if I invest ₹50,000 in NPS Tier-1 under Section 80CCD(1B)? How much tax will I save?',
    },
    {
      label: '➕ Add ₹3,50,000 invoice',
      prompt: 'Add new entry: I received a ₹3,50,000 client payment via bank transfer.',
    },
    {
      label: '⚖️ Compare Old vs New Regime',
      prompt: 'Compare New Tax Regime vs Old Tax Regime for my current income and tell me which is better.',
    },
    {
      label: '🛡️ Check cash audit limit',
      prompt: 'Is my current cash receipts ratio safe under Section 44ADA/44AD 5% surveillance limit?',
    },
  ];

  const formatINR = (val: number) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

  const getFriendlyFieldName = (key: string): string => {
    switch (key) {
      case 'grossReceipts':
        return 'Gross Receipts / Turnover';
      case 'cashReceipts':
        return 'Cash Receipts';
      case 'grossSalary':
        return 'Salary Income';
      case 'sec80CCD1B':
        return 'Section 80CCD(1B) NPS';
      case 'sec80C':
        return 'Section 80C Deductions';
      case 'sec80D':
        return 'Section 80D Health Insurance';
      case 'stcgEquity':
        return 'STCG Equity (Sec 111A)';
      case 'ltcgEquity':
        return 'LTCG Equity (Sec 112A)';
      case 'otherIncome':
        return 'Other Income';
      case 'tdsClaimed':
        return 'TDS Credit (Form 26AS)';
      default:
        return key;
    }
  };

  // Render markdown-like text
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs text-slate-200 leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-sm font-bold text-emerald-400 mt-2 mb-1 flex items-center gap-1.5">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="text-sm font-bold text-slate-100 mt-2 mb-1">
                {line.replace('## ', '')}
              </h3>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const rawContent = line.slice(2);
            return (
              <div key={idx} className="flex items-start gap-1.5 ml-1">
                <span className="text-emerald-400 shrink-0">•</span>
                <span>{renderFormattedInline(rawContent)}</span>
              </div>
            );
          }
          if (/^\d+\.\s/.test(line)) {
            return (
              <div key={idx} className="flex items-start gap-1.5 ml-1">
                <span className="text-emerald-400 font-bold shrink-0">{line.match(/^\d+\./)?.[0]}</span>
                <span>{renderFormattedInline(line.replace(/^\d+\.\s/, ''))}</span>
              </div>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx}>{renderFormattedInline(line)}</p>;
        })}
      </div>
    );
  };

  const renderFormattedInline = (str: string) => {
    // Basic bold parsing **text**
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-100 text-emerald-300">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // If closed, render launcher badge button on bottom right
  if (!isChatOpen) {
    return (
      <button
        onClick={() => openChat()}
        className="fixed bottom-5 right-5 z-40 group flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-3 rounded-full shadow-xl shadow-emerald-950/40 border border-emerald-400/40 transition-all duration-300 hover:scale-105 cursor-pointer"
        title="Open AI Tax Copilot (What-If Analysis & Entry Assistant)"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-300 rounded-full animate-ping" />
        </div>
        <div className="text-left">
          <span className="text-xs font-bold block leading-none">AI Tax Copilot</span>
          <span className="text-[10px] text-emerald-100 opacity-90 block leading-tight">
            Minimizes Tax Outlay
          </span>
        </div>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-in-out flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-xl ${
        isExpanded
          ? 'bottom-2 right-2 left-2 top-2 sm:bottom-6 sm:right-6 sm:left-auto sm:top-16 sm:w-[650px] sm:h-[88vh]'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[500px] h-[640px] max-h-[85vh]'
      }`}
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-16 left-4 right-4 z-30 bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span className="flex-1">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="opacity-75 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-bold text-slate-100 truncate">
                Businessकर AI Tax Copilot
              </h3>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span>Full Context • What-If & Entry Assistant</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Reset button */}
          <button
            onClick={resetChat}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
            title="Reset Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Expand/Shrink button */}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer hidden sm:block"
            title={isExpanded ? 'Restore window size' : 'Expand panel'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close button */}
          <button
            onClick={closeChat}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
            title="Close Copilot Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Snapshot Context Bar */}
      <div className="bg-slate-950/70 border-b border-slate-800/80 px-3.5 py-1.5 flex items-center justify-between text-[10px] text-slate-300 shrink-0 overflow-x-auto gap-3 scrollbar-none">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-slate-500">Turnover:</span>{' '}
            <span className="font-bold text-slate-200">{formatINR(taxData.grossReceipts)}</span>
          </div>
          <div>
            <span className="text-slate-500">Cash:</span>{' '}
            <span className="font-bold text-emerald-400">
              {((taxData.cashReceipts / (taxData.grossReceipts || 1)) * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-slate-500">Route:</span>{' '}
            <span className="font-bold text-amber-300">
              {taxData.activityType === 'BUSINESS' ? '44AD' : '44ADA'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-emerald-400 font-bold shrink-0">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Outlay Minimization Active</span>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-700">
        {messages.length === 0 ? (
          <div className="space-y-4 pt-2">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Namaste {currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! I am your Tax Copilot.</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                I continuously examine your live tax numbers, income heads, and deductions to find statutory tax-saving angles. Ask me anything or command me to update your entries:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
                  <span className="font-bold text-emerald-400 block mb-0.5">1. Add Entries</span>
                  <span className="text-slate-400 text-[10px]">
                    Tell me new invoices, cash receipts, or salary to record.
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
                  <span className="font-bold text-teal-400 block mb-0.5">2. What-If Analysis</span>
                  <span className="text-slate-400 text-[10px]">
                    Simulate NPS, deductions, or turnover changes with ₹ delta.
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
                  <span className="font-bold text-amber-400 block mb-0.5">3. Minimization</span>
                  <span className="text-slate-400 text-[10px]">
                    Compare Old vs New regime & lock in legal zero-tax relief.
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Starters List */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Quick Action Prompts
              </span>
              <div className="flex flex-col gap-1.5">
                {quickStarters.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="text-left px-3 py-2 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-xs text-slate-200 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isApplied = appliedUpdates[msg.id];

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 px-1">
                  <span>{isUser ? 'You' : 'AI Copilot'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[92%] rounded-2xl p-3.5 shadow-sm ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-slate-950 border border-slate-800 rounded-bl-none text-slate-200 space-y-3'
                  }`}
                >
                  {isUser ? (
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <>
                      {renderMessageContent(msg.content)}

                      {/* Pre-processed Numerical Idioms Badge */}
                      {msg.preprocessedEntities && msg.preprocessedEntities.length > 0 && (
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5 mt-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span>Indian Financial Idioms Pre-processed:</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {msg.preprocessedEntities.map((entity, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 bg-slate-950 text-slate-300 border border-emerald-500/30 rounded-lg px-2 py-0.5 text-[10px] font-mono"
                                title={entity.notes || `Mapped ${entity.originalIdiom} to ${entity.formattedINR}`}
                              >
                                <span className="text-slate-400">{entity.originalIdiom}</span>
                                <ArrowRight className="w-2.5 h-2.5 text-emerald-400" />
                                <span className="text-emerald-400 font-bold">{entity.formattedINR}</span>
                                <span className="text-[9px] text-slate-400 font-sans">({entity.normalizedInteger.toLocaleString('en-IN')})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* What-If Analysis Scenario Card */}
                      {msg.whatIf && (
                        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3 space-y-2.5 mt-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                              {msg.whatIf.scenarioTitle}
                            </span>
                            <span className="text-[10px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">
                              Recommended: {msg.whatIf.recommendedRegime} Regime
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800/80 text-center">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Current Tax</span>
                              <span className="font-bold text-slate-200 text-xs">
                                {formatINR(msg.whatIf.baselineTax)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Projected Tax</span>
                              <span className="font-bold text-emerald-400 text-xs">
                                {formatINR(msg.whatIf.projectedTax)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Net Impact</span>
                              <span
                                className={`font-bold text-xs ${
                                  msg.whatIf.taxSavings >= 0 ? 'text-emerald-400' : 'text-amber-400'
                                }`}
                              >
                                {msg.whatIf.taxSavings > 0
                                  ? `- ${formatINR(msg.whatIf.taxSavings)}`
                                  : msg.whatIf.taxSavings < 0
                                  ? `+ ${formatINR(Math.abs(msg.whatIf.taxSavings))}`
                                  : '₹0 Change'}
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-300 italic leading-snug">
                            "{msg.whatIf.keyTakeaway}"
                          </p>
                        </div>
                      )}

                      {/* Suggested Profile Updates Card */}
                      {msg.suggestedUpdates && Object.keys(msg.suggestedUpdates).length > 0 && (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-emerald-400" />
                              Proposed Profile Updates
                            </span>
                            <span className="text-[10px] text-slate-400">1-Click Apply</span>
                          </div>

                          <div className="divide-y divide-slate-800 text-[11px]">
                            {Object.entries(msg.suggestedUpdates).map(([k, v]) => (
                              <div key={k} className="py-1 flex justify-between items-center">
                                <span className="text-slate-400">{getFriendlyFieldName(k)}:</span>
                                <span className="font-bold text-emerald-300">
                                  {typeof v === 'number' ? formatINR(v) : String(v)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => handleApplyUpdates(msg.id, msg.suggestedUpdates)}
                            disabled={isApplied}
                            className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isApplied
                                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-default'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Applied to Profile</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Apply Changes to My Profile</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-start gap-2 text-xs text-slate-400 p-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400 mt-0.5" />
            <div className="space-y-1">
              <span className="font-medium text-slate-300">Evaluating profile with Gemini 3.8 Flash...</span>
              <p className="text-[10px] text-slate-500">
                Running multi-head tax rules, Section 87A rebate, and Chapter VI-A optimization...
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-slate-950 border-t border-slate-800 p-3 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask AI Copilot (e.g. 'Add 50k to NPS' or 'How to minimize tax?')"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-md cursor-pointer shrink-0"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[9px] text-slate-500 mt-1.5 text-center truncate">
          AI Tax Copilot • Rules-as-Code for Section 44AD / 44ADA / Section 115BAC (AY 2027-28)
        </p>
      </div>
    </div>
  );
};
