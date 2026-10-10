import React, { useState } from 'react';
import {
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Building2,
  DollarSign,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { LeadInput, ScoringResult } from '../types/lead';
import { createLead, scoreLeadDryRun } from '../lib/api';

interface AddLeadProps {
  onLeadCreated: () => void;
  onNavigateDirectory: () => void;
}

export const AddLead: React.FC<AddLeadProps> = ({
  onLeadCreated,
  onNavigateDirectory,
}) => {
  const [formData, setFormData] = useState<LeadInput>({
    name: '',
    email: '',
    company: '',
    industry: 'Tech/SaaS',
    company_size: '51-200 employees',
    budget: 50000,
    urgency: 'Short-term (1-3 mos)',
    engagement: 'High (Demo / Webinar)',
    source: 'Inbound Demo',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.company.trim()) {
      setError('Please provide lead name, work email, and company.');
      return;
    }

    if (formData.budget < 0) {
      setError('Budget must be positive.');
      return;
    }

    setLoading(true);
    try {
      const result = await createLead(formData);
      setCreatedResult(result);
      onLeadCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to submit and score lead.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      company: '',
      industry: 'Tech/SaaS',
      company_size: '51-200 employees',
      budget: 50000,
      urgency: 'Short-term (1-3 mos)',
      engagement: 'High (Demo / Webinar)',
      source: 'Inbound Demo',
    });
    setCreatedResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#15803d]" />
          <span>Add New Sales Lead</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Ingest an individual inbound lead into the qualification engine. Triggers dual-engine rules & ML evaluation, explainability factor decomposition, and SQLite persistence.
        </p>
      </div>

      {createdResult ? (
        /* Success State */
        <div className="bg-white border border-emerald-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-[#15803d]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#15803d]">
                  Successfully Qualified & Persisted
                </span>
                <h3 className="text-xl font-bold text-gray-900">{createdResult.name}</h3>
                <p className="text-xs text-gray-500">{createdResult.company} · {createdResult.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] text-gray-500 font-semibold uppercase">Qualification Score</div>
                <div className="text-3xl font-extrabold text-[#15803d] tabular-nums">
                  {createdResult.score} <span className="text-sm text-gray-400 font-normal">/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Qualification Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200">
              <div className="text-[11px] text-gray-500 font-semibold uppercase">Priority Tier</div>
              <div className="text-base font-bold text-gray-900 mt-0.5">{createdResult.priority}</div>
            </div>
            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200">
              <div className="text-[11px] text-gray-500 font-semibold uppercase">Inference Confidence</div>
              <div className="text-base font-bold text-gray-900 mt-0.5 tabular-nums">
                {Math.round(createdResult.confidence * 100)}%
              </div>
            </div>
            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200">
              <div className="text-[11px] text-gray-500 font-semibold uppercase">Human Review Flag</div>
              <div className="text-base font-bold text-gray-900 mt-0.5">
                {createdResult.needs_review ? (
                  <span className="text-amber-600">Yes (Enqueued)</span>
                ) : (
                  <span className="text-emerald-700">No (Auto-approved)</span>
                )}
              </div>
            </div>
          </div>

          {/* Prescribed Next Action */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#15803d] uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-[#15803d]" />
              <span>Prescribed Sales Next Action</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{createdResult.recommended_action}</p>
          </div>

          {/* Explainability Factors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-2xs">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                Positive Qualification Factors
              </h4>
              <ul className="space-y-1 text-xs text-gray-700">
                {createdResult.positive_factors?.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#15803d] font-bold">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Restricting Factors
              </h4>
              <ul className="space-y-1 text-xs text-gray-700">
                {createdResult.negative_factors?.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">✕</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              + Add Another Lead
            </button>

            <button
              onClick={onNavigateDirectory}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#15803d] hover:bg-[#166534] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>View in Leads Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Lead Input Form */
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Jonathan Archer"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#15803d]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Work Email *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. j.archer@enterprise.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#15803d]"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Company *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Starfleet Logistics"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#15803d]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Industry */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Industry Vertical
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#15803d]"
              >
                <option value="Tech/SaaS">Tech/SaaS</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail & E-commerce">Retail & E-commerce</option>
                <option value="Education">Education</option>
                <option value="Professional Services">Professional Services</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Company Size */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Company Size
              </label>
              <select
                value={formData.company_size}
                onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#15803d]"
              >
                <option value="1000+ employees">1000+ employees</option>
                <option value="201-1000 employees">201-1000 employees</option>
                <option value="51-200 employees">51-200 employees</option>
                <option value="11-50 employees">11-50 employees</option>
                <option value="1-10 employees">1-10 employees</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Annual Budget ($ USD) *
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                required
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-[#15803d]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Urgency */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Purchase Urgency
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#15803d]"
              >
                <option value="Immediate (< 1 mo)">Immediate (&lt; 1 month)</option>
                <option value="Short-term (1-3 mos)">Short-term (1-3 months)</option>
                <option value="Medium-term (3-6 mos)">Medium-term (3-6 months)</option>
                <option value="Exploratory (6+ mos)">Exploratory (6+ months)</option>
              </select>
            </div>

            {/* Engagement */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Digital Engagement Depth
              </label>
              <select
                value={formData.engagement}
                onChange={(e) => setFormData({ ...formData, engagement: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#15803d]"
              >
                <option value="High (Demo / Webinar)">High (Demo / Webinar attended)</option>
                <option value="Medium (3+ Content Downloads)">Medium (3+ Content downloads)</option>
                <option value="Low (Newsletter / Single Page)">Low (Newsletter / single pageview)</option>
              </select>
            </div>

            {/* Source */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Lead Acquisition Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#15803d]"
              >
                <option value="Inbound Demo">Inbound Demo</option>
                <option value="Direct Referral">Direct Referral</option>
                <option value="Organic Search">Organic Search</option>
                <option value="Paid Campaign">Paid Campaign</option>
                <option value="Outbound SDR">Outbound SDR</option>
                <option value="Cold List / Event">Cold List / Event</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-gray-800 font-semibold"
            >
              Clear Form
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#15803d] hover:bg-[#166534] rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Dual-Engine ML Score...</span>
                </>
              ) : (
                <>
                  <span>Score & Ingest Lead</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
