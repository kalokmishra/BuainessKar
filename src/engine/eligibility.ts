/**
 * Day 1 Core Engine - Module 1: Eligibility & Routing Engine
 * Evaluates entity eligibility, cash thresholds, and routes to 44ADA, 44AD, or Section 44AB Tax Audit.
 */

import { getTaxSchema } from './schemaLoader.js';
import {
  EligibilityInput,
  EligibilityResult,
  WorkflowRoute,
} from './types.js';

/**
 * Evaluates taxpayer eligibility under Section 44ADA and Section 44AD
 */
export function evaluateEligibility(input: EligibilityInput): EligibilityResult {
  const schema = getTaxSchema();
  const disqualificationReasons: string[] = [];

  const gross = Math.max(0, input.grossReceipts || 0);
  const cash = Math.max(0, input.cashReceipts || 0);
  const cashPercentage = gross > 0 ? (cash / gross) * 100 : 0;

  // 1. Entity Type Validation
  const eligibleEntities = ['INDIVIDUAL', 'HUF', 'PARTNERSHIP'];
  const isEligibleEntity = eligibleEntities.includes(input.entityType);

  if (!isEligibleEntity) {
    disqualificationReasons.push(
      `Entity type '${input.entityType}' is not eligible for presumptive tax under Sec 44AD/44ADA. (LLPs, Companies & AOPs are strictly excluded by law).`
    );
  }

  // 2. Activity & Sub-category Check
  let intendedSection: '44ADA' | '44AD' = '44ADA';

  if (input.activityType === 'PROFESSION') {
    intendedSection = '44ADA';
    if (input.professionCategory) {
      const isEligibleProf = schema.section44ADA.eligibleProfessions.includes(
        input.professionCategory
      );
      if (!isEligibleProf) {
        disqualificationReasons.push(
          `Profession '${input.professionCategory}' is not among the specified professions notified under Section 44ADA.`
        );
      }
    }
  } else {
    intendedSection = '44AD';
    if (input.businessCategory) {
      const isIneligibleBiz = schema.section44AD.ineligibleBusinesses.includes(
        input.businessCategory
      );
      if (isIneligibleBiz) {
        disqualificationReasons.push(
          `Business category '${input.businessCategory}' (Commission/Brokerage, Agency, or Goods Transport 44AE) is strictly prohibited from claiming Section 44AD.`
        );
      }
    }
  }

  // 3. Cash Threshold & Applicable Turnover Limits Evaluation
  const maxCashPermitted = schema.cashSurveillance.warningUpperThreshold; // 5.0%
  const isExtendedLimitApplied = cashPercentage <= maxCashPermitted;

  let applicableTurnoverLimit = 0;
  if (intendedSection === '44ADA') {
    applicableTurnoverLimit = isExtendedLimitApplied
      ? schema.section44ADA.extendedDigitalLimit // ₹75 Lakhs
      : schema.section44ADA.standardLimit; // ₹50 Lakhs
  } else {
    applicableTurnoverLimit = isExtendedLimitApplied
      ? schema.section44AD.extendedDigitalLimit // ₹3 Crore
      : schema.section44AD.standardLimit; // ₹2 Crore
  }

  // 4. Gross Turnover Breach Check
  const isTurnoverExceeded = gross > applicableTurnoverLimit;
  if (isTurnoverExceeded) {
    disqualificationReasons.push(
      `Gross receipts (₹${gross.toLocaleString('en-IN')}) exceed the applicable Section ${intendedSection} statutory limit of ₹${applicableTurnoverLimit.toLocaleString('en-IN')}.`
    );
  }

  // 5. Lower Profit Declaration Check (Triggers 44AB Tax Audit)
  let isClaimingLowerProfit = false;
  if (input.declaredProfit !== undefined && input.declaredProfit !== null) {
    let minimumStatutoryProfit = 0;
    if (intendedSection === '44ADA') {
      minimumStatutoryProfit = gross * schema.section44ADA.presumptiveProfitRate; // 50%
    } else {
      const digitalReceipts = Math.max(0, gross - cash);
      minimumStatutoryProfit =
        digitalReceipts * schema.section44AD.digitalProfitRate +
        cash * schema.section44AD.cashProfitRate;
    }

    if (input.declaredProfit < minimumStatutoryProfit) {
      isClaimingLowerProfit = true;
      disqualificationReasons.push(
        `Declared profit (₹${input.declaredProfit.toLocaleString('en-IN')}) is less than statutory minimum presumptive profit (₹${minimumStatutoryProfit.toLocaleString('en-IN')}). Claiming lower profits requires mandatory books of accounts audit under Section 44AB.`
      );
    }
  }

  // 6. Workflow Routing
  const isEligible = disqualificationReasons.length === 0;
  let workflowRoute: WorkflowRoute = 'STANDARD_AUDIT_REQUIRED';
  let applicableSection: '44ADA' | '44AD' | '44AB_AUDIT' = '44AB_AUDIT';

  if (isEligible) {
    workflowRoute = intendedSection === '44ADA' ? 'SECTION_44ADA' : 'SECTION_44AD';
    applicableSection = intendedSection;
  } else {
    workflowRoute = 'STANDARD_AUDIT_REQUIRED';
    applicableSection = '44AB_AUDIT';
  }

  // Recommendation Text
  let recommendation = '';
  if (isEligible) {
    recommendation = `Eligible for Section ${intendedSection}. Benefitting from simplified books of accounts and ${
      isExtendedLimitApplied ? 'extended digital limit' : 'standard limit'
    }.`;
  } else if (isTurnoverExceeded) {
    recommendation = `Gross turnover exceeds Section ${intendedSection} ceiling. Regular tax audit under Section 44AB is mandatory with complete ITR-3 filing.`;
  } else if (!isEligibleEntity) {
    recommendation = `Entity format '${input.entityType}' cannot file under presumptive scheme. Must file standard business/professional returns with balance sheet.`;
  } else {
    recommendation = `Mandatory tax audit under Section 44AB required due to statutory non-compliance or lower profit claims.`;
  }

  return {
    isEligible,
    workflowRoute,
    applicableSection,
    applicableTurnoverLimit,
    isExtendedLimitApplied,
    disqualificationReasons,
    recommendation,
  };
}
