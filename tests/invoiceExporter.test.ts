import { describe, expect, it } from 'vitest';
import { generateInvoiceExportMetadata } from '../src/engine/invoiceExporter.js';

describe('Module 5: GST & Export Invoice Engine', () => {
  it('should auto-attach mandatory LUT statutory disclaimer for zero-rated export invoices', () => {
    const result = generateInvoiceExportMetadata({
      invoiceNumber: 'EXP-2026-001',
      invoiceDate: '2026-06-01',
      recipientName: 'Acme Corp USA',
      isCrossBorderExport: true,
      lutNumber: 'LUT/2026-27/00192',
      currency: 'USD',
      exchangeRateINR: 86.5,
      items: [
        {
          description: 'Software Architecture Consulting',
          sacCode: '998314',
          quantity: 1,
          unitPrice: 2000, // $2000 USD
          amount: 2000,
        },
      ],
    });

    expect(result.isZeroRatedExport).toBe(true);
    expect(result.statutoryDisclaimer).toBe(
      'SUPPLY MEANT FOR EXPORT UNDER BOND OR LETTER OF UNDERTAKING (LUT) WITHOUT PAYMENT OF INTEGRATED TAX (IGST)'
    );
    expect(result.sacCodeMapped).toBe('998314');
    expect(result.totalTaxableAmountINR).toBe(173000); // 2000 * 86.5
    expect(result.cgstAmountINR).toBe(0);
    expect(result.sgstAmountINR).toBe(0);
    expect(result.igstAmountINR).toBe(0);
  });

  it('should calculate CGST (9%) and SGST (9%) for domestic intra-state supply', () => {
    const result = generateInvoiceExportMetadata({
      invoiceNumber: 'DOM-001',
      invoiceDate: '2026-06-15',
      recipientName: 'Tech Local Pvt Ltd',
      supplierStateCode: '27', // MH
      placeOfSupplyStateCode: '27', // MH
      isCrossBorderExport: false,
      items: [
        {
          description: 'Web Development Services',
          sacCode: '998314',
          quantity: 1,
          unitPrice: 100000, // ₹1,00,000
          amount: 100000,
        },
      ],
    });

    expect(result.totalTaxableAmountINR).toBe(100000);
    expect(result.cgstAmountINR).toBe(9000);
    expect(result.sgstAmountINR).toBe(9000);
    expect(result.igstAmountINR).toBe(0);
    expect(result.totalInvoiceValueINR).toBe(118000);
  });
});
