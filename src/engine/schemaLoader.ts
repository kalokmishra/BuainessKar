/**
 * Rules-as-Code (RaC) Schema Loader
 * Parses and validates tax parameters dynamically from taxSchema.json
 */

import defaultTaxSchema from '../config/taxSchema.json' with { type: 'json' };
import { TaxSchema } from './types.js';

let activeSchema: TaxSchema = defaultTaxSchema as unknown as TaxSchema;

/**
 * Get current active tax schema
 */
export function getTaxSchema(): TaxSchema {
  return activeSchema;
}

/**
 * Dynamically set or update active tax schema payload (for version-controlled runtime updates)
 */
export function setTaxSchema(customSchema: Partial<TaxSchema>): TaxSchema {
  activeSchema = {
    ...activeSchema,
    ...customSchema,
    meta: {
      ...activeSchema.meta,
      ...(customSchema.meta || {}),
    },
  };
  return activeSchema;
}

/**
 * Reset schema to standard default
 */
export function resetTaxSchema(): TaxSchema {
  activeSchema = defaultTaxSchema as unknown as TaxSchema;
  return activeSchema;
}

/**
 * Validate schema structure basic sanity
 */
export function validateSchema(schema: TaxSchema): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!schema.meta?.financialYear) errors.push('Missing meta.financialYear');
  if (!schema.section44ADA?.standardLimit) errors.push('Missing section44ADA.standardLimit');
  if (!schema.section44AD?.standardLimit) errors.push('Missing section44AD.standardLimit');
  if (!schema.taxRegimes?.newRegime?.slabs) errors.push('Missing taxRegimes.newRegime.slabs');

  return {
    isValid: errors.length === 0,
    errors,
  };
}
