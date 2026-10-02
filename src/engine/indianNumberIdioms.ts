/**
 * Indian Numerical Idioms Pre-processing Engine
 * 
 * Accurately parses and normalizes colloquial Indian numerical idioms, financial shorthand,
 * and currency notations commonly used by Indian taxpayers and freelancers:
 * - "50k" / "50 K" / "50 hazar" / "50 thousand" -> 50,000 (₹50,000)
 * - "5L" / "5 lakh" / "5 lakhs" / "5 lac" / "5 lacs" -> 500,000 (₹5,00,000)
 * - "1.5L" / "1.5 lakh" / "1.5 lacs" -> 150,000 (₹1,50,000)
 * - "2cr" / "2 cr" / "2 crore" / "2.5 crores" -> 20,000,000 (₹2,00,00,000)
 * - Word forms: "fifty thousand", "five lakhs", "one crore"
 * 
 * Also detects statutory context:
 * - Relative / Family Gifts: Mother, Father, Spouse, Brother, Sister -> Section 56(2)(x) 100% Tax Exempt
 */

import { PreprocessedNumericalEntity } from './types.js';

export const formatINR = (val: number): string => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

// Word to number dictionary for common Indian conversational phrases
const WORD_NUMBER_MAP: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  fifteen: 15,
  twenty: 20,
  twentyfive: 25,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  seventyfive: 75,
  eighty: 80,
  ninety: 90,
  hundred: 100,
};

/**
 * Extracts and normalizes all Indian numerical idioms from arbitrary text
 */
