import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, ShieldCheck, Copy, Check, Info, Globe } from 'lucide-react';
import { generateInvoiceExportMetadata } from '../engine/invoiceExporter';
import { useTaxData } from '../context/TaxDataContext';

export const ExportInvoiceTab: React.FC = () => {
  const { taxData, updateTaxData } = useTaxData();

  const [invoiceNumber, setInvoiceNumber] = useState<string>('INV-2026-008');
  const [invoiceDate, setInvoiceDate] = useState<string>('2026-06-15');
  const [recipientName, setRecipientName] = useState<string>('Global Software Corp LLC');
  const [isExport, setIsExport] = useState<boolean>(taxData.isExport);
  const [lutNumber, setLutNumber] = useState<string>(taxData.lutNumber || 'AD270326001928X');
  const [currency, setCurrency] = useState<string>('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(86.5);
  const [itemAmountUSD, setItemAmountUSD] = useState<number>(
    taxData.grossReceipts > 0 ? Math.round((taxData.grossReceipts / 86.5) * 100) / 100 : 0
  );
  const [sacCode, setSacCode] = useState<string>('998314');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setIsExport(taxData.isExport);
    if (taxData.lutNumber) {
      setLutNumber(taxData.lutNumber);
    }
    if (taxData.grossReceipts > 0) {
      setItemAmountUSD(Math.round((taxData.grossReceipts / 86.5) * 100) / 100);
    } else {
      setItemAmountUSD(0);
    }
  }, [taxData]);

  const metadata = generateInvoiceExportMetadata({
    invoiceNumber,
    invoiceDate,
    recipientName,
    isCrossBorderExport: isExport,
    lutNumber: isExport ? lutNumber : undefined,
    currency,
    exchangeRateINR: exchangeRate,
    items: [
      {
        description: 'Information Technology Consulting & System Architecture Services',
        sacCode,
        quantity: 1,
        unitPrice: itemAmountUSD,
        amount: itemAmountUSD,
      },
    ],
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 text-white">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Cross-Border Zero-Rated Export Invoice Generator & GST Engine
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Auto-maps SAC Codes (e.g., 998314 for IT Consultancy), converts foreign currency (USD/EUR to INR), and auto-attaches mandatory statutory LUT disclaimer text.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Invoice Input Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
            Invoice Parameters
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Invoice No.</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Client / Recipient Name</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
            />
          </div>

          {/* Export vs Domestic Toggle */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-emerald-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isExport}
                onChange={(e) => setIsExport(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Cross-Border Zero-Rated Export Invoice (LUT)</span>
            </label>

            {isExport && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">LUT Reference Number</label>
                  <input
                    type="text"
                    value={lutNumber}
                    onChange={(e) => setLutNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-100"
                    placeholder="AD270326001928X"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Billing Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-100"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Exchange Rate (INR)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SAC Code Selector */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              SAC Code Mapping (Service Accounting Code)
            </label>
            <select
              value={sacCode}
              onChange={(e) => setSacCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
            >
              <option value="998314">998314 - IT consultancy and software supply</option>
              <option value="998311">998311 - Management consulting services</option>
              <option value="998312">998312 - Business consulting services</option>
              <option value="998313">998313 - IT infrastructure management</option>
              <option value="998319">998319 - Other professional & technical services</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Service Fee Amount ({currency})
            </label>
            <input
              type="number"
              value={itemAmountUSD}
              onChange={(e) => setItemAmountUSD(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
            />
          </div>
        </div>

        {/* Generated Invoice Metadata Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Statutory LUT Disclaimer Banner */}
          {metadata.isZeroRatedExport && (
            <div className="bg-emerald-950/40 border border-emerald-500/50 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Mandatory Statutory Export Disclaimer Auto-Applied</span>
              </div>
              <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono tracking-tight leading-relaxed">
                "{metadata.statutoryDisclaimer}"
              </p>
            </div>
          )}

          {/* Invoice Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-100">{metadata.invoiceNumber}</h4>
                <p className="text-xs text-slate-400">SAC {metadata.sacCodeMapped} • {metadata.sacDescription}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {metadata.isZeroRatedExport ? 'ZERO-RATED LUT EXPORT' : 'DOMESTIC TAXABLE'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
              {metadata.foreignCurrencyDetails && (
                <div>
                  <span className="text-slate-400 block">Foreign Value:</span>
                  <span className="font-bold text-slate-100">
                    {metadata.foreignCurrencyDetails.currency} {metadata.foreignCurrencyDetails.totalAmountForeignCurrency.toLocaleString()}
                  </span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block">Taxable Base (INR):</span>
                <span className="font-bold text-emerald-400">
                  {formatINR(metadata.totalTaxableAmountINR)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">IGST / GST Due:</span>
                <span className="font-bold text-slate-100">
                  {metadata.isZeroRatedExport ? '₹0 (Zero Rated)' : formatINR(metadata.igstAmountINR || metadata.cgstAmountINR * 2)}
                </span>
              </div>
            </div>

            {/* Validation Notes */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 block">Compliance Audits:</span>
              <ul className="text-xs text-slate-300 space-y-1">
                {metadata.validationNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    • <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* JSON Output Viewer */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-400">Invoice Metadata Payload</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </button>
              </div>
              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-emerald-300 font-mono overflow-x-auto max-h-48">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
