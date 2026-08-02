import React, { useState } from 'react';
import { Code2, RefreshCw, Check, AlertCircle, Save } from 'lucide-react';
import { getTaxSchema, setTaxSchema, resetTaxSchema } from '../engine/schemaLoader';
import { TaxSchema } from '../engine/types';

export const SchemaInspectorTab: React.FC = () => {
  const [schemaText, setSchemaText] = useState<string>(
    JSON.stringify(getTaxSchema(), null, 2)
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

  const handleApplySchema = () => {
    try {
      const parsed = JSON.parse(schemaText) as Partial<TaxSchema>;
      setTaxSchema(parsed);
      setIsError(false);
      setStatusMessage('Tax parameters updated dynamically (Rules-as-Code)! Engine re-evaluating with new schema.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setIsError(true);
      setStatusMessage(`Invalid JSON Schema Syntax: ${err.message}`);
    }
  };

  const handleReset = () => {
    const res = resetTaxSchema();
    setSchemaText(JSON.stringify(res, null, 2));
    setIsError(false);
    setStatusMessage('Schema reset to official FY 2026-27 defaults.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Tax Rates & Rules Configuration (JSON Schema)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              All tax parameters (turnover limits ₹50L/₹75L/₹2Cr/₹3Cr, tax slab brackets, cash surveillance caps 5%, SAC codes, and Advance Tax schedules) are parsed dynamically from this customizable tax rules schema payload.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-200">
            Active Tax Rules Config: taxSchema.json
          </span>

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <button
              onClick={handleApplySchema}
              className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              Apply Dynamic Rules
            </button>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              isError
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {isError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            <span>{statusMessage}</span>
          </div>
        )}

        <div>
          <textarea
            value={schemaText}
            onChange={(e) => setSchemaText(e.target.value)}
            className="w-full h-[520px] bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};
