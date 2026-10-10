export type PriorityLevel = 'High Priority' | 'Medium Priority' | 'Low Priority' | 'Needs Review';

export type ReviewStatus = 'Pending' | 'Approved' | 'Rejected' | 'Overridden';

export interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  industry: string;
  company_size: string;
  budget: number;
  urgency: string;
  engagement: string;
  source: string;
  score: number;
  priority: PriorityLevel;
  confidence: number;
  recommended_action: string;
  needs_review: boolean;
  positive_factors: string[];
  negative_factors: string[];
  review_reason?: string;
  status: string;
  rules_score?: number;
  ml_score?: number;
  created_at: string;
  updated_at: string;
}

export interface LeadInput {
  name: string;
  email: string;
  company: string;
  industry: string;
  company_size: string;
  budget: number;
  urgency: string;
  engagement: string;
  source: string;
}

export interface ScoringResult {
  score: number;
  priority: PriorityLevel;
  confidence: number;
  rules_score: number;
  ml_score: number;
  key_factors: string[];
  positive_factors: string[];
  negative_factors: string[];
  recommended_action: string;
  needs_review: boolean;
  review_reason: string;
}

export interface ReviewQueueItem {
  id: number;
  lead_id: number;
  reason: string;
  status: ReviewStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  lead?: Lead;
}

export interface UserFeedback {
  id: number;
  lead_id: number;
  original_score: number;
  original_priority: PriorityLevel;
  corrected_priority: PriorityLevel;
  feedback: string;
  created_at: string;
  lead_name?: string;
  company?: string;
}

export interface AnalyticsData {
  total_leads: number;
  high_priority_count: number;
  high_priority_pct: number;
  medium_priority_count: number;
  low_priority_count: number;
  needs_review_count: number;
  avg_score: number;
  hours_saved: number;
  model_accuracy: number;
  precision: number;
  recall: number;
  precision_at_k: number;
  avg_inference_time_ms: number;
  human_override_rate: number;
  pipeline_completion_rate: number;
  priority_distribution: { [key: string]: number };
  score_buckets: { [key: string]: number };
  industry_distribution: { [key: string]: number };
  source_distribution: { [key: string]: number };
}

export interface DriftMetric {
  feature: string;
  status: 'Normal' | 'Warning' | 'Drift Detected';
  psi_score: number;
  baseline_distribution: { [key: string]: number };
  current_distribution: { [key: string]: number };
  explanation: string;
}
