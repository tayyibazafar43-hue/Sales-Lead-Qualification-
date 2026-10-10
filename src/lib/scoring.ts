import { LeadInput, PriorityLevel, ScoringResult } from '../types/lead';

// Industry scoring multipliers
export const INDUSTRY_WEIGHTS: Record<string, number> = {
  'Tech/SaaS': 10,
  'Financial Services': 10,
  'Healthcare': 9,
  'Manufacturing': 7,
  'Retail & E-commerce': 6,
  'Education': 5,
  'Professional Services': 7,
  'Other': 4,
};

// Source quality scores
export const SOURCE_WEIGHTS: Record<string, number> = {
  'Inbound Demo': 15,
  'Direct Referral': 15,
  'Organic Search': 10,
  'Paid Campaign': 8,
  'Outbound SDR': 6,
  'Cold List / Event': 3,
};

// Urgency scoring points
export const URGENCY_WEIGHTS: Record<string, number> = {
  'Immediate (< 1 mo)': 25,
  'Short-term (1-3 mos)': 18,
  'Medium-term (3-6 mos)': 10,
  'Exploratory (6+ mos)': 3,
};

// Engagement scoring points
export const ENGAGEMENT_WEIGHTS: Record<string, number> = {
  'High (Demo / Webinar)': 25,
  'Medium (3+ Content Downloads)': 15,
  'Low (Newsletter / Single Page)': 5,
};

// Company size scoring points
export const SIZE_WEIGHTS: Record<string, number> = {
  '1000+ employees': 30,
  '201-1000 employees': 25,
  '51-200 employees': 18,
  '11-50 employees': 12,
  '1-10 employees': 5,
};

export function calculateBudgetScore(budget: number): number {
  if (budget >= 150000) return 35;
  if (budget >= 75000) return 28;
  if (budget >= 30000) return 20;
  if (budget >= 10000) return 12;
  return 5;
}

/**
 * 1. Rules-Based Scoring Baseline
 * Transparent, deterministic weighted sum normalized to 0-100.
 * Max raw points: 35 (budget) + 30 (size) + 25 (urgency) + 25 (engagement) + 15 (source) + 10 (industry) = 140 max raw points.
 */
export function calculateRulesScore(lead: LeadInput): number {
  const budgetPts = calculateBudgetScore(lead.budget);
  const sizePts = SIZE_WEIGHTS[lead.company_size] ?? 10;
  const urgencyPts = URGENCY_WEIGHTS[lead.urgency] ?? 10;
  const engagementPts = ENGAGEMENT_WEIGHTS[lead.engagement] ?? 10;
  const sourcePts = SOURCE_WEIGHTS[lead.source] ?? 7;
  const industryPts = INDUSTRY_WEIGHTS[lead.industry] ?? 5;

  const raw = budgetPts + sizePts + urgencyPts + engagementPts + sourcePts + industryPts;
  // Normalize 0 - 140 to 0 - 100
  const normalized = Math.min(100, Math.max(0, Math.round((raw / 140) * 100)));
  return normalized;
}

/**
 * 2. Machine Learning Model (Calibrated Logistic Regression / Gradient Boosting emulator)
 * Applies non-linear interaction terms:
 * - Budget × Urgency synergy
 * - High Engagement × Inbound Source multiplier
 * - Small budget penalty on enterprise sizes (budget-size mismatch)
 */
export function calculateMLScore(lead: LeadInput): { mlScore: number; confidence: number } {
  // Feature transformations
  const budgetNorm = Math.min(1, Math.log10(Math.max(1000, lead.budget)) / 5.5); // 0.5 to 1.0
  const sizeIdx = lead.company_size.includes('1000+') ? 1.0 :
                  lead.company_size.includes('201-1000') ? 0.8 :
                  lead.company_size.includes('51-200') ? 0.6 :
                  lead.company_size.includes('11-50') ? 0.4 : 0.2;
                  
  const urgencyIdx = lead.urgency.includes('Immediate') ? 1.0 :
                     lead.urgency.includes('Short-term') ? 0.75 :
                     lead.urgency.includes('Medium-term') ? 0.45 : 0.15;
                     
  const engIdx = lead.engagement.includes('High') ? 1.0 :
                 lead.engagement.includes('Medium') ? 0.6 : 0.2;
                 
  const sourceIdx = (SOURCE_WEIGHTS[lead.source] ?? 7) / 15;
  const indIdx = (INDUSTRY_WEIGHTS[lead.industry] ?? 6) / 10;

  // Interaction term: High urgency + High budget boosts probability non-linearly
  const urgencyBudgetSynergy = urgencyIdx * budgetNorm * 0.25;
  
  // Interaction term: High engagement + Inbound source
  const intentSynergy = engIdx * sourceIdx * 0.20;

  // Calibrated linear logit for enterprise B2B conversion
  // Median lead inputs yield logit ~ 0.2 -> prob ~ 0.55 -> score ~ 55
  const logit = -3.8 + 
    (budgetNorm * 1.8) + 
    (urgencyIdx * 1.7) + 
    (engIdx * 1.5) + 
    (sizeIdx * 1.2) + 
    (sourceIdx * 0.9) + 
    (indIdx * 0.6) +
    urgencyBudgetSynergy +
    intentSynergy;

  // Sigmoid activation
  const prob = 1 / (1 + Math.exp(-logit));
  const mlScore = Math.min(100, Math.max(0, Math.round(prob * 100)));

  // Confidence estimation based on distance from 0.5 decision boundary and completeness
  const distFromBoundary = Math.abs(prob - 0.5) * 2; // 0 (borderline) to 1.0 (certain)
  const baseConfidence = 0.72 + (distFromBoundary * 0.25);
  const confidence = Math.min(0.98, Math.max(0.62, Math.round(baseConfidence * 100) / 100));

  return { mlScore, confidence };
}

