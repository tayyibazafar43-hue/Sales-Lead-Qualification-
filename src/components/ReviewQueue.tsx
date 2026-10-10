import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building2,
  DollarSign,
  ArrowRight,
  RefreshCw,
  ThumbsUp,
  UserCheck,
} from 'lucide-react';
import { ReviewQueueItem, PriorityLevel } from '../types/lead';
import { fetchReviewQueue, approveReview, submitReviewFeedback } from '../lib/api';

interface ReviewQueueProps {
  onReviewResolved: () => void;
  onSelectLeadById: (leadId: number) => void;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({
  onReviewResolved,
  onSelectLeadById,
}) => {
  const [reviews, setReviews] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOverrideId, setActiveOverrideId] = useState<number | null>(null);
  const [overridePriority, setOverridePriority] = useState<PriorityLevel>('High Priority');
  const [operatorNotes, setOperatorNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await fetchReviewQueue();
      setReviews(data.reviews);
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleApprove = async (reviewId: number) => {
    setActionLoading(true);
    try {
      await approveReview(reviewId);
      await loadQueue();
      onReviewResolved();
    } catch (err) {
      alert('Failed to approve review.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOverrideSubmit = async (reviewId: number) => {
    setActionLoading(true);
    try {
      await submitReviewFeedback(reviewId, {
        corrected_priority: overridePriority,
        feedback: operatorNotes || `Priority adjusted to ${overridePriority} via Review Queue.`,
        reviewed_by: 'Sales Operations Specialist',
      });
      setActiveOverrideId(null);
      setOperatorNotes('');
      await loadQueue();
      onReviewResolved();
    } catch (err) {
      alert('Failed to submit override.');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingReviews = reviews.filter((r) => r.status === 'Pending');
  const resolvedReviews = reviews.filter((r) => r.status !== 'Pending');

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-[#15803d]" />
              <span>Human Review Queue</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              {pendingReviews.length} Pending Cases
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Human-in-the-loop triage for ambiguous leads, boundary scores (48-52), data anomalies, or model-rules disagreements.
          </p>
        </div>

        <button
          onClick={loadQueue}
          className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Pending Items List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Pending Reviews ({pendingReviews.length})
        </h3>

        {loading ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            <div className="animate-spin w-6 h-6 border-2 border-[#15803d] border-t-transparent rounded-full mx-auto mb-2" />
            Loading review queue from SQLite...
          </div>
        ) : pendingReviews.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#15803d] flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">Review Queue Cleared</h4>
            <p className="text-xs text-gray-500 mt-1">
              All high-confidence qualifications have been automatically processed with zero human exceptions pending.
            </p>
          </div>
        ) : (
          pendingReviews.map((item) => {
            const lead = item.lead;
            if (!lead) return null;
            const isEditing = activeOverrideId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white border border-amber-200 rounded-xl p-5 shadow-xs space-y-4"
              >
                {/* Top Row: Lead Info & Trigger Reason */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex flex-col items-center justify-center font-extrabold text-base text-amber-900 tabular-nums shrink-0">
                      <span>{lead.score}</span>
                      <span className="text-[9px] font-medium leading-none text-gray-600">/100</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-gray-900">{lead.name}</h4>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs font-semibold text-gray-700">{lead.company}</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          {lead.priority}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-gray-500 mt-1">
                        <span>{lead.industry}</span>
                        <span>·</span>
                        <span>{lead.company_size}</span>
                        <span>·</span>
                        <span className="font-bold text-gray-900 tabular-nums">${lead.budget.toLocaleString()}</span>
                        <span>·</span>
                        <span className="text-emerald-700 font-medium">{lead.source}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dual engine scores */}
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 text-xs text-center shrink-0">
                    <div className="px-2">
                      <div className="text-[10px] text-gray-500 uppercase">Rules</div>
                      <div className="font-bold text-gray-800 tabular-nums">{lead.rules_score ?? 50}</div>
                    </div>
                    <div className="border-l border-gray-200 h-6" />
                    <div className="px-2">
                      <div className="text-[10px] text-gray-500 uppercase">ML Model</div>
                      <div className="font-bold text-[#15803d] tabular-nums">{lead.ml_score ?? 50}</div>
                    </div>
                    <div className="border-l border-gray-200 h-6" />
                    <div className="px-2">
                      <div className="text-[10px] text-gray-500 uppercase">Confidence</div>
                      <div className="font-bold text-gray-800 tabular-nums">{Math.round(lead.confidence * 100)}%</div>
                    </div>
                  </div>
                </div>

                {/* Trigger banner */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Review Trigger:</strong> {item.reason}
                  </div>
                </div>

                {/* Prescribed action */}
                <div className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-800">System Recommendation: </span>
                  {lead.recommended_action}
                </div>

                {/* Override Form (if toggled) */}
                {isEditing ? (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                    <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Override Priority & Record Decision
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-gray-500 block mb-1">New Priority</label>
                        <select
                          value={overridePriority}
                          onChange={(e) => setOverridePriority(e.target.value as PriorityLevel)}
                          className="w-full text-xs font-semibold border border-gray-300 rounded-lg p-2 bg-white"
                        >
                          <option value="High Priority">High Priority</option>
                          <option value="Medium Priority">Medium Priority</option>
                          <option value="Low Priority">Low Priority</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-gray-500 block mb-1">Qualification Feedback</label>
                        <input
                          type="text"
                          placeholder="State why model was overridden..."
                          value={operatorNotes}
                          onChange={(e) => setOperatorNotes(e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setActiveOverrideId(null)}
                        className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleOverrideSubmit(item.id)}
                        disabled={actionLoading}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-[#15803d] hover:bg-[#166534] rounded-lg transition-colors"
                      >
                        {actionLoading ? 'Saving...' : 'Confirm Override'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Action Buttons */
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => onSelectLeadById(lead.id)}
                      className="text-xs font-semibold text-[#15803d] hover:underline"
                    >
                      View Complete Profile →
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveOverrideId(item.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors"
                      >
                        Change Priority
                      </button>

                      <button
                        onClick={() => handleApprove(item.id)}
                        disabled={actionLoading}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#15803d] hover:bg-[#166534] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Current Score</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Resolved History */}
      {resolvedReviews.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Recently Resolved Cases ({resolvedReviews.length})
          </h3>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-100 text-xs">
              {resolvedReviews.slice(0, 5).map((r) => (
                <div key={r.id} className="p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-gray-900">{r.lead?.name} ({r.lead?.company})</div>
                    <div className="text-[11px] text-gray-500">Reason: {r.reason}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {r.status}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-0.5">By {r.reviewed_by || 'Operator'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
