import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginModal } from './components/LoginModal';
import { Header } from './components/Header';
import { CalculatorTab } from './components/CalculatorTab';
import { CashSurveillanceTab } from './components/CashSurveillanceTab';
import { AdvanceTaxTab } from './components/AdvanceTaxTab';
import { ExportInvoiceTab } from './components/ExportInvoiceTab';
import { ITR4MapperTab } from './components/ITR4MapperTab';
import { ComprehensiveTaxTab } from './components/ComprehensiveTaxTab';
import { SchemaInspectorTab } from './components/SchemaInspectorTab';
import { AITaxAdvisorTab } from './components/AITaxAdvisorTab';

import { getTaxSchema } from './engine/schemaLoader';
import {
  EligibilityResult,
  PresumptiveTaxResult,
  CashSurveillanceResult,
} from './engine/types';

function MainAppContent() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('calculator');
  const [schemaMeta, setSchemaMeta] = useState(getTaxSchema().meta);

  const [evaluationData, setEvaluationData] = useState<{
    eligibility: EligibilityResult;
    cashSurveillance: CashSurveillanceResult;
    presumptive: PresumptiveTaxResult;
  } | null>(null);
  const [lastCalculatorInput, setLastCalculatorInput] = useState<any>(null);

  const handleRunEvaluation = async (inputData: any) => {
    setLastCalculatorInput(inputData);
    try {
      const res = await fetch('/api/tax/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success') {
          setEvaluationData(json.data);
        }
      }
    } catch (e) {
      console.error('Failed API evaluation:', e);
    }
  };

  useEffect(() => {
    setSchemaMeta(getTaxSchema().meta);
  }, [activeTab]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
        <LoginModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Header with Navigation & User Profile Badge */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        financialYear={schemaMeta.financialYear}
        assessmentYear={schemaMeta.assessmentYear}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'calculator' && (
          <CalculatorTab
            onEvaluate={handleRunEvaluation}
            evaluationData={evaluationData}
            onNavigateToAI={() => setActiveTab('ai-advisor')}
          />
        )}

        {activeTab === 'comprehensive' && <ComprehensiveTaxTab />}

        {activeTab === 'ai-advisor' && (
          <AITaxAdvisorTab calculatorInput={lastCalculatorInput} />
        )}

        {activeTab === 'surveillance' && <CashSurveillanceTab />}

        {activeTab === 'advancetax' && <AdvanceTaxTab />}

        {activeTab === 'invoice' && <ExportInvoiceTab />}

        {activeTab === 'itr4' && (
          <ITR4MapperTab
            presumptiveData={evaluationData?.presumptive}
          />
        )}

        {activeTab === 'rac' && <SchemaInspectorTab />}
      </main>

      {/* Statutory Compliance Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-400">
            Legal Compliance Disclaimer:
          </p>
          <p className="max-w-3xl mx-auto leading-relaxed text-[11px] text-slate-500">
            {schemaMeta.disclaimer}
          </p>
          <p className="text-[10px] text-slate-600">
            Powered by Rules-as-Code (RaC) Engine • Section 44AD & Section 44ADA Income Tax Utility
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