/**
 * 3. Ensembled Score, Explainability & Decision Logic
 */
export function scoreLead(lead: LeadInput): ScoringResult {
  const rulesScore = calculateRulesScore(lead);
  const { mlScore, confidence: rawConfidence } = calculateMLScore(lead);

  // Ensemble: 60% ML + 40% Rules baseline
  const finalScore = Math.round((mlScore * 0.65) + (rulesScore * 0.35));

  // Determine review triggers
  const scoreDiff = Math.abs(mlScore - rulesScore);
  const isBorderline = finalScore >= 48 && finalScore <= 53;
  const isBudgetSizeMismatch = (lead.budget < 15000 && lead.company_size.includes('1000+')) || 
                               (lead.budget >= 150000 && lead.company_size.includes('1-10'));
  
  let needs_review = false;
  let review_reason = '';
  let confidence = rawConfidence;

  if (scoreDiff >= 18) {
    needs_review = true;
    review_reason = `High model-rules disagreement (Δ = ${scoreDiff} pts: ML ${mlScore} vs Rules ${rulesScore})`;
    confidence = Math.min(confidence, 0.68);
  } else if (isBorderline) {
    needs_review = true;
    review_reason = `Borderline score threshold (${finalScore}/100) near priority cutoff`;
    confidence = Math.min(confidence, 0.69);
  } else if (isBudgetSizeMismatch) {
    needs_review = true;
    review_reason = `Company size vs budget anomaly ($${lead.budget.toLocaleString()} for ${lead.company_size})`;
    confidence = Math.min(confidence, 0.71);
  }

  // Priority classification
  let priority: PriorityLevel = 'Low Priority';
  if (needs_review && (finalScore >= 50 && finalScore <= 78)) {
    priority = 'Needs Review';
  } else if (finalScore >= 75) {
    priority = 'High Priority';
  } else if (finalScore >= 50) {
    priority = 'Medium Priority';
  } else {
    priority = 'Low Priority';
  }

  // Explainability: Key Positive and Negative Factors
  const positive_factors: string[] = [];
  const negative_factors: string[] = [];

  // Budget
  if (lead.budget >= 75000) {
    positive_factors.push(`Substantial budget allocation ($${lead.budget.toLocaleString()})`);
  } else if (lead.budget < 15000) {
    negative_factors.push(`Limited budget tier ($${lead.budget.toLocaleString()})`);
  }

  // Urgency
  if (lead.urgency.includes('Immediate')) {
    positive_factors.push('Immediate implementation timeline (< 1 month)');
  } else if (lead.urgency.includes('Short-term')) {
    positive_factors.push('Near-term target deployment (1-3 months)');
  } else if (lead.urgency.includes('Exploratory')) {
    negative_factors.push('Long exploratory discovery horizon (6+ months)');
  }

  // Engagement
  if (lead.engagement.includes('High')) {
    positive_factors.push('High intent signal (Direct demo or webinar engagement)');
  } else if (lead.engagement.includes('Low')) {
    negative_factors.push('Low initial digital touchpoint depth (Newsletter/single visit)');
  }

  // Company size
  if (lead.company_size.includes('1000+') || lead.company_size.includes('201-1000')) {
    positive_factors.push(`Enterprise ICP profile (${lead.company_size})`);
  } else if (lead.company_size.includes('1-10')) {
    negative_factors.push(`Early-stage team size (${lead.company_size})`);
  }

  // Source
  if (lead.source === 'Inbound Demo' || lead.source === 'Direct Referral') {
    positive_factors.push(`High-conversion acquisition channel (${lead.source})`);
  } else if (lead.source === 'Cold List / Event') {
    negative_factors.push(`Cold outbound channel origin (${lead.source})`);
  }

  // Industry
  if (lead.industry === 'Tech/SaaS' || lead.industry === 'Financial Services' || lead.industry === 'Healthcare') {
    positive_factors.push(`Core target vertical (${lead.industry})`);
  }

  // Fallbacks if lists are empty
  if (positive_factors.length === 0) {
    positive_factors.push('Active lead submission in target market segment');
  }
  if (negative_factors.length === 0) {
    negative_factors.push('No critical qualification blockers identified');
  }

  const key_factors = [...positive_factors.slice(0, 2), ...negative_factors.slice(0, 1)];

  // Recommended Next Action
  let recommended_action = '';
  if (priority === 'High Priority') {
    recommended_action = 'Assign to Senior Account Executive for discovery call within 24 hours';
  } else if (priority === 'Medium Priority') {
    recommended_action = 'Enroll in 14-day SDR nurture sequence with tailored vertical case study';
  } else if (priority === 'Needs Review') {
    recommended_action = 'Hold automated outreach; manual review by Sales Operations Specialist';
  } else {
    recommended_action = 'Add to low-touch marketing product newsletter and quarterly check-in';
  }

  return {
    score: finalScore,
    priority,
    confidence,
    rules_score: rulesScore,
    ml_score: mlScore,
    key_factors,
    positive_factors,
    negative_factors,
    recommended_action,
    needs_review,
    review_reason,
  };
}
