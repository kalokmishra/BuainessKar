import React, { useState, useEffect, useCallback } from 'react';
import {
  FileSpreadsheet,
  ShieldCheck,
  Copy,
  Check,
  Info,
  Globe,
  Save,
  RefreshCw,
  FolderOpen,
  Trash2,
  PlusCircle,
  FileCheck
} from 'lucide-react';
import { generateInvoiceExportMetadata } from '../engine/invoiceExporter';
import { useTaxData } from '../context/TaxDataContext';
import { useAuth } from '../context/AuthContext';
import { databaseService, UserDocument } from '../services/index';
import { FieldTooltip } from './FieldTooltip';

export const ExportInvoiceTab: React.FC = () => {
  const { taxData, updateTaxData } = useTaxData();
  const { currentUser } = useAuth();

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

  // Document Persistence State
  const [savedDocs, setSavedDocs] = useState<UserDocument[]>([]);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const userId = currentUser?.id || 'usr_guest';
  const collectionPath = `users/${userId}/documents`;

  // Fetch saved documents
  const loadDocuments = useCallback(async () => {
    try {
      const docs = await databaseService.listDocuments<UserDocument>(collectionPath);
      setSavedDocs(docs.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')));
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  }, [collectionPath]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

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

  const getDocIdForInvoice = (num: string) => {
    const sanitized = num.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    return `inv_${sanitized || Date.now()}`;
  };

  // 1. CREATE DOCUMENT
  const handleCreateDocument = async () => {
    if (!invoiceNumber.trim()) {
      setStatusMessage({ text: 'Invoice number is required to save document', type: 'error' });
      return;
    }
    setIsProcessing(true);
    const docId = getDocIdForInvoice(invoiceNumber);
    try {
      const payload: UserDocument = {
        id: docId,
        userId,
        title: `${invoiceNumber} - ${recipientName}`,
        type: 'INVOICE',
        data: {
          invoiceNumber,
          invoiceDate,
          recipientName,
          isExport,
          lutNumber,
          currency,
          exchangeRate,
          itemAmountUSD,
          sacCode,
          totalTaxableAmountINR: metadata.totalTaxableAmountINR,
          metadata,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await databaseService.createDocument(collectionPath, docId, payload);
      setEditingDocId(docId);
      setStatusMessage({ text: `Document "${payload.title}" created successfully!`, type: 'success' });
      await loadDocuments();
    } catch (err: any) {
      setStatusMessage({ text: `Failed to create document: ${err.message || 'Error'}`, type: 'error' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // 2. UPDATE DOCUMENT
  const handleUpdateDocument = async () => {
    const targetDocId = editingDocId || getDocIdForInvoice(invoiceNumber);
    setIsProcessing(true);
    try {
      const updateData = {
        title: `${invoiceNumber} - ${recipientName}`,
        data: {
          invoiceNumber,
          invoiceDate,
          recipientName,
          isExport,
          lutNumber,
          currency,
          exchangeRate,
          itemAmountUSD,
          sacCode,
          totalTaxableAmountINR: metadata.totalTaxableAmountINR,
          metadata,
        },
        updatedAt: new Date().toISOString(),
      };

      await databaseService.updateDocument(collectionPath, targetDocId, updateData);
      setEditingDocId(targetDocId);
      setStatusMessage({ text: `Document "${updateData.title}" updated successfully!`, type: 'success' });
      await loadDocuments();
    } catch (err: any) {
      setStatusMessage({ text: `Failed to update document: ${err.message || 'Error'}`, type: 'error' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Load an existing document into the editor
  const handleLoadDocument = (doc: UserDocument) => {
    if (doc.data) {
      if (doc.data.invoiceNumber) setInvoiceNumber(doc.data.invoiceNumber);
      if (doc.data.invoiceDate) setInvoiceDate(doc.data.invoiceDate);
      if (doc.data.recipientName) setRecipientName(doc.data.recipientName);
      if (typeof doc.data.isExport === 'boolean') setIsExport(doc.data.isExport);
      if (doc.data.lutNumber) setLutNumber(doc.data.lutNumber);
      if (doc.data.currency) setCurrency(doc.data.currency);
      if (doc.data.exchangeRate) setExchangeRate(doc.data.exchangeRate);
      if (typeof doc.data.itemAmountUSD === 'number') setItemAmountUSD(doc.data.itemAmountUSD);
      if (doc.data.sacCode) setSacCode(doc.data.sacCode);
    }
    setEditingDocId(doc.id);
    setStatusMessage({ text: `Loaded document "${doc.title}" for editing.`, type: 'info' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Delete document
  const handleDeleteDocument = async (docId: string, title: string) => {
    if (!window.confirm(`Delete document "${title}"?`)) return;
    setIsProcessing(true);
    try {
      await databaseService.deleteDocument(collectionPath, docId);
      if (editingDocId === docId) {
        setEditingDocId(null);
      }
      setStatusMessage({ text: `Document "${title}" deleted.`, type: 'info' });
      await loadDocuments();
    } catch (err: any) {
      setStatusMessage({ text: `Failed to delete document: ${err.message || 'Error'}`, type: 'error' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Reset form to create fresh document
  const handleResetForm = () => {
    setEditingDocId(null);
    setInvoiceNumber(`INV-2026-00${savedDocs.length + 9}`);
    setRecipientName('New Enterprise Client');
    setStatusMessage({ text: 'Form reset for new document creation.', type: 'info' });
    setTimeout(() => setStatusMessage(null), 2000);
  };

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
              <FieldTooltip
                section="Sec 16 IGST Act"
                title="Zero-Rated Export under LUT"
                rule="Export of services outside India under Letter of Undertaking (LUT) is zero-rated under GST Section 16, allowing exporters to bill without IGST payment."
              />
            </label>

            {isExport && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-[11px] text-slate-400 flex items-center mb-1">
                    <span>LUT Reference Number</span>
                    <FieldTooltip
                      section="Rule 96A CGST Rules"
                      title="Letter of Undertaking (ARN)"
                      rule="An annual LUT (Form GST RFD-11) filed on the GST portal prior to export. Must be quoted on all export invoices to claim zero-rated status."
                    />
                  </label>
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
                    <label className="text-[11px] text-slate-400 flex items-center mb-1">
                      <span>Billing Currency</span>
                      <FieldTooltip
                        section="FEMA & Rule 34"
                        title="Foreign Convertible Currency"
                        rule="Export proceeds must be received in convertible foreign currency (USD/EUR/GBP) within prescribed RBI timeframe to qualify as export of services under Sec 2(6) IGST Act."
                      />
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-100 cursor-pointer"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 flex items-center mb-1">
                      <span>Exchange Rate (INR)</span>
                      <FieldTooltip
                        section="Rule 34 CGST"
                        title="CBIC Reference Rate"
                        rule="Conversion to INR must use the official exchange rate determined by CBIC or RBI as on the date of invoice generation."
                      />
                    </label>
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
            <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
              <span>SAC Code Mapping (Service Accounting Code)</span>
              <FieldTooltip
                section="GST SAC Classification"
                title="Service Accounting Code"
                rule="Uniform classification code under GST for services. 998314 covers Information Technology consultancy and software development services."
              />
            </label>
            <select
              value={sacCode}
              onChange={(e) => setSacCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 cursor-pointer"
            >
              <option value="998314">998314 - IT consultancy and software supply</option>
              <option value="998311">998311 - Management consulting services</option>
              <option value="998312">998312 - Business consulting services</option>
              <option value="998313">998313 - IT infrastructure management</option>
              <option value="998319">998319 - Other professional & technical services</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
              <span>Service Fee Amount ({currency})</span>
              <FieldTooltip
                section="Invoice Value"
                title="Foreign Currency Amount"
                rule="The total fee billed to foreign client in foreign currency. Converted to INR using exchange rate for gross revenue & GST compliance."
              />
            </label>
            <input
              type="number"
              value={itemAmountUSD}
              onChange={(e) => setItemAmountUSD(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
            />
          </div>

          {/* Document Operations Toolbar */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cloud Document Management</span>
              </span>
              {editingDocId && (
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">
                  Editing: {editingDocId}
                </span>
              )}
            </div>

            {statusMessage && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : statusMessage.type === 'error'
                    ? 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                    : 'bg-blue-950/50 border-blue-500/40 text-blue-300'
                }`}
              >
                <span>{statusMessage.text}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCreateDocument}
                disabled={isProcessing}
                className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-3 rounded-xl text-xs transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save New Document</span>
              </button>

              <button
                type="button"
                onClick={handleUpdateDocument}
                disabled={isProcessing}
                className={`flex items-center justify-center gap-1.5 font-medium py-2 px-3 rounded-xl text-xs transition border cursor-pointer ${
                  editingDocId
                    ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                } disabled:opacity-50`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Update Document</span>
              </button>
            </div>

            <div className="flex justify-between items-center pt-1">
              <button
                type="button"
                onClick={handleResetForm}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition"
              >
                <PlusCircle className="w-3 h-3" />
                <span>Create Fresh Invoice</span>
              </button>

              <span className="text-[10px] text-slate-500">
                Storage: {currentUser?.provider === 'firebase' ? 'Firebase Firestore' : 'Local Sandbox'}
              </span>
            </div>
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

      {/* Saved Documents Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">Saved Invoices & Documents Collection</h3>
              <p className="text-xs text-slate-400">
                Persistent records stored at <code className="text-emerald-300 font-mono text-[11px]">users/{'{userId}'}/documents</code>
              </p>
            </div>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 bg-slate-800 rounded-full text-slate-300 border border-slate-700">
            {savedDocs.length} {savedDocs.length === 1 ? 'Document' : 'Documents'} Saved
          </span>
        </div>

        {savedDocs.length === 0 ? (
          <div className="text-center py-8 px-4 bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
            <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-medium">No saved documents yet</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Click "Save New Document" above to persist your export invoice with full SAC code, LUT disclaimers, and currency conversions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-2">Invoice / Title</th>
                  <th className="pb-2">Client</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Value (INR)</th>
                  <th className="pb-2">Last Updated</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {savedDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className={`hover:bg-slate-800/40 transition ${
                      editingDocId === doc.id ? 'bg-emerald-950/20' : ''
                    }`}
                  >
                    <td className="py-2.5 font-medium text-slate-200">
                      <div className="flex items-center gap-1.5">
                        {editingDocId === doc.id && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                        <span>{doc.data?.invoiceNumber || doc.title}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-slate-300">
                      {doc.data?.recipientName || '—'}
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-2.5 text-emerald-400 font-mono">
                      {doc.data?.totalTaxableAmountINR ? formatINR(doc.data.totalTaxableAmountINR) : '—'}
                    </td>
                    <td className="py-2.5 text-slate-400 text-[11px]">
                      {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="py-2.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleLoadDocument(doc)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition cursor-pointer border border-slate-700"
                        title="Load document parameters into editor"
                      >
                        Load to Edit
                      </button>

                      {editingDocId === doc.id && (
                        <button
                          type="button"
                          onClick={handleUpdateDocument}
                          disabled={isProcessing}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium transition cursor-pointer"
                          title="Save current modifications to this document"
                        >
                          Update
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id, doc.title)}
                        disabled={isProcessing}
                        className="p-1 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded transition cursor-pointer"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
