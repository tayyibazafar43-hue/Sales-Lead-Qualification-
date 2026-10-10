import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { LeadInput, Lead } from '../types/lead';
import { bulkScoreLeads } from '../lib/api';

interface BulkUploadProps {
  onBatchProcessed: () => void;
  onNavigateDirectory: () => void;
}

export const BulkUpload: React.FC<BulkUploadProps> = ({
  onBatchProcessed,
  onNavigateDirectory,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<LeadInput[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scoredLeads, setScoredLeads] = useState<Lead[] | null>(null);
  const [processingStats, setProcessingStats] = useState<{ count: number; timeMs: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadSampleCSV = () => {
    const csvContent =
      'name,email,company,industry,company_size,budget,urgency,engagement,source\n' +
      'Marcus Brody,m.brody@museumtech.edu,National Antiquities Labs,Education,201-1000 employees,65000,Short-term (1-3 mos),High (Demo / Webinar),Inbound Demo\n' +
      'Marion Ravenwood,marion@ravenbar.com,Ravenwood Hospitality,Retail & E-commerce,11-50 employees,25000,Medium-term (3-6 mos),Medium (3+ Content Downloads),Organic Search\n' +
      'Sallah Mohammed,sallah@cairologistics.eg,Cairo Transport Rail,Manufacturing,1000+ employees,210000,Immediate (< 1 mo),High (Demo / Webinar),Direct Referral\n' +
      'Henry Jones,henry@graillabs.org,Grail Discovery Systems,Tech/SaaS,51-200 employees,115000,Immediate (< 1 mo),High (Demo / Webinar),Inbound Demo\n' +
      'Short Round,round@shanghaifleet.cn,Shanghai Expedited Freight,Manufacturing,51-200 employees,80000,Short-term (1-3 mos),Medium (3+ Content Downloads),Paid Campaign';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_sales_leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    parseCSV(selected);
  };

  const parseCSV = (csvFile: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setValidationErrors(['CSV file appears to be empty or contains only headers.']);
        setParsedRows([]);
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
      const required = ['name', 'email', 'company', 'industry', 'company_size', 'budget', 'urgency', 'engagement', 'source'];
      const missing = required.filter((r) => !headers.includes(r));

      if (missing.length > 0) {
        setValidationErrors([`Missing required CSV column headers: ${missing.join(', ')}`]);
        setParsedRows([]);
        return;
      }

      const errors: string[] = [];
      const parsed: LeadInput[] = [];

      for (let i = 1; i < lines.length; i++) {
        // Simple comma split handling
        const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
        if (values.length < headers.length) continue;

        const rowObj: any = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx];
        });

        if (!rowObj.name || !rowObj.company) {
          errors.push(`Row ${i + 1}: Name or Company is missing.`);
          continue;
        }

        const budgetNum = parseFloat(rowObj.budget);
        if (isNaN(budgetNum) || budgetNum < 0) {
          errors.push(`Row ${i + 1}: Invalid budget "${rowObj.budget}".`);
          continue;
        }

        parsed.push({
          name: rowObj.name,
          email: rowObj.email || `${rowObj.name.toLowerCase().replace(/\s+/g, '.')}@${rowObj.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          company: rowObj.company,
          industry: rowObj.industry || 'Tech/SaaS',
          company_size: rowObj.company_size || '51-200 employees',
          budget: budgetNum,
          urgency: rowObj.urgency || 'Short-term (1-3 mos)',
          engagement: rowObj.engagement || 'Medium (3+ Content Downloads)',
          source: rowObj.source || 'Inbound Demo',
        });
      }

      setValidationErrors(errors);
      setParsedRows(parsed);
      setScoredLeads(null);
    };

    reader.readAsText(csvFile);
  };

  const handleProcessLeads = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    setProgress(20);

    const timer = setInterval(() => {
      setProgress((p) => Math.min(85, p + 15));
    }, 150);

    try {
      const res = await bulkScoreLeads(parsedRows);
      clearInterval(timer);
      setProgress(100);
      setScoredLeads(res.leads);
      setProcessingStats({ count: res.count, timeMs: res.processing_time_ms });
      onBatchProcessed();
    } catch (err: any) {
      clearInterval(timer);
      alert(`Bulk scoring error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadScoredCSV = () => {
    if (!scoredLeads || scoredLeads.length === 0) return;

    const headers = [
      'ID',
      'Name',
      'Email',
      'Company',
      'Industry',
      'Company Size',
      'Budget ($)',
      'Urgency',
      'Engagement',
      'Source',
      'Score',
      'Priority',
      'Confidence',
      'Recommended Action',
      'Top Driver',
      'Status',
    ];

    const rows = scoredLeads.map((l) => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      `"${l.company.replace(/"/g, '""')}"`,
      `"${l.industry}"`,
      `"${l.company_size}"`,
      l.budget,
      `"${l.urgency}"`,
      `"${l.engagement}"`,
      `"${l.source}"`,
      l.score,
      `"${l.priority}"`,
      l.confidence,
      `"${(l.recommended_action || '').replace(/"/g, '""')}"`,
      `"${(l.positive_factors?.[0] || '').replace(/"/g, '""')}"`,
      `"${l.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leadmatrix_scored_batch_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#15803d]" />
            <span>Bulk CSV Qualification Pipeline</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Batch ingest, score, and prioritize prospective leads from webinars, event attendees, or CRM exports.
          </p>
        </div>

        <button
          onClick={downloadSampleCSV}
          className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-gray-500" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      {/* Upload Dropzone */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-xs text-center">
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 text-[#15803d] flex items-center justify-center mx-auto mb-3">
          <FileSpreadsheet className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-gray-900">
          {file ? file.name : 'Select or drag & drop lead CSV file'}
        </h3>
        <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-4">
          Required headers: <code className="text-gray-700 bg-gray-100 px-1 py-0.5 rounded text-[11px]">name, email, company, industry, company_size, budget, urgency, engagement, source</code>
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#15803d] hover:bg-[#166534] rounded-lg transition-colors shadow-xs"
          >
            Browse CSV File
          </button>
          {file && (
            <button
              onClick={() => {
                setFile(null);
                setParsedRows([]);
                setScoredLeads(null);
              }}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800"
            >
              Clear
            </button>
          )}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mt-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-left text-xs text-red-700 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> CSV Validation Notices
            </div>
            {validationErrors.map((err, i) => (
              <div key={i}>• {err}</div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Table & Process CTA */}
      {parsedRows.length > 0 && !scoredLeads && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Parsed Data Preview ({parsedRows.length} Leads Ready)
              </h3>
              <p className="text-xs text-gray-500">Review schema conformance before initiating batch ML scoring.</p>
            </div>

            <button
              onClick={handleProcessLeads}
              disabled={isProcessing}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#15803d] hover:bg-[#166534] rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Score & Ingest {parsedRows.length} Leads</span>
                </>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#15803d] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-xs text-gray-700 divide-y divide-gray-200">
              <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-2.5 px-3">Lead Name</th>
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Industry</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3 text-right">Budget</th>
                  <th className="py-2.5 px-3">Urgency</th>
                  <th className="py-2.5 px-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parsedRows.slice(0, 8).map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2 px-3 font-semibold text-gray-900">{r.name}</td>
                    <td className="py-2 px-3">{r.company}</td>
                    <td className="py-2 px-3">{r.industry}</td>
                    <td className="py-2 px-3 text-gray-500">{r.company_size}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-semibold">${r.budget.toLocaleString()}</td>
                    <td className="py-2 px-3">{r.urgency}</td>
                    <td className="py-2 px-3 text-gray-500">{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedRows.length > 8 && (
            <div className="text-center text-xs text-gray-400">
              + {parsedRows.length - 8} additional rows ready for scoring
            </div>
          )}
        </div>
      )}

      {/* Results View */}
      {scoredLeads && (
        <div className="bg-white border border-emerald-200 rounded-xl p-6 shadow-sm space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#15803d] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Bulk Batch Qualification Complete
                </h3>
                <p className="text-xs text-gray-500">
                  Ingested & scored {processingStats?.count} leads in {processingStats?.timeMs}ms. Persisted to SQLite.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={downloadScoredCSV}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#15803d] hover:bg-[#166534] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Scored CSV</span>
              </button>
              <button
                onClick={onNavigateDirectory}
                className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>View in Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Results Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="text-[11px] font-semibold text-gray-500 uppercase">Total Scored</div>
              <div className="text-xl font-extrabold text-gray-900 mt-0.5 tabular-nums">
                {scoredLeads.length}
              </div>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <div className="text-[11px] font-semibold text-emerald-800 uppercase">High Priority</div>
              <div className="text-xl font-extrabold text-emerald-700 mt-0.5 tabular-nums">
                {scoredLeads.filter((l) => l.priority === 'High Priority').length}
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-[11px] font-semibold text-blue-800 uppercase">Medium Priority</div>
              <div className="text-xl font-extrabold text-blue-700 mt-0.5 tabular-nums">
                {scoredLeads.filter((l) => l.priority === 'Medium Priority').length}
              </div>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <div className="text-[11px] font-semibold text-amber-800 uppercase">Needs Review</div>
              <div className="text-xl font-extrabold text-amber-700 mt-0.5 tabular-nums">
                {scoredLeads.filter((l) => l.priority === 'Needs Review' || l.needs_review).length}
              </div>
            </div>
          </div>

          {/* Scored Results Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-xs text-gray-700 divide-y divide-gray-200">
              <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-2.5 px-3">Lead / Company</th>
                  <th className="py-2.5 px-3 text-center">Score</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Prescribed Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scoredLeads.slice(0, 10).map((l, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <div className="font-bold text-gray-900">{l.name}</div>
                      <div className="text-[11px] text-gray-500">{l.company}</div>
                    </td>
                    <td className="py-2 px-3 text-center tabular-nums font-extrabold text-gray-900">
                      {l.score}
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-bold text-[11px]">{l.priority}</span>
                    </td>
                    <td className="py-2 px-3 tabular-nums text-gray-600 font-semibold">
                      {Math.round(l.confidence * 100)}%
                    </td>
                    <td className="py-2 px-3 text-gray-700 truncate max-w-sm">
                      {l.recommended_action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
