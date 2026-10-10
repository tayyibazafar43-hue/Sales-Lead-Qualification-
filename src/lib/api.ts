import { Lead, LeadInput, AnalyticsData, DriftMetric, ReviewQueueItem, ScoringResult } from '../types/lead';

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function fetchHealth(): Promise<{ status: string; engine: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to fetch health');
  return res.json();
}

export async function fetchLeads(params?: {
  search?: string;
  priority?: string;
  industry?: string;
  source?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}): Promise<{ leads: Lead[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.priority && params.priority !== 'All') query.set('priority', params.priority);
  if (params?.industry && params.industry !== 'All') query.set('industry', params.industry);
  if (params?.source && params.source !== 'All') query.set('source', params.source);
  if (params?.sortBy) query.set('sortBy', params.sortBy);
  if (params?.sortOrder) query.set('sortOrder', params.sortOrder);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/api/leads?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch leads');
  return res.json();
}

export async function fetchLeadById(id: number): Promise<Lead & { scoring_history?: any[]; feedback_history?: any[] }> {
  const res = await fetch(`${API_BASE}/api/leads/${id}`);
  if (!res.ok) throw new Error('Lead not found');
  return res.json();
}

export async function createLead(lead: LeadInput): Promise<Lead> {
  const res = await fetch(`${API_BASE}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create lead');
  }
  return res.json();
}

export async function updateLead(id: number, updates: Partial<LeadInput>): Promise<Lead> {
  const res = await fetch(`${API_BASE}/api/leads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update lead');
  return res.json();
}

export async function deleteLead(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/leads/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete lead');
}

export async function scoreLeadDryRun(lead: LeadInput): Promise<ScoringResult & { inference_time_ms?: number }> {
  const res = await fetch(`${API_BASE}/api/leads/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  });
  if (!res.ok) throw new Error('Failed to score lead');
  return res.json();
}

export async function bulkScoreLeads(leads: LeadInput[]): Promise<{
  success: boolean;
  count: number;
  processing_time_ms: number;
  leads: Lead[];
}> {
  const res = await fetch(`${API_BASE}/api/leads/bulk-score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leads }),
  });
  if (!res.ok) throw new Error('Failed to bulk score leads');
  return res.json();
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch(`${API_BASE}/api/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchReviewQueue(): Promise<{ reviews: ReviewQueueItem[] }> {
  const res = await fetch(`${API_BASE}/api/reviews`);
  if (!res.ok) throw new Error('Failed to fetch review queue');
  return res.json();
}

export async function approveReview(reviewId: number): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/api/reviews/${reviewId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewed_by: 'Sales Operations' }),
  });
  if (!res.ok) throw new Error('Failed to approve review');
  return res.json();
}

export async function submitReviewFeedback(
  targetId: number,
  feedback: { corrected_priority: string; feedback: string; reviewed_by?: string },
  isLeadId = false
): Promise<{ success: boolean; message: string }> {
  const endpoint = isLeadId ? `${API_BASE}/api/leads/${targetId}/feedback` : `${API_BASE}/api/reviews/${targetId}/feedback`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedback),
  });
  if (!res.ok) throw new Error('Failed to submit feedback');
  return res.json();
}

export async function fetchDrift(): Promise<{
  drift_metrics: DriftMetric[];
  summary: { overall_status: string; total_monitored_samples: number; baseline_sample_size: number; last_drift_check: string };
}> {
  const res = await fetch(`${API_BASE}/api/drift`);
  if (!res.ok) throw new Error('Failed to fetch drift metrics');
  return res.json();
}

export async function resetDemoData(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/api/reset-demo`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset demo data');
  return res.json();
}
