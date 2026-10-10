import React from 'react';
import {
  Users,
  Flame,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Building2,
  DollarSign,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { AnalyticsData, Lead } from '../types/lead';

interface DashboardProps {
  analytics: AnalyticsData | null;
  recentLeads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onNavigate: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  analytics,
  recentLeads,
  onSelectLead,
  onNavigate,
}) => {
  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">
        <div className="animate-spin w-8 h-8 border-2 border-[#15803d] border-t-transparent rounded-full mx-auto mb-3" />
        Loading operational pipeline analytics...
      </div>
    );
  }

  // Find top priority triage leads
  const highPriorityLeads = recentLeads
    .filter((l) => l.priority === 'High Priority' || l.priority === 'Needs Review')
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const scoreBuckets = analytics.score_buckets || {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0,
  };
  const maxBucketCount = Math.max(1, ...Object.values(scoreBuckets));

  const industryDist = analytics.industry_distribution || {};
  const maxIndustryCount = Math.max(1, ...Object.values(industryDist));

  const sourceDist = analytics.source_distribution || {};
  const maxSourceCount = Math.max(1, ...Object.values(sourceDist));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Section Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Operational Triage Pipeline
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" /> Live
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time automated lead qualification, priority classification, and prescriptive sales actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('add-lead')}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#15803d] hover:bg-[#166534] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>+ Add New Lead</span>
          </button>
          <button
            onClick={() => onNavigate('bulk-upload')}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Bulk CSV Ingest</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (7 Cards as requested in Section 8) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* 1. Total Leads */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Leads</span>
            <Users className="w-4 h-4 text-[#15803d]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">
            {analytics.total_leads}
          </div>
          <div className="text-xs text-gray-500 mt-1">Ingested to date</div>
        </div>

        {/* 2. High Priority */}
        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>High Priority</span>
            <Flame className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tabular-nums">
            {analytics.high_priority_count}
          </div>
          <div className="text-xs text-emerald-700 font-medium mt-1">
            {analytics.high_priority_pct}% of pipeline
          </div>
        </div>

        {/* 3. Medium Priority */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Med Priority</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">
            {analytics.medium_priority_count}
          </div>
          <div className="text-xs text-gray-500 mt-1">SDR nurture queue</div>
        </div>

        {/* 4. Low Priority */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Low Priority</span>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-800 tabular-nums">
            {analytics.low_priority_count}
          </div>
          <div className="text-xs text-gray-500 mt-1">Automated nurture</div>
        </div>

        {/* 5. Needs Review */}
        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs bg-amber-50/30">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Needs Review</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 tabular-nums">
            {analytics.needs_review_count}
          </div>
          <div className="text-xs text-amber-700 font-medium mt-1">Pending approval</div>
        </div>

        {/* 6. Avg Lead Score */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Avg Lead Score</span>
            <Award className="w-4 h-4 text-[#15803d]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">
            {analytics.avg_score} <span className="text-xs text-gray-400 font-normal">/100</span>
          </div>
          <div className="text-xs text-[#15803d] font-medium mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +4.2 vs baseline
          </div>
        </div>

        {/* 7. Hours Saved */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Hours Saved</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tabular-nums">
            {analytics.hours_saved}h
          </div>
          <div className="text-xs text-gray-500 mt-1">Auto-triage efficiency</div>
        </div>
      </div>

      {/* Charts Grid (Section 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Leads by Priority Tier */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Leads by Priority Tier
              </h3>
              <p className="text-xs text-gray-500">Pipeline distribution by qualification priority</p>
            </div>
            <span className="text-xs font-medium text-gray-400 tabular-nums">
              Total: {analytics.total_leads}
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {[
              { label: 'High Priority', count: analytics.high_priority_count, color: 'bg-emerald-600', text: 'text-emerald-700' },
              { label: 'Medium Priority', count: analytics.medium_priority_count, color: 'bg-emerald-400', text: 'text-gray-700' },
              { label: 'Low Priority', count: analytics.low_priority_count, color: 'bg-gray-300', text: 'text-gray-600' },
              { label: 'Needs Review', count: analytics.needs_review_count, color: 'bg-amber-400', text: 'text-amber-700' },
            ].map((tier) => {
              const pct = analytics.total_leads > 0 ? Math.round((tier.count / analytics.total_leads) * 100) : 0;
              return (
                <div key={tier.label}>
                  <div className="flex items-center justify-between text-xs font-medium mb-1">
                    <span className="text-gray-700 font-semibold">{tier.label}</span>
                    <span className="tabular-nums text-gray-600">
                      {tier.count} leads ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${tier.color} transition-all duration-500`}
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Score Distribution (0-20, 21-40, 41-60, 61-80, 81-100) */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Score Distribution
              </h3>
              <p className="text-xs text-gray-500">Distribution of ensemble scores across 5 buckets</p>
            </div>
            <span className="text-xs font-semibold text-[#15803d] bg-green-50 px-2 py-0.5 rounded border border-green-200">
              Avg: {analytics.avg_score}/100
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 h-44 pt-4 px-2">
            {Object.entries(scoreBuckets).map(([bucket, count]) => {
              const heightPct = Math.round((count / maxBucketCount) * 100);
              const isHighBucket = bucket === '81-100' || bucket === '61-80';
              return (
                <div key={bucket} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-xs font-bold text-gray-700 tabular-nums">{count}</span>
                  <div className="w-full max-w-[48px] bg-gray-100 rounded-t-md h-full flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isHighBucket ? 'bg-[#15803d]' : 'bg-emerald-300'
                      }`}
                      style={{ height: `${Math.max(6, heightPct)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500 tabular-nums">{bucket}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Leads by Industry */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Leads by Industry
              </h3>
              <p className="text-xs text-gray-500">Sector concentration in current active pipeline</p>
            </div>
            <Building2 className="w-4 h-4 text-gray-400" />
          </div>

          <div className="space-y-2.5 pt-1">
            {Object.entries(industryDist).slice(0, 6).map(([ind, count]) => {
              const pct = analytics.total_leads > 0 ? Math.round((count / analytics.total_leads) * 100) : 0;
              return (
                <div key={ind}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-700 font-medium truncate max-w-[200px]">{ind}</span>
                    <span className="tabular-nums text-gray-500">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(3, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Acquisition Channels */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Acquisition Channels
              </h3>
              <p className="text-xs text-gray-500">Inbound vs outbound lead origin performance</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="space-y-2.5 pt-1">
            {Object.entries(sourceDist).slice(0, 6).map(([src, count]) => {
              const pct = analytics.total_leads > 0 ? Math.round((count / analytics.total_leads) * 100) : 0;
              return (
                <div key={src}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-700 font-medium truncate max-w-[200px]">{src}</span>
                    <span className="tabular-nums text-gray-500">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#15803d] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(3, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Priority Triage Feed (Section 9) */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">
                Priority Triage Feed
              </h3>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Action Required
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Ranked list answering: &ldquo;Which lead should I contact first, and why?&rdquo;
            </p>
          </div>

          <button
            onClick={() => onNavigate('leads')}
            className="text-xs font-semibold text-[#15803d] hover:text-[#166534] flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Leads Directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {highPriorityLeads.map((lead) => {
            const isHigh = lead.priority === 'High Priority';
            return (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="p-4 sm:p-5 hover:bg-gray-50/80 transition-colors cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Lead Core Info */}
                <div className="flex items-start gap-3 min-w-[280px]">
                  <div
                    className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center font-extrabold text-sm tabular-nums shrink-0 ${
                      isHigh
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    <span>{lead.score}</span>
                    <span className="text-[9px] font-medium leading-none text-gray-600">/100</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-gray-900 hover:text-[#15803d] transition-colors">
                        {lead.name}
                      </h4>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs font-semibold text-gray-700">{lead.company}</span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isHigh
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {lead.priority}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                      <span>{lead.industry}</span>
                      <span>·</span>
                      <span>{lead.company_size}</span>
                      <span>·</span>
                      <span className="font-semibold text-gray-800 tabular-nums">
                        ${lead.budget.toLocaleString()}
                      </span>
                      <span>·</span>
                      <span className="text-emerald-700 font-medium">{lead.source}</span>
                    </div>
                  </div>
                </div>

                {/* Center: Key Driver & Recommended Action */}
                <div className="flex-1 lg:max-w-md bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#15803d]" />
                    <span>Prescribed Action</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 leading-snug">
                    {lead.recommended_action}
                  </p>
                  {lead.positive_factors?.length > 0 && (
                    <p className="text-[11px] text-[#15803d] mt-1 font-medium truncate">
                      ✓ {lead.positive_factors[0]}
                    </p>
                  )}
                </div>

                {/* Right: Confidence & Action Button */}
                <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[11px] text-gray-500 font-medium">Confidence</div>
                    <div className="text-xs font-bold text-gray-800 tabular-nums">
                      {Math.round(lead.confidence * 100)}%
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLead(lead);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-[#15803d] hover:text-white bg-green-50 hover:bg-[#15803d] border border-green-200 rounded-md transition-colors whitespace-nowrap"
                  >
                    View Lead File
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