export function extractIndianNumericalEntities(text: string): PreprocessedNumericalEntity[] {
  if (!text || typeof text !== 'string') return [];

  const entities: PreprocessedNumericalEntity[] = [];
  const lower = text.toLowerCase();

  // Helper to check if already captured overlapping text
  const isAlreadyCaptured = (startIdx: number, endIdx: number) => {
    // Basic deduplication
    return false;
  };

  // 1. Shorthand with multiplier suffixes: e.g. 50k, 50 K, 1.5L, 2.5 lakh, 10 lacs, 2cr, 3 crore, 50 hazar
  // Regex matches: [currency prefix optional] [number (float/int)] [whitespace optional] [multiplier unit]
  const shorthandRegex = /(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(k|thousand|thousands|hazar|hazaar|l|lac|lacs|lakh|lakhs|cr|crore|crores)\b/gi;
  let match: RegExpExecArray | null;

  while ((match = shorthandRegex.exec(text)) !== null) {
    const rawMatch = match[0].trim();
    const numPart = parseFloat(match[1]);
    const unitPart = match[2].toLowerCase();

    let multiplier = 1;
    let unitLabel = '';

    if (unitPart === 'k' || unitPart === 'thousand' || unitPart === 'thousands' || unitPart === 'hazar' || unitPart === 'hazaar') {
      multiplier = 1000;
      unitLabel = 'Thousand';
    } else if (unitPart === 'l' || unitPart === 'lac' || unitPart === 'lacs' || unitPart === 'lakh' || unitPart === 'lakhs') {
      multiplier = 100000;
      unitLabel = 'Lakh';
    } else if (unitPart === 'cr' || unitPart === 'crore' || unitPart === 'crores') {
      multiplier = 10000000;
      unitLabel = 'Crore';
    }

    const normalizedInteger = Math.round(numPart * multiplier);

    // Determine context around this match
    const context = determineStatutoryContext(lower, match.index, rawMatch.length);

    entities.push({
      originalIdiom: rawMatch,
      normalizedInteger,
      formattedINR: formatINR(normalizedInteger),
      context: context.type,
      notes: `${numPart} ${unitLabel} = ${normalizedInteger.toLocaleString('en-IN')} INR. ${context.notes}`,
    });
  }

  // 2. English phrase numbers: e.g. "fifty thousand", "five lakhs", "two crore"
  const phraseRegex = /\b(fifty|sixty|seventy|seventyfive|eighty|ninety|twenty|twentyfive|thirty|forty|ten|fifteen|one|two|three|four|five|six|seven|eight|nine)\s+(thousand|thousands|lakh|lakhs|lac|lacs|crore|crores)\b/gi;
  while ((match = phraseRegex.exec(text)) !== null) {
    const rawMatch = match[0].trim();
    const wordNum = match[1].toLowerCase().replace(/\s+/g, '');
    const unitWord = match[2].toLowerCase();

    const baseVal = WORD_NUMBER_MAP[wordNum];
    if (baseVal !== undefined) {
      let multiplier = 1000;
      if (unitWord.startsWith('l')) multiplier = 100000;
      if (unitWord.startsWith('c')) multiplier = 10000000;

      const normalizedInteger = baseVal * multiplier;
      // Check if not already captured
      const exists = entities.some(e => e.normalizedInteger === normalizedInteger);
      if (!exists) {
        const context = determineStatutoryContext(lower, match.index, rawMatch.length);
        entities.push({
          originalIdiom: rawMatch,
          normalizedInteger,
          formattedINR: formatINR(normalizedInteger),
          context: context.type,
          notes: `Phrasal notation "${rawMatch}" = ${normalizedInteger.toLocaleString('en-IN')} INR. ${context.notes}`,
        });
      }
    }
  }

  // 3. Formatted or large raw numbers: e.g. "50,000", "5,00,000", "1500000", "₹75,000"
  const standardNumRegex = /(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{2,3})+|\d{4,})\b/gi;
  while ((match = standardNumRegex.exec(text)) !== null) {
    const rawMatch = match[0].trim();
    const cleaned = match[1].replace(/,/g, '');
    const normalizedInteger = parseInt(cleaned, 10);

    if (!isNaN(normalizedInteger) && normalizedInteger > 0) {
      // Check if this integer or substring is already covered by a shorthand entity
      const alreadyCovered = entities.some(
        e => e.normalizedInteger === normalizedInteger || e.originalIdiom.includes(rawMatch)
      );
      if (!alreadyCovered) {
        const context = determineStatutoryContext(lower, match.index, rawMatch.length);
        entities.push({
          originalIdiom: rawMatch,
          normalizedInteger,
          formattedINR: formatINR(normalizedInteger),
          context: context.type,
          notes: `Standard numeric amount ${normalizedInteger.toLocaleString('en-IN')} INR. ${context.notes}`,
        });
      }
    }
  }

  return entities;
}

/**
 * Helper to determine statutory context for an extracted financial amount
 */
