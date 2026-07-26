/**
 * AI Tax Advisor Module
 * Leverages Gemini API (gemini-3.6-flash) on the server to generate personalized,
 * actionable tax-saving strategies for Indian freelancers & businesses under Section 44AD / 44ADA.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { AITaxAdvisorResponse } from './types.js';

export interface AITaxAdvisorInput {
  entityType?: string;
  activityType?: string;
  professionCategory?: string;
  businessCategory?: string;
  grossReceipts: number;
  cashReceipts: number;
  cashPercentage: number;
  deemedProfit: number;
  recommendedRegime: 'NEW' | 'OLD';
  oldRegimeTax: number;
  newRegimeTax: number;
  taxSavings: number;
  chapterVIADeductions: number;
  tdsClaimed?: number;
  workflowRoute?: string;
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: 'Executive summary highlighting key tax savings opportunities.',
    },
    overallStrategy: {
      type: Type.STRING,
      description: 'High-level strategic narrative tailored for FY 2026-27.',
    },
    tips: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Short catchy title of tip' },
          category: {
            type: Type.STRING,
            description:
              'One of: REGIME_OPTIMIZATION, CASH_SURVEILLANCE, ADVANCE_TAX, DEDUCTIONS, GST_LUT, BUSINESS_EXPENSE',
          },
          recommendation: {
            type: Type.STRING,
            description: 'Actionable personalized tax-saving advice',
          },
          impact: { type: Type.STRING, description: 'Estimated savings or risk mitigated' },
          statutoryRef: { type: Type.STRING, description: 'Relevant Income Tax Act Section' },
        },
        required: ['title', 'category', 'recommendation', 'impact', 'statutoryRef'],
      },
    },
    actionChecklist: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Sequential step-by-step checklist to execute before March 31, 2027.',
    },
  },
  required: ['summary', 'overallStrategy', 'tips', 'actionChecklist'],
};

export async function generateAITaxTips(input: AITaxAdvisorInput): Promise<AITaxAdvisorResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (
    apiKey &&
    apiKey !== 'MY_GEMINI_API_KEY' &&
    !process.env.VITEST &&
    process.env.NODE_ENV !== 'test'
  ) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `
You are an expert Chartered Accountant (CA) and Indian Tax Consultant specializing in Section 44AD and Section 44ADA presumptive tax compliance for FY 2026-27 (Assessment Year 2027-28).

Analyze the taxpayer's profile and financial metrics:
- Entity Type: ${input.entityType || 'INDIVIDUAL'}
- Activity Type: ${input.activityType || 'PROFESSION'} (${input.professionCategory || input.businessCategory || 'GENERAL'})
- Gross Annual Receipts: ₹${input.grossReceipts.toLocaleString('en-IN')}
- Cash Receipts: ₹${input.cashReceipts.toLocaleString('en-IN')} (${input.cashPercentage.toFixed(2)}% of turnover)
- Calculated Deemed Profit: ₹${input.deemedProfit.toLocaleString('en-IN')}
- Recommended Tax Regime: ${input.recommendedRegime} Tax Regime
- Tax under New Regime: ₹${input.newRegimeTax.toLocaleString('en-IN')}
- Tax under Old Regime: ₹${input.oldRegimeTax.toLocaleString('en-IN')}
- Net Tax Savings via Recommended Regime: ₹${input.taxSavings.toLocaleString('en-IN')}
- Chapter VI-A Deductions Claimed: ₹${input.chapterVIADeductions.toLocaleString('en-IN')}
- TDS Claimed under 26AS: ₹${(input.tdsClaimed || 0).toLocaleString('en-IN')}
- Compliance Workflow Route: ${input.workflowRoute || 'SECTION_44ADA'}

Provide 4 to 6 highly practical, legal, and actionable tax-saving strategies specifically tailored to this taxpayer.
Consider:
1. Regime optimization (New vs Old) and Section 87A rebate dynamics (up to ₹7L in New Regime).
2. Cash surveillance limit (5.0%) discipline to protect extended turnover limits (₹75L under 44ADA / ₹3Cr under 44AD).
3. Section 211(1)(b) single March 15 advance tax payment privilege for presumptive taxpayers.
4. GST registration, LUT export filing for cross-border foreign client income (zero-rated export).
5. 26AS / AIS reconciliation for TDS credits.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a top-tier Indian tax consultant providing crisp, actionable, law-accurate tax advice for Indian freelancers and micro-enterprises under Section 44AD/44ADA.',
          temperature: 0.3,
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim()) as AITaxAdvisorResponse;
        return parsed;
      }
    } catch (err) {
      console.error('Gemini API call error, falling back to rule engine advisor:', err);
    }
  }

  // High-quality deterministic rule engine fallback if Gemini key is missing or call errors
  return generateFallbackTips(input);
}

function generateFallbackTips(input: AITaxAdvisorInput): AITaxAdvisorResponse {
  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;
  const tips: AITaxAdvisorResponse['tips'] = [];
  const actionChecklist: string[] = [];

  // Tip 1: Regime strategy
  if (input.recommendedRegime === 'NEW') {
    tips.push({
      title: 'Opt for New Tax Regime Default Benefit',
      category: 'REGIME_OPTIMIZATION',
      recommendation: `Your deemed income of ${formatINR(input.deemedProfit)} achieves lower overall tax under the New Tax Regime (${formatINR(input.newRegimeTax)}) compared to Old Regime (${formatINR(input.oldRegimeTax)}). Maintain election in ITR-4.`,
      impact: `Net savings of ${formatINR(input.taxSavings)} in tax outlay.`,
      statutoryRef: 'Section 115BAC(1A)',
    });
  } else {
    tips.push({
      title: 'Maximize Chapter VI-A Deductions in Old Regime',
      category: 'DEDUCTIONS',
      recommendation: `Your Chapter VI-A deductions (${formatINR(input.chapterVIADeductions)}) make the Old Regime preferable. Ensure Section 80C (₹1.5L), 80D (Health Insurance ₹25k-50k), and 80CCD(1B) NPS (₹50k) proofs are documented.`,
      impact: `Reduces taxable base and yields ${formatINR(input.taxSavings)} net savings over New Regime.`,
      statutoryRef: 'Chapter VI-A (80C, 80D, 80CCD)',
    });
  }

  // Tip 2: Cash threshold
  if (input.cashPercentage > 4.5) {
    tips.push({
      title: 'Reduce Cash Receipts below 5.0% Threshold',
      category: 'CASH_SURVEILLANCE',
      recommendation: `Your cash receipts stand at ${input.cashPercentage.toFixed(2)}%, approaching the statutory 5.0% limit. Transition cash clients to UPI, NEFT, or Razorpay to protect the extended limit (₹75 Lakhs under 44ADA / ₹3 Crores under 44AD).`,
      impact: 'Prevents mandatory Section 44AB tax audit requirement.',
      statutoryRef: 'Section 44ADA Proviso / Section 44AD Proviso',
    });
  } else {
    tips.push({
      title: 'Preserve Digital Payment Privilege',
      category: 'CASH_SURVEILLANCE',
      recommendation: `Your current cash receipts ratio is ${input.cashPercentage.toFixed(2)}% (well below 5.0%). This grants you extended turnover limits of up to ₹75 Lakhs (44ADA) or ₹3 Crores (44AD).`,
      impact: 'Secures high turnover ceiling without tax audit hassles.',
      statutoryRef: 'Section 44ADA(1) Proviso',
    });
  }

  // Tip 3: Advance tax privilege
  tips.push({
    title: 'Utilize Single March 15 Advance Tax Payment',
    category: 'ADVANCE_TAX',
    recommendation: 'As a presumptive taxpayer under Section 44AD/44ADA, you are exempt from Q1, Q2, and Q3 quarterly advance tax installments. Pay 100% of your net estimated tax on or before 15th March.',
    impact: 'Completely avoids Section 234C interest penalties for Q1-Q3.',
    statutoryRef: 'Section 211(1)(b) & Section 234C',
  });

  // Tip 4: GST LUT for exports
  if (input.grossReceipts > 2000000) {
    tips.push({
      title: 'File GST Letter of Undertaking (LUT) for Foreign Receipts',
      category: 'GST_LUT',
      recommendation: 'If serving overseas clients in foreign currency, ensure a valid LUT is submitted on the GST Portal prior to invoicing to export services at 0% IGST without blocking capital.',
      impact: 'Zero GST tax liability with instant compliance clearance.',
      statutoryRef: 'Section 16 IGST Act (Zero-Rated Exports)',
    });
  }

  actionChecklist.push(
    `Verify Form 26AS and AIS on the e-Filing portal for TDS credit matching (${formatINR(input.tdsClaimed || 0)}).`
  );
  actionChecklist.push(
    `Calculate single Advance Tax installment due by 15th March 2027 (${formatINR(Math.max(0, input.newRegimeTax - (input.tdsClaimed || 0)))} net).`
  );
  actionChecklist.push(
    `Ensure digital banking log for all receipts to maintain cash ratio at ${input.cashPercentage.toFixed(1)}%.`
  );
  actionChecklist.push('Generate and download ITR-4 JSON payload for filing on incometax.gov.in.');

  return {
    summary: `Based on your turnover of ${formatINR(input.grossReceipts)} and deemed profit of ${formatINR(input.deemedProfit)}, the ${input.recommendedRegime} Tax Regime provides optimal savings of ${formatINR(input.taxSavings)}.`,
    overallStrategy: `Your financial profile qualifies for Section 44ADA/44AD presumptive tax relief. By utilizing the ${input.recommendedRegime} regime and single March 15 advance tax payment privilege under Section 211(1)(b), you can minimize compliance overhead while keeping your effective tax rate at ${((input.newRegimeTax / input.grossReceipts) * 100).toFixed(1)}%.`,
    tips,
    actionChecklist,
  };
}
