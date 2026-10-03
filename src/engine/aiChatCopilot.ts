/**
 * AI Tax Chat Copilot Engine
 * Powered by Gemini 3.8 Flash (@google/genai)
 * 
 * Features:
 * 1. Pre-processes all colloquial Indian numerical idioms (50k, 5 lakhs, 1.5L, 2cr) into exact integers before calculations.
 * 2. Deep context awareness of user's complete profile, income heads, deductions, and tax state.
 * 3. Assists users in adding and updating entries (e.g. gross receipts, cash, salary, capital gains, 80C, 80D, 80CCD1B).
 * 4. Conducts What-If Analyses with live recalculation and scenario comparisons.
 * 5. Handles statutory exemptions such as Section 56(2)(x) for gifts from relatives.
 * 6. Always strategizes to minimize the user's legal tax outlay across New vs Old Tax Regimes.
 */

import { GoogleGenAI, Type } from '@google/genai';
import {
  AIChatCopilotResponse,
  PreprocessedNumericalEntity,
  WhatIfAnalysis,
} from './types.js';
import {
  extractIndianNumericalEntities,
  preprocessIndianNumericalIdioms,
  parseIndianAmount,
  formatINR,
} from './indianNumberIdioms.js';
import {
  computeBaselineTax,
  generateDeterministicChatResponse,
  TaxProfileContext,
} from './deterministicCopilot.js';

export {
  parseIndianAmount,
  extractIndianNumericalEntities,
  preprocessIndianNumericalIdioms,
  computeBaselineTax,
  generateDeterministicChatResponse,
};
export type { TaxProfileContext };

export interface AIChatRequestPayload {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  profile: TaxProfileContext;
}

/**
 * Main AI Copilot chat processor
 */
