import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { DriftMetric } from '../types/lead';
import { fetchDrift } from '../lib/api';

export const DriftMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<DriftMetric[]>([]);
  const [summary, setSummary] = useState<{
    overall_status: string;
    total_monitored_samples: number;
    baseline_sample_size: number;
    last_drift_check: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDrift = async () => {
    setLoading(true);
    try {
      const data = await fetchDrift();
      setMetrics(data.drift_metrics);
      setSummary(data.summary);
    } catch (err) {
      console.error('Failed to load drift data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrift();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-[#15803d]" />
              <span>Data Drift & Population Stability Monitor</span>
            </h2>
            {summary && (
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  summary.overall_status === 'Normal'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : summary.overall_status === 'Warning'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                Status: {summary.overall_status}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Tracks distribution shift between baseline training data (1,000 synthetic leads) and live pipeline intake using Population Stability Index (PSI).
          </p>
        </div>

        <button
          onClick={loadDrift}
          className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
          <span>Re-compute PSI</span>
        </button>
      </div>

      {/* Threshold Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Normal (PSI &lt; 0.10)</span>
          </div>
          <p className="text-gray-500 text-[11px]">
            No significant change in lead population. Model predictions remain calibrated.
          </p>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Warning (0.10 &le; PSI &lt; 0.25)</span>
          </div>
          <p className="text-gray-500 text-[11px]">
            Moderate shift detected in channel or firmographic proportions. Inspect acquisition mix.
          </p>
        </div>

        <div className="bg-white border border-red-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-red-800 mb-1">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>Drift Detected (PSI &ge; 0.25)</span>
          </div>
          <p className="text-gray-500 text-[11px]">
            Significant population divergence. Recommend triggering model re-training and threshold review.
          </p>
        </div>
      </div>

      {/* Drift Dimensions */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            <div className="animate-spin w-6 h-6 border-2 border-[#15803d] border-t-transparent rounded-full mx-auto mb-2" />
            Calculating Population Stability Indices...
          </div>
        ) : (
          metrics.map((m) => {
            const isNormal = m.status === 'Normal';
            const isWarning = m.status === 'Warning';

            const allKeys = Array.from(
              new Set([
                ...Object.keys(m.baseline_distribution || {}),
                ...Object.keys(m.current_distribution || {}),
              ])
            ).slice(0, 6);

            return (
              <div
                key={m.feature}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{m.feature}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{m.explanation}</p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs text-gray-400 font-medium">
                      PSI: <strong className="text-gray-800 tabular-nums">{m.psi_score}</strong>
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isNormal
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>

                {/* Distribution comparison bars */}
                <div className="space-y-2.5 pt-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
                    <span>Category Bucket</span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-gray-300" /> Baseline Training
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-[#15803d]" /> Current Live Intake
                      </span>
                    </div>
                  </div>

                  {allKeys.map((key) => {
                    const basePct = m.baseline_distribution?.[key] || 0;
                    const curPct = m.current_distribution?.[key] || 0;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium text-gray-700">
                          <span className="font-semibold">{key}</span>
                          <span className="tabular-nums text-gray-500">
                            Base: {basePct}% · Live: <strong className="text-gray-900">{curPct}%</strong>
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gray-400 h-full rounded-full"
                              style={{ width: `${Math.min(100, basePct * 2)}%` }}
                            />
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#15803d] h-full rounded-full"
                              style={{ width: `${Math.min(100, curPct * 2)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
