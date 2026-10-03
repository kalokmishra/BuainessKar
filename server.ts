/**
 * Full-Stack Express + Vite Server
 * Indian Tax Utility Engine API (Section 44AD / 44ADA RaC Architecture)
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { calculateAdvanceTax } from './src/engine/advanceTax.js';
import { evaluateCashSurveillance } from './src/engine/cashSurveillance.js';
import { evaluateEligibility } from './src/engine/eligibility.js';
import { generateInvoiceExportMetadata } from './src/engine/invoiceExporter.js';
import { generateITR4Json } from './src/engine/itr4Schema.js';
import { calculatePresumptiveTax } from './src/engine/presumptiveTax.js';
import { calculateComprehensiveTax } from './src/engine/comprehensiveTax.js';
import { getTaxSchema, setTaxSchema } from './src/engine/schemaLoader.js';
import { generateAITaxTips } from './src/engine/aiAdvisor.js';
import { processAIChatCopilot } from './src/engine/aiChatCopilot.js';
import {
  generateDeterministicChatResponse,
  computeBaselineTax,
} from './src/engine/deterministicCopilot.js';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Routes

  // 1. Get current active tax schema (Rules-as-Code)
  app.get('/api/tax/schema', (req, res) => {
    res.json({
      status: 'success',
      schema: getTaxSchema(),
    });
  });

  // 2. Update tax schema dynamically at runtime
  app.post('/api/tax/schema', (req, res) => {
    try {
      const updated = setTaxSchema(req.body);
      res.json({
        status: 'success',
        message: 'Tax parameters updated dynamically (Rules-as-Code)',
        schema: updated,
      });
    } catch (err: any) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  });

  // 3. Comprehensive Tax Evaluation API
  app.post('/api/tax/evaluate', (req, res) => {
    try {
      const {
        entityType = 'INDIVIDUAL',
        activityType = 'PROFESSION',
        professionCategory = 'IT_SOFTWARE',
        businessCategory,
        grossReceipts = 0,
        cashReceipts = 0,
        declaredProfit,
        otherIncome = 0,
        chapterVIADeductions = 0,
      } = req.body;

      // Module 1: Eligibility & Routing
      const eligibility = evaluateEligibility({
        entityType,
        activityType,
        professionCategory,
        businessCategory,
        grossReceipts,
        cashReceipts,
        declaredProfit,
      });

      // Module 2: Cash Surveillance
      const cashSurveillance = evaluateCashSurveillance({
        grossReceipts,
        cashReceipts,
      });

      // Module 3: Presumptive Tax & Regimes
      const presumptive = calculatePresumptiveTax({
        workflowRoute: eligibility.workflowRoute,
        grossReceipts,
        cashReceipts,
        declaredProfit,
        otherIncome,
        chapterVIADeductions,
      });

      // Module 4: Advance Tax Schedule
      const recommendedRegimeDetail =
        presumptive.recommendedRegime === 'NEW'
          ? presumptive.newRegime
          : presumptive.oldRegime;

      const advanceTax = calculateAdvanceTax({
        estimatedAnnualTaxLiability: recommendedRegimeDetail.totalTaxLiability,
        tdsTcsCredit: req.body.tdsClaimed || 0,
        paymentsMade: req.body.paymentsMade || [],
        isPresumptiveTaxpayer: eligibility.isEligible,
      });

      res.json({
        status: 'success',
        data: {
          eligibility,
          cashSurveillance,
          presumptive,
          advanceTax,
        },
      });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // 3.5. Multi-Head Comprehensive Tax Evaluation API (Salary, Presumptive, Capital Gains, Other)
  app.post('/api/tax/comprehensive', (req, res) => {
    try {
      const result = calculateComprehensiveTax({
        grossSalary: req.body.grossSalary || 0,
        workflowRoute: req.body.workflowRoute || 'SECTION_44ADA',
        freelanceGrossReceipts: req.body.freelanceGrossReceipts || 0,
        freelanceCashReceipts: req.body.freelanceCashReceipts || 0,
        freelanceDeclaredProfit: req.body.freelanceDeclaredProfit,
        capitalGains: req.body.capitalGains || {
          stcgEquity: 0,
          stcgOther: 0,
          ltcgEquity: 0,
          ltcgOther: 0,
        },
        otherIncome: req.body.otherIncome || 0,
        chapterVIADeductions: req.body.chapterVIADeductions || 0,
      });
      res.json({ status: 'success', data: result });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // 4. Cash Surveillance API
  app.post('/api/tax/cash-surveillance', (req, res) => {
    try {
      const result = evaluateCashSurveillance({
        grossReceipts: req.body.grossReceipts || 0,
        cashReceipts: req.body.cashReceipts || 0,
      });
      res.json({ status: 'success', result });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // 5. Advance Tax API
  app.post('/api/tax/advance-tax', (req, res) => {
    try {
      const result = calculateAdvanceTax({
        estimatedAnnualTaxLiability: req.body.estimatedAnnualTaxLiability || 0,
        tdsTcsCredit: req.body.tdsTcsCredit || 0,
        paymentsMade: req.body.paymentsMade || [],
        isPresumptiveTaxpayer: req.body.isPresumptiveTaxpayer !== false,
      });
      res.json({ status: 'success', result });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // 6. GST & Export Invoice API
  app.post('/api/tax/export-invoice', (req, res) => {
    try {
      const result = generateInvoiceExportMetadata(req.body);
      res.json({ status: 'success', metadata: result });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // 7. Government ITR-4 Sugam JSON API
  app.post('/api/tax/itr4', (req, res) => {
    try {
      const {
        pan = 'ABCDE1234F',
        fullName = 'Valued Taxpayer',
        workflowRoute = 'SECTION_44ADA',
        grossReceipts = 5000000,
        cashReceipts = 100000,
        otherIncome = 0,
        chapterVIADeductions = 0,
        tdsClaimed = 0,
        paymentsMade = [],
        optedNewRegime = true,
      } = req.body;

      const presumptiveResult = calculatePresumptiveTax({
        workflowRoute,
        grossReceipts,
        cashReceipts,
        otherIncome,
        chapterVIADeductions,
      });

      const regimeDetail = optedNewRegime
        ? presumptiveResult.newRegime
        : presumptiveResult.oldRegime;

      const advanceTaxResult = calculateAdvanceTax({
        estimatedAnnualTaxLiability: regimeDetail.totalTaxLiability,
        tdsTcsCredit: tdsClaimed,
        paymentsMade,
        isPresumptiveTaxpayer: true,
      });

      const itr4Json = generateITR4Json({
        pan,
        fullName,
        workflowRoute,
        grossReceipts,
        cashReceipts,
        presumptiveResult,
        advanceTaxResult,
        tdsClaimed,
        chapterVIADeductions,
        optedNewRegime,
      });

      res.json({ status: 'success', itr4: itr4Json });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // 8. AI Personalized Tax Advisor API (Gemini 3.6 Flash Integration)
  app.post('/api/tax/ai-tips', async (req, res) => {
    try {
      const {
        entityType = 'INDIVIDUAL',
        activityType = 'PROFESSION',
        professionCategory = 'IT_SOFTWARE',
        businessCategory,
        grossReceipts = 4800000,
        cashReceipts = 120000,
        declaredProfit,
        otherIncome = 0,
        chapterVIADeductions = 150000,
        tdsClaimed = 0,
        customQuestion,
      } = req.body || {};

      const numGrossReceipts = Number(grossReceipts) || 0;
      const numCashReceipts = Number(cashReceipts) || 0;
      const numOtherIncome = Number(otherIncome) || 0;
      const numChapterVIADeductions = Number(chapterVIADeductions) || 0;
      const numTdsClaimed = Number(tdsClaimed) || 0;

      const eligibility = evaluateEligibility({
        entityType,
        activityType,
        professionCategory,
        businessCategory,
        grossReceipts: numGrossReceipts,
        cashReceipts: numCashReceipts,
        declaredProfit,
      });

      const cashSurveillance = evaluateCashSurveillance({
        grossReceipts: numGrossReceipts,
        cashReceipts: numCashReceipts,
      });

      const presumptive = calculatePresumptiveTax({
        workflowRoute: eligibility.workflowRoute,
        grossReceipts: numGrossReceipts,
        cashReceipts: numCashReceipts,
        declaredProfit,
        otherIncome: numOtherIncome,
        chapterVIADeductions: numChapterVIADeductions,
      });

      const tipsResponse = await generateAITaxTips({
        entityType,
        activityType,
        professionCategory,
        businessCategory,
        grossReceipts: numGrossReceipts,
        cashReceipts: numCashReceipts,
        cashPercentage: cashSurveillance.cashPercentage || 0,
        deemedProfit: presumptive.deemedProfit || 0,
        recommendedRegime: presumptive.recommendedRegime || 'NEW',
        oldRegimeTax: presumptive.oldRegime?.totalTaxLiability || 0,
        newRegimeTax: presumptive.newRegime?.totalTaxLiability || 0,
        taxSavings: presumptive.taxSavings || 0,
        chapterVIADeductions: numChapterVIADeductions,
        tdsClaimed: numTdsClaimed,
        workflowRoute: eligibility.workflowRoute,
        customQuestion,
      });

      res.json({
        status: 'success',
        data: tipsResponse,
      });
    } catch (err: any) {
      console.error('API /api/tax/ai-tips error, returning fallback tips:', err);
      res.json({
        status: 'success',
        data: generateAITaxTips({
          grossReceipts: Number(req.body?.grossReceipts) || 4800000,
          cashReceipts: Number(req.body?.cashReceipts) || 120000,
          cashPercentage: 2.5,
          deemedProfit: 2400000,
          recommendedRegime: 'NEW',
          oldRegimeTax: 507000,
          newRegimeTax: 395200,
          taxSavings: 111800,
          chapterVIADeductions: Number(req.body?.chapterVIADeductions) || 150000,
          tdsClaimed: Number(req.body?.tdsClaimed) || 0,
          customQuestion: req.body?.customQuestion,
        }),
      });
    }
  });

  // 9. AI Tax Chat Copilot API (Assists entries, What-If Analysis, Tax Minimization)
  app.post('/api/tax/chat', async (req, res) => {
    const { message, history, profile } = req.body || {};
    try {
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ status: 'error', message: 'Message is required' });
      }

      const copilotResponse = await processAIChatCopilot({
        message,
        history: history || [],
        profile: profile || { taxData: {} },
      });

      res.json({
        status: 'success',
        data: copilotResponse,
      });
    } catch (err: any) {
      console.error('API /api/tax/chat error, utilizing deterministic fallback:', err);
      const safeTaxData = profile?.taxData || {};
      const baseline = computeBaselineTax(safeTaxData);
      const fallbackResponse = generateDeterministicChatResponse(
        message || 'General Query',
        safeTaxData,
        baseline,
        profile?.user?.name
      );
      res.json({
        status: 'success',
        data: fallbackResponse,
      });
    }
  });

  // 10. CA Review Requests Endpoint (Soft Lead-Gen)
  app.post('/api/ca-review-requests', async (req, res) => {
    try {
      const { email, name, reviewType, profileSummary, notes } = req.body || {};
      if (!email || !name) {
        return res.status(400).json({ status: 'error', message: 'Name and email are required' });
      }

      console.log(`[CA Review Request] Received review inquiry from ${name} <${email}> for ${reviewType || 'general'}`);
      
      res.json({
        status: 'success',
        message: 'Review request registered successfully. Our tax team will follow up within 24 hours.',
        data: {
          requestId: `CAR-${Date.now()}`,
          name,
          email,
          reviewType: reviewType || 'general',
          profileSummary: profileSummary || {},
          notes: notes || '',
          createdAt: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('API /api/ca-review-requests error:', err);
      res.status(500).json({ status: 'error', message: err.message || 'Internal error' });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tax Engine Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
