import React, { useState } from 'react';
import {
  X,
  Building2,
  Mail,
  DollarSign,
  Clock,
  Activity,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Send,
  Trash2,
  ExternalLink,
  ThumbsUp,
  Sparkles,
} from 'lucide-react';
import { Lead, PriorityLevel } from '../types/lead';
import { submitReviewFeedback, deleteLead } from '../lib/api';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onLeadUpdated,
}) => {
  if (!lead) return null;

  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>(lead.priority);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleOverridePriority = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await submitReviewFeedback(
        lead.id,
        {
          corrected_priority: selectedPriority,
          feedback: feedbackNote || `Priority adjusted to ${selectedPriority} by sales operator.`,
          reviewed_by: 'Sales Operations',
        },
        true // isLeadId
      );
      setFeedbackSuccess(true);
      setTimeout(() => {
        onLeadUpdated();
        onClose();
      }, 1000);
    } catch (err) {
      alert('Failed to update priority. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete lead for "${lead.name}" (${lead.company})?`)) {
      return;
    }
    setDeleting(true);
    try {
      await deleteLead(lead.id);
      onLeadUpdated();
      onClose();
    } catch (err) {
      alert('Failed to delete lead.');
    } finally {
      setDeleting(false);
    }
  };

  const isHigh = lead.priority === 'High Priority';
  const isMed = lead.priority === 'Medium Priority';
  const isReview = lead.priority === 'Needs Review';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-extrabold text-lg tabular-nums shadow-xs ${
                isHigh
                  ? 'bg-[#15803d] text-white'
                  : isReview
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              <span>{lead.score}</span>
              <span className="text-[10px] font-medium leading-none opacity-80">/100</span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900">{lead.name}</h3>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isHigh
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : isReview
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}
                >
                  {lead.priority}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                <span>{lead.company}</span>
                <span className="text-gray-300">·</span>
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-500 font-normal">{lead.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Prescribed Action Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#15803d] uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-[#15803d]" />
              <span>Recommended Sales Next Action</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{lead.recommended_action}</p>
          </div>

          {/* Section 2: Firmographics & Engagement Parameters */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
              Firmographics & Signals
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <span className="text-gray-500 block">Industry</span>
                <span className="font-semibold text-gray-800 mt-0.5 block">{lead.industry}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <span className="text-gray-500 block">Company Size</span>
                <span className="font-semibold text-gray-800 mt-0.5 block">{lead.company_size}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <span className="text-gray-500 block">Budget Allocation</span>
                <span className="font-bold text-[#15803d] mt-0.5 block tabular-nums">
                  ${lead.budget.toLocaleString()}
                </span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <span className="text-gray-500 block">Timeline Urgency</span>
                <span className="font-semibold text-gray-800 mt-0.5 block">{lead.urgency}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <span className="text-gray-500 block">Engagement Depth</span>
                <span className="font-semibold text-gray-800 mt-0.5 block">{lead.engagement}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <span className="text-gray-500 block">Acquisition Source</span>
                <span className="font-semibold text-gray-800 mt-0.5 block">{lead.source}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Explainability Breakdown (Positive & Negative Drivers) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Positive Qualification Drivers</span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-700">
                {lead.positive_factors && lead.positive_factors.length > 0 ? (
                  lead.positive_factors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#15803d] font-bold">✓</span>
                      <span>{factor}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400 italic">No specific positive drivers identified.</li>
                )}
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Negative or Restricting Factors</span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-700">
                {lead.negative_factors && lead.negative_factors.length > 0 ? (
                  lead.negative_factors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">✕</span>
                      <span>{factor}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400 italic">No restricting qualification blockers.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Section 4: Dual-Engine Audit (Rules vs ML Model) */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-800 uppercase tracking-wider">
                Scoring Engine Dissection
              </span>
              <span className="text-gray-500 font-medium">
                Confidence: <strong className="text-gray-800">{Math.round(lead.confidence * 100)}%</strong>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-white p-2 rounded-lg border border-gray-200">
                <div className="text-gray-500 text-[11px]">Rules Baseline</div>
                <div className="text-base font-bold text-gray-800 tabular-nums">
                  {lead.rules_score ?? Math.round(lead.score * 0.95)}
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-200">
                <div className="text-gray-500 text-[11px]">ML Model (GBM)</div>
                <div className="text-base font-bold text-[#15803d] tabular-nums">
                  {lead.ml_score ?? lead.score}
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-200">
                <div className="text-gray-500 text-[11px]">Ensemble Final</div>
                <div className="text-base font-bold text-gray-900 tabular-nums">{lead.score}</div>
              </div>
            </div>
            {lead.review_reason && (
              <p className="mt-2.5 text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 font-medium">
                ⚠ Review Trigger: {lead.review_reason}
              </p>
            )}
          </div>

          {/* Section 5: Human-in-the-Loop Override Form */}
          <form onSubmit={handleOverridePriority} className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Human Override & Qualification Feedback
              </label>
              {feedbackSuccess && (
                <span className="text-xs font-bold text-[#15803d] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Adjust Priority Tier</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as PriorityLevel)}
                  className="w-full text-xs font-semibold border border-gray-300 rounded-lg p-2 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#15803d]"
                >
                  <option value="High Priority">High Priority</option>
                  <option value="Medium Priority">Medium Priority</option>
                  <option value="Low Priority">Low Priority</option>
                  <option value="Needs Review">Needs Review</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Operator Qualification Note</label>
                <input
                  type="text"
                  placeholder="e.g. Budget confirmed via VP call..."
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#15803d]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead</span>
              </button>

              <button
                type="submit"
                disabled={submittingFeedback}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#15803d] hover:bg-[#166534] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingFeedback ? 'Updating...' : 'Save Override'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