export async function processAIChatCopilot(
  payload: AIChatRequestPayload
): Promise<AIChatCopilotResponse> {
  const { message, history = [], profile } = payload;
  const taxData = profile.taxData || ({} as TaxProfileContext['taxData']);
  const baseline = computeBaselineTax(taxData);

  // STEP 0: MANDATORY NUMERICAL IDIOM PRE-PROCESSING STEP
  // Normalizes colloquial Indian expressions (e.g. '50k', '5 lakhs', '1.5 cr') into exact integers
  const preprocessed = preprocessIndianNumericalIdioms(message);

  const apiKey = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined;

  if (
    apiKey &&
    apiKey !== 'MY_GEMINI_API_KEY' &&
    typeof process !== 'undefined' &&
    !process.env?.VITEST &&
    process.env?.NODE_ENV !== 'test'
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

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          reply: {
            type: Type.STRING,
            description:
              'Crisp, highly helpful markdown advice detailing tax minimization steps, law citations (e.g. Sec 44AD/44ADA, 115BAC, 87A, 80C, 80CCD(1B), 56(2)(x), 211(1)(b)), and clear rationale.',
          },
          intent: {
            type: Type.STRING,
            description:
              'One of: ASSIST_ENTRY, WHAT_IF_ANALYSIS, TAX_MINIMIZATION, GENERAL_QUERY',
          },
          preprocessedEntities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                originalIdiom: { type: Type.STRING },
                normalizedInteger: { type: Type.NUMBER },
                formattedINR: { type: Type.STRING },
                notes: { type: Type.STRING },
              },
              required: ['originalIdiom', 'normalizedInteger', 'formattedINR'],
            },
            description:
              'Pre-processed mapping table showing every colloquial idiom from the user message mapped to exact integer rupee values.',
          },
          suggestedUpdates: {
            type: Type.OBJECT,
            description:
              'Key-value pairs matching TaxDataState fields to update or add to user profile (e.g. { grossReceipts: 5200000 } or { sec80CCD1B: 50000 }) if user requested an addition or what-if scenario. Do NOT add tax-free gifts from relatives to business receipts!',
            properties: {
              grossReceipts: { type: Type.NUMBER },
              cashReceipts: { type: Type.NUMBER },
              hasSalary: { type: Type.BOOLEAN },
              grossSalary: { type: Type.NUMBER },
              hasHouseProperty: { type: Type.BOOLEAN },
              rentalIncome: { type: Type.NUMBER },
              hasCapitalGains: { type: Type.BOOLEAN },
              stcgEquity: { type: Type.NUMBER },
              stcgOther: { type: Type.NUMBER },
              ltcgEquity: { type: Type.NUMBER },
              ltcgOther: { type: Type.NUMBER },
              hasOtherIncome: { type: Type.BOOLEAN },
              otherIncome: { type: Type.NUMBER },
              savingsInterest: { type: Type.NUMBER },
              fdInterest: { type: Type.NUMBER },
              sec80C: { type: Type.NUMBER },
              sec80D: { type: Type.NUMBER },
              sec80CCD1B: { type: Type.NUMBER },
              sec80TTA: { type: Type.NUMBER },
              tdsClaimed: { type: Type.NUMBER },
            },
          },
          whatIf: {
            type: Type.OBJECT,
            description:
              'Structured scenario comparison if performing what-if analysis or showing before/after tax outlay.',
            properties: {
              scenarioTitle: { type: Type.STRING },
              baselineTax: { type: Type.NUMBER },
              projectedTax: { type: Type.NUMBER },
              taxSavings: { type: Type.NUMBER },
              baselineRegime: { type: Type.STRING },
              recommendedRegime: { type: Type.STRING },
              effectiveRateBefore: { type: Type.NUMBER },
              effectiveRateAfter: { type: Type.NUMBER },
              keyTakeaway: { type: Type.STRING },
            },
            required: [
              'scenarioTitle',
              'baselineTax',
              'projectedTax',
              'taxSavings',
              'baselineRegime',
              'recommendedRegime',
              'keyTakeaway',
            ],
          },
          quickFollowUps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2 to 3 relevant follow-up prompts user can click next.',
          },
        },
        required: ['reply', 'intent'],
      };

      const systemInstruction = `
You are Businesskar's Chief Tax Strategist & AI Copilot for Indian taxpayers under Section 44AD / 44ADA / Section 115BAC (FY 2026-27, AY 2027-28).

================================================================================
CRITICAL STEP 0: MANDATORY NUMERICAL IDIOM PRE-PROCESSING STEP
================================================================================
All user queries undergo an explicit pre-processing step to map common Indian financial shorthand and numerical idioms into exact integer values before any calculation:
- "50k", "50 k", "50K", "50 hazar", "50 thousand" => Exactly 50,000 (Fifty Thousand Rupees, ₹50,000). CRITICAL: NEVER parse or consider this as ₹50!
- "5L", "5 lakh", "5 lakhs", "5 lac", "5 lacs" => Exactly 5,00,000 (Five Lakh Rupees, ₹5,00,000). CRITICAL: NEVER parse as ₹5 or 500!
- "1.5L", "1.5 lakh", "1.5 lakhs" => Exactly 1,50,000 (One Lakh Fifty Thousand Rupees, ₹1,50,000).
- "2cr", "2 cr", "2 crore", "2.5 crores" => Exactly 2,00,00,000 / 2,50,00,000 (Two Crore / 2.5 Crore Rupees).

PRE-PROCESSED NUMERICAL ENTITIES EXTRACTED FROM CURRENT MESSAGE:
${preprocessed.markdownMappingTable}

MANDATORY RULES FOR PRE-PROCESSED ENTITIES:
1. Always base all computations, tax analysis, and suggested updates on the exact integer numbers in the table above.
2. Return the preprocessed entities in the 'preprocessedEntities' field of your response so the user sees explicit confirmation.

================================================================================
STATUTORY GIFT EXEMPTIONS — SECTION 56(2)(x) OF INCOME TAX ACT
================================================================================
- Any sum of money received as a gift from a defined "relative" (Mother, Father, Spouse, Brother, Sister, Lineal ascendants/descendants) is 100% EXEMPT FROM INCOME TAX without any monetary ceiling.
- It is NOT business/professional turnover (under Section 44AD/44ADA) and NOT taxable under "Other Sources".
- If the user reports receiving money from their mother/father/spouse/relative (e.g., "i received 50k from my mother"):
  * Confirm that the amount is ₹50,000 (Fifty Thousand Rupees, not ₹50).
  * State clearly that under Section 56(2)(x), this is 100% TAX-FREE and adds ₹0 to their tax liability.
  * DO NOT add it to business turnover or gross receipts in 'suggestedUpdates'.
  * Advise maintaining banking records (UPI/NEFT/IMPS) as good practice.

================================================================================
YOUR CORE MANDATES
================================================================================
1. Always aim at minimizing the taxpayer's overall legal tax outlay.
2. Assist user in adding new entries or adjusting their tax profile (e.g. adding newly received invoices, adjusting cash turnover, adding salary, equity gains, deductions under Section 80C, 80D, 80CCD(1B) NPS).
   - When the user asks to add or record an entry, provide the exact updated values in 'suggestedUpdates' so they can apply it in 1-click!
3. Conduct What-If Analyses whenever asked or whenever a clear optimization is spotted:
   - Calculate baseline tax vs projected tax.
   - If projected tax is lower, taxSavings is positive (tax reduction).
   - Compare New Tax Regime (default) vs Old Tax Regime.
   - Highlight Section 87A rebate (zero tax up to ₹7,00,000 deemed income in New Regime).
   - Highlight Section 80CCD(1B) NPS ₹50,000 additional deduction in Old Regime.
   - Highlight Section 44AD 6% digital profit rate vs 8% cash rate.
   - Highlight keeping cash receipts below 5.0% to protect the extended ₹75 Lakh (44ADA) or ₹3 Crore (44AD) turnover ceiling.
   - Highlight single March 15 advance tax deadline under Section 211(1)(b) to eliminate Section 234C interest.

Active Taxpayer Profile Snapshot:
- Name: ${profile.user?.name || 'Valued Assessee'} (${profile.user?.identifier || 'Individual'})
- Gross Receipts / Turnover: ₹${(taxData.grossReceipts || 0).toLocaleString('en-IN')}
- Cash Receipts: ₹${(taxData.cashReceipts || 0).toLocaleString('en-IN')} (${baseline.cashSurveillance.cashPercentage.toFixed(1)}%)
- Profession / Business: ${taxData.activityType || 'PROFESSION'} (${taxData.professionCategory || taxData.businessCategory || 'IT_SOFTWARE'})
- Workflow Route: ${baseline.workflowRoute}
- Salary Income: ₹${(taxData.grossSalary || 0).toLocaleString('en-IN')}
- Capital Gains: STCG Equity ₹${(taxData.stcgEquity || 0).toLocaleString('en-IN')}, LTCG Equity ₹${(taxData.ltcgEquity || 0).toLocaleString('en-IN')}
- Deductions: 80C ₹${(taxData.sec80C || 0).toLocaleString('en-IN')}, 80D ₹${(taxData.sec80D || 0).toLocaleString('en-IN')}, 80CCD(1B) NPS ₹${(taxData.sec80CCD1B || 0).toLocaleString('en-IN')}
- Baseline Tax Liability: New Regime: ₹${baseline.result.newRegime.totalTaxLiability.toLocaleString('en-IN')} | Old Regime: ₹${baseline.result.oldRegime.totalTaxLiability.toLocaleString('en-IN')}
- Currently Recommended Regime: ${baseline.recommendedRegime} (Tax: ₹${baseline.minTax.toLocaleString('en-IN')})
`;

      const userMessageContent = preprocessed.entities.length > 0
        ? `${message}\n\n[System Pre-processor: Numerical idioms detected: ${preprocessed.entities.map(e => `"${e.originalIdiom}" = ${e.formattedINR} (${e.normalizedInteger})`).join(', ')}]`
        : message;

      const contents = [
        ...history.slice(-6).map((h) => ({
          role: h.role,
          parts: [{ text: h.content }],
        })),
        {
          role: 'user',
          parts: [{ text: userMessageContent }],
        },
      ];

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout (6.5s)')), 6500)
      );

      const response = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema,
          },
        }),
        timeoutPromise,
      ]);

      if (response.text) {
        const parsed = JSON.parse(response.text.trim()) as AIChatCopilotResponse;
        if (parsed && parsed.reply) {
          if (!parsed.preprocessedEntities || parsed.preprocessedEntities.length === 0) {
            parsed.preprocessedEntities = preprocessed.entities;
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Gemini 3.8 Flash chat copilot notice, utilizing deterministic engine:', err instanceof Error ? err.message : err);
    }
  }

  // Fallback deterministic rule engine (also used in vitest / offline)
  return generateDeterministicChatResponse(message, taxData, baseline, profile.user?.name);
}

