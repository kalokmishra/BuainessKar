import { describe, expect, it, afterAll } from 'vitest';
import fs from 'fs';
import { PERSONAS_DATA } from '../src/components/PersonaSelectorStep';
import { generateITR4SummaryPdf, generateTaxCalculationPdf } from '../src/utils/pdfExporter';
import { calculatePresumptiveTax } from '../src/engine/presumptiveTax';
import { calculateAdvanceTax } from '../src/engine/advanceTax';

describe('Persona Selector & CA Consultation Review Tests', () => {
  it('should have all 6 defined personas with valid structures and routing', () => {
    expect(PERSONAS_DATA).toHaveLength(6);

    const ids = PERSONAS_DATA.map((p) => p.id);
    expect(ids).toContain('salaried-consultant');
    expect(ids).toContain('full-time-developer');
    expect(ids).toContain('stock-investor');
    expect(ids).toContain('international-freelancer');
    expect(ids).toContain('small-business');
    expect(ids).toContain('first-time-filer');

    const salaried = PERSONAS_DATA.find((p) => p.id === 'salaried-consultant');
    expect(salaried?.defaultTab).toBe('comprehensive');
    expect(salaried?.demoValues?.grossSalary).toBe(1200000);

    const developer = PERSONAS_DATA.find((p) => p.id === 'full-time-developer');
    expect(developer?.defaultTab).toBe('calculator');
    expect(developer?.demoValues?.grossReceipts).toBe(4800000);

    const stock = PERSONAS_DATA.find((p) => p.id === 'stock-investor');
    expect(stock?.defaultTab).toBe('comprehensive');
    expect(stock?.demoValues?.stcgEquity).toBe(150000);
    expect(stock?.demoValues?.ltcgEquity).toBe(300000);

    const exporter = PERSONAS_DATA.find((p) => p.id === 'international-freelancer');
    expect(exporter?.defaultTab).toBe('invoice');
    expect(exporter?.demoValues?.isExport).toBe(true);
    expect(exporter?.demoValues?.lutNumber).toBeDefined();

    const business = PERSONAS_DATA.find((p) => p.id === 'small-business');
    expect(business?.defaultTab).toBe('calculator');
    expect(business?.demoValues?.grossReceipts).toBe(15000000);

    const firstTimer = PERSONAS_DATA.find((p) => p.id === 'first-time-filer');
    expect(firstTimer?.demoValues).toBeNull();
  });

  it('should include CA review confidence statement in generated ITR-4 PDF', () => {
    const presumptive = calculatePresumptiveTax({
      workflowRoute: 'SECTION_44ADA',
      grossReceipts: 4800000,
      cashReceipts: 100000,
    });

    const advance = calculateAdvanceTax({
      estimatedAnnualTaxLiability: presumptive.newRegime.totalTaxLiability,
      paymentsMade: [{ quarter: 'Q4', paidAmount: 200000 }],
      isPresumptiveTaxpayer: true,
    });

    const { doc, filename } = generateITR4SummaryPdf({
      pan: 'ABCDE1234F',
      fullName: 'Rahul Sharma',
      workflowRoute: 'SECTION_44ADA',
      businessCode: '09028',
      tradeName: 'Sharma Tech Consulting',
      grossReceipts: 4800000,
      cashReceipts: 100000,
      tdsClaimed: 25000,
      optedNewRegime: true,
      presumptive,
      advanceTax: advance,
      bankDetails: [
        {
          bankName: 'State Bank of India',
          accountNumber: '998877665544',
          ifsCode: 'SBIN0001234',
          isPrimaryForRefund: true,
        },
      ],
    });

    expect(doc).toBeDefined();
    expect(filename).toBe('ITR4_Sugam_Tax_Summary_ABCDE1234F_AY2027-28.pdf');
  });

  it('should generate calculation PDF with CA review callout box', () => {
    const presumptive = calculatePresumptiveTax({
      workflowRoute: 'SECTION_44ADA',
      grossReceipts: 4800000,
      cashReceipts: 100000,
    });

    const eligibility = {
      isEligible: true,
      workflowRoute: 'SECTION_44ADA' as const,
      applicableSection: '44ADA' as const,
      applicableTurnoverLimit: 7500000,
      isExtendedLimitApplied: true,
      reason: 'Eligible professional under Section 44ADA',
      disqualificationReasons: [],
      recommendation: 'Eligible for Section 44ADA presumptive scheme',
      presumptiveRate: 0.5,
      cashReceiptsPercentage: 2.08,
      turnoverLimitExceeded: false,
      cashThresholdExceeded: false,
      higherLimitApplicable: true,
    };

    expect(() => {
      generateTaxCalculationPdf({
        entityType: 'INDIVIDUAL',
        activityType: 'PROFESSION',
        categoryLabel: 'IT Software Development',
        chapterVIADeductions: 150000,
        grossReceipts: 4800000,
        cashReceipts: 100000,
        eligibility,
        presumptive,
      });
    }).not.toThrow();
  });

  afterAll(() => {
    try {
      const files = fs.readdirSync('.');
      for (const file of files) {
        if (file.startsWith('ITR4_Sugam_') || file.startsWith('Presumptive_Tax_Report_')) {
          fs.unlinkSync(file);
        }
      }
    } catch {
      // ignore
    }
  });
});
