/**
 * Day 1 Core Engine - Module 5: GST & Export Invoice Metadata Engine
 * Handles domestic GST tax breakdown (CGST/SGST/IGST) and cross-border zero-rated export invoices under LUT
 * with auto-mapped SAC codes (e.g. 998314) and mandatory statutory disclaimer text.
 */

import { getTaxSchema } from './schemaLoader.js';
import {
  InvoiceExportMetadata,
  InvoiceInput,
} from './types.js';

/**
 * Calculates GST taxes and constructs export invoice compliance metadata
 */
export function generateInvoiceExportMetadata(input: InvoiceInput): InvoiceExportMetadata {
  const schema = getTaxSchema();
  const validationNotes: string[] = [];

  // Default SAC code mapping if not provided in items
  const defaultSac = schema.gst.sacCodes[0]; // '998314' - IT consultancy
  const sacCodeMapped =
    input.items && input.items.length > 0 && input.items[0].sacCode
      ? input.items[0].sacCode
      : defaultSac.code;

  const matchedSac = schema.gst.sacCodes.find((s) => s.code === sacCodeMapped);
  const sacDescription = matchedSac ? matchedSac.description : defaultSac.description;

  // Calculate Subtotal Foreign or INR
  const rawSubtotal = (input.items || []).reduce((sum, item) => {
    const qty = Math.max(0, item.quantity || 1);
    const price = Math.max(0, item.unitPrice || 0);
    return sum + qty * price;
  }, 0);

  const currency = (input.currency || 'INR').toUpperCase();
  const exchangeRate = input.exchangeRateINR && input.exchangeRateINR > 0 ? input.exchangeRateINR : 1.0;

  let totalTaxableAmountINR = rawSubtotal;
  let foreignCurrencyDetails: InvoiceExportMetadata['foreignCurrencyDetails'];

  if (input.isCrossBorderExport && currency !== 'INR') {
    totalTaxableAmountINR = Math.round(rawSubtotal * exchangeRate);
    foreignCurrencyDetails = {
      currency,
      exchangeRate,
      totalAmountForeignCurrency: Number(rawSubtotal.toFixed(2)),
    };
  } else {
    totalTaxableAmountINR = Math.round(rawSubtotal);
  }

  let isZeroRatedExport = false;
  let statutoryDisclaimer = '';
  let cgstAmountINR = 0;
  let sgstAmountINR = 0;
  let igstAmountINR = 0;
  let complianceStatus: 'VALID' | 'WARNING' = 'VALID';

  if (input.isCrossBorderExport) {
    isZeroRatedExport = true;
    statutoryDisclaimer = schema.gst.zeroRatedDisclaimer; // "SUPPLY MEANT FOR EXPORT UNDER BOND OR LETTER OF UNDERTAKING (LUT) WITHOUT PAYMENT OF INTEGRATED TAX (IGST)"

    // Export under LUT has 0% GST liability
    cgstAmountINR = 0;
    sgstAmountINR = 0;
    igstAmountINR = 0;

    if (!input.lutNumber) {
      complianceStatus = 'WARNING';
      validationNotes.push(
        'Warning: LUT (Letter of Undertaking) number is missing. Export without LUT requires payment of IGST under claim of refund.'
      );
    } else {
      validationNotes.push(`Zero-rated export under LUT Ref: ${input.lutNumber}. GST liability is ₹0.`);
    }

    if (currency === 'INR') {
      validationNotes.push(
        'Note: Cross-border invoice issued in INR. Ensure inward remittance is received in convertible foreign exchange via FIRC/BRC.'
      );
    }
  } else {
    // Domestic Supply Logic (Intra-state vs Inter-state)
    const supplierState = input.supplierStateCode || '27'; // Default Maharashtra if omitted
    const recipientState = input.placeOfSupplyStateCode || supplierState;
    const isIntraState = supplierState === recipientState;

    const defaultRate = schema.gst.defaultServiceRate; // 18%
    const taxRateDecimal = defaultRate / 100;

    if (isIntraState) {
      // Split into CGST (9%) and SGST (9%)
      cgstAmountINR = Math.round((totalTaxableAmountINR * taxRateDecimal) / 2);
      sgstAmountINR = Math.round((totalTaxableAmountINR * taxRateDecimal) / 2);
      igstAmountINR = 0;
      validationNotes.push(`Intra-state domestic supply (${supplierState}). Applied CGST 9% + SGST 9%.`);
    } else {
      // IGST (18%)
      cgstAmountINR = 0;
      sgstAmountINR = 0;
      igstAmountINR = Math.round(totalTaxableAmountINR * taxRateDecimal);
      validationNotes.push(`Inter-state domestic supply (${supplierState} -> ${recipientState}). Applied IGST 18%.`);
    }
  }

  const totalInvoiceValueINR =
    totalTaxableAmountINR + cgstAmountINR + sgstAmountINR + igstAmountINR;

  return {
    invoiceNumber: input.invoiceNumber || 'INV-001',
    invoiceDate: input.invoiceDate || new Date().toISOString().split('T')[0],
    isZeroRatedExport,
    sacCodeMapped,
    sacDescription,
    statutoryDisclaimer,
    totalTaxableAmountINR,
    cgstAmountINR,
    sgstAmountINR,
    igstAmountINR,
    totalInvoiceValueINR,
    foreignCurrencyDetails,
    complianceStatus,
    validationNotes,
  };
}
