import React from 'react';
import {
  BarChart3,
  Cpu,
  Target,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AnalyticsData } from '../types/lead';

interface AnalyticsModelsProps {
  analytics: AnalyticsData | null;
}

export const AnalyticsModels: React.FC<AnalyticsModelsProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading ML evaluation & analytics...
      </div>
    );
  }

  const featureImportances = [
    { feature: 'Project Budget ($ USD)', weight: 32, note: 'Primary firmographic size signal' },
    { feature: 'Purchase Urgency Timeline', weight: 26, note: 'Strongest velocity & close rate indicator' },
    { feature: 'Digital Engagement Depth', weight: 20, note: 'Inbound intent signal (demos, webinars)' },
    { feature: 'Company Employee Headcount', weight: 12, note: 'ICP tier fit & expansion potential' },
    { feature: 'Acquisition Source Channel', weight: 6, note: 'Channel conversion baseline' },
    { feature: 'Industry Vertical', weight: 4, note: 'Sector qualification alignment' },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Notice Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#15803d] shrink-0" />
          <span>
            <strong>Simulated Portfolio Metrics:</strong> Model precision, recall, and benchmark statistics are derived from 5,000 synthetic enterprise leads for evaluation purposes.
          </span>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#15803d] bg-white/70 px-2 py-0.5 rounded border border-emerald-300 shrink-0">
          Model v1.2-gbm
        </span>
      </div>

      {/* Main ML Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Model Accuracy */}
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1">Accuracy</div>
          <div className="text-2xl font-extrabold text-[#15803d] tabular-nums">
            {analytics.model_accuracy}%
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Test holdout</div>
        </div>

        {/* Precision */}
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1">Precision</div>
          <div className="text-2xl font-extrabold text-gray-900 tabular-nums">
            {analytics.precision}%
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">High-tier purity</div>
        </div>

        {/* Recall */}
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1">Recall</div>
          <div className="text-2xl font-extrabold text-gray-900 tabular-nums">
            {analytics.recall}%
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">True lead capture</div>
        </div>

        {/* Precision@K */}
        <div className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-xs bg-emerald-50/30">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase mb-1">Precision@20%</div>
          <div className="text-2xl font-extrabold text-emerald-700 tabular-nums">
            {analytics.precision_at_k}%
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Top 20% tranche</div>
        </div>

        {/* Avg Inference Latency */}
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1">Latency</div>
          <div className="text-2xl font-extrabold text-gray-900 tabular-nums">
            {analytics.avg_inference_time_ms}ms
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Per-lead inference</div>
        </div>

        {/* Human Override Rate */}
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1">Override Rate</div>
          <div className="text-2xl font-extrabold text-gray-900 tabular-nums">
            {analytics.human_override_rate}%
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Human feedback</div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1">Completion</div>
          <div className="text-2xl font-extrabold text-gray-900 tabular-nums">
            {analytics.pipeline_completion_rate}%
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Ensemble resolved</div>
        </div>

        {/* Simulated Hours Saved */}
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1">Hours Saved</div>
          <div className="text-2xl font-extrabold text-[#15803d] tabular-nums">
            {analytics.hours_saved}h
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">SDR efficiency</div>
        </div>
      </div>

      {/* Comparison: Rules Baseline vs ML Model */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#15803d]" />
            <span>Rules-Based Baseline vs. Gradient Boosted ML Model</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Architectural comparison showing why a dual-engine ensemble outperforms either individual approach.
          </p>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-xs divide-y divide-gray-200">
            <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-600">
              <tr>
                <th className="py-3 px-4">Evaluation Dimension</th>
                <th className="py-3 px-4 text-gray-700">Rules-Based Baseline</th>
                <th className="py-3 px-4 text-[#15803d]">Gradient Boosting Model (GBM)</th>
                <th className="py-3 px-4 text-emerald-800">Ensemble Architecture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900">Scoring Formula</td>
                <td className="py-3 px-4">Deterministic weighted sum (0-140 raw scale)</td>
                <td className="py-3 px-4 font-semibold text-[#15803d]">Non-linear logit with interaction terms</td>
                <td className="py-3 px-4 font-bold text-gray-900">Weighted blend (65% ML + 35% Rules)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900">Interaction Handling</td>
                <td className="py-3 px-4">Additive only (linear independence)</td>
                <td className="py-3 px-4 text-[#15803d]">Captures Budget × Urgency & Source synergy</td>
                <td className="py-3 px-4">High accuracy on complex multi-signal leads</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900">Explainability</td>
                <td className="py-3 px-4">Direct points mapping</td>
                <td className="py-3 px-4">SHAP / Feature weights decomposition</td>
                <td className="py-3 px-4 font-bold text-emerald-700">Clear positive and negative factor sentences</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900">Accuracy (Holdout)</td>
                <td className="py-3 px-4 tabular-nums">76.2%</td>
                <td className="py-3 px-4 font-bold text-[#15803d] tabular-nums">89.4% (+13.2%)</td>
                <td className="py-3 px-4 font-bold text-gray-900 tabular-nums">91.8% (+15.6%)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900">Edge Case Handling</td>
                <td className="py-3 px-4">Rigid; susceptible to anomalous combos</td>
                <td className="py-3 px-4">Smooth continuous probability distribution</td>
                <td className="py-3 px-4 font-semibold text-amber-700">
                  Routes &Delta; &ge; 18 pt disagreements to Human Review
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Importance Weights */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#15803d]" />
            <span>Model Feature Importance & Signal Contributions</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Relative weight contribution assigned by the Gradient Boosting qualification classifier.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {featureImportances.map((item) => (
            <div key={item.feature} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-800">{item.feature}</span>
                <span className="tabular-nums font-semibold text-[#15803d]">{item.weight}% weight</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#15803d] h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.weight * 2.5}%` }}
                />
              </div>
              <div className="text-[11px] text-gray-400">{item.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