export function determineStatutoryContext(
  lowerText: string,
  pos: number,
  matchLen: number
): { type: string; notes: string; isTaxExemptGift: boolean } {
  // Check relative gift context
  const isRelative =
    lowerText.includes('mother') ||
    lowerText.includes('mom') ||
    lowerText.includes('mummy') ||
    lowerText.includes('maa') ||
    lowerText.includes('father') ||
    lowerText.includes('dad') ||
    lowerText.includes('papa') ||
    lowerText.includes('parent') ||
    lowerText.includes('parents') ||
    lowerText.includes('brother') ||
    lowerText.includes('sister') ||
    lowerText.includes('spouse') ||
    lowerText.includes('wife') ||
    lowerText.includes('husband') ||
    lowerText.includes('son') ||
    lowerText.includes('daughter') ||
    lowerText.includes('relative');

  const isGift =
    lowerText.includes('received') ||
    lowerText.includes('gift') ||
    lowerText.includes('got') ||
    lowerText.includes('sent') ||
    lowerText.includes('transferred') ||
    lowerText.includes('gave');

  if (isRelative && isGift) {
    return {
      type: 'RELATIVE_GIFT_EXEMPT',
      notes: 'Gift received from a relative under Section 56(2)(x) is 100% EXEMPT from income tax with ZERO upper ceiling. Not business turnover.',
      isTaxExemptGift: true,
    };
  }

  if (lowerText.includes('nps') || lowerText.includes('80ccd')) {
    return {
      type: 'NPS_TIER1_INVESTMENT',
      notes: 'Eligible for exclusive deduction up to ₹50,000 under Section 80CCD(1B) in Old Tax Regime.',
      isTaxExemptGift: false,
    };
  }

  if (lowerText.includes('80d') || lowerText.includes('mediclaim') || lowerText.includes('health insurance')) {
    return {
      type: 'SECTION_80D_HEALTH',
      notes: 'Eligible for medical insurance premium deduction under Section 80D in Old Tax Regime.',
      isTaxExemptGift: false,
    };
  }

  if (lowerText.includes('80c') || lowerText.includes('ppf') || lowerText.includes('elss')) {
    return {
      type: 'SECTION_80C_INVESTMENT',
      notes: 'Subject to statutory maximum limit of ₹1,50,000 under Section 80C in Old Tax Regime.',
      isTaxExemptGift: false,
    };
  }

  if (lowerText.includes('cash')) {
    return {
      type: 'CASH_RECEIPT',
      notes: 'Cash receipts subject to 5.0% statutory surveillance ceiling under Section 44AD/44ADA to preserve extended limits.',
      isTaxExemptGift: false,
    };
  }

  if (
    lowerText.includes('invoice') ||
    lowerText.includes('payment') ||
    lowerText.includes('client') ||
    lowerText.includes('turnover') ||
    lowerText.includes('receipt') ||
    lowerText.includes('billing')
  ) {
    return {
      type: 'BUSINESS_TURNOVER',
      notes: 'Business/professional gross receipts eligible for Section 44ADA (50% deemed profit) or 44AD (6% digital profit).',
      isTaxExemptGift: false,
    };
  }

  return {
    type: 'GENERAL_FINANCIAL_ENTRY',
    notes: 'Financial amount parsed for tax planning evaluation.',
    isTaxExemptGift: false,
  };
}

/**
 * Pre-processes user input string:
 * 1. Finds all Indian numerical idioms.
 * 2. Produces an annotated string with exact rupee conversions.
 * 3. Builds a structured Markdown table ready for injection into LLM prompts.
 */
export function preprocessIndianNumericalIdioms(rawText: string): {
  originalText: string;
  annotatedText: string;
  entities: PreprocessedNumericalEntity[];
  markdownMappingTable: string;
} {
  const entities = extractIndianNumericalEntities(rawText);

  if (entities.length === 0) {
    return {
      originalText: rawText,
      annotatedText: rawText,
      entities: [],
      markdownMappingTable: '*(No numerical idioms detected in message)*',
    };
  }

  // Annotate text so model and user see explicit conversion
  let annotatedText = rawText;
  for (const entity of entities) {
    // Replace idiom with idiom + [₹50,000] if not already present
    if (!annotatedText.includes(`[${entity.formattedINR}]`)) {
      annotatedText = annotatedText.replace(
        new RegExp(`\\b${escapeRegExp(entity.originalIdiom)}\\b`, 'i'),
        `${entity.originalIdiom} [${entity.formattedINR}]`
      );
    }
  }

  // Build Markdown Table
  const rows = entities.map(
    e => `| \`${e.originalIdiom}\` | **${e.normalizedInteger.toLocaleString('en-IN')}** | **${e.formattedINR}** | ${e.context || 'GENERAL'} | ${e.notes || ''} |`
  );

  const markdownMappingTable = [
    '| Colloquial Idiom | Normalized Integer | Rupee Notation | Context Type | Statutory Rule / Note |',
    '| :--- | :--- | :--- | :--- | :--- |',
    ...rows,
  ].join('\n');

  return {
    originalText: rawText,
    annotatedText,
    entities,
    markdownMappingTable,
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Convenience single amount extractor
 */
export function parseIndianAmount(text: string): number | null {
  const entities = extractIndianNumericalEntities(text);
  if (entities.length > 0) {
    return entities[0].normalizedInteger;
  }
  return null;
}
