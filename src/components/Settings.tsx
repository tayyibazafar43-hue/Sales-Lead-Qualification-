import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Database,
  Cpu,
  RefreshCw,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Code2,
  ExternalLink,
} from 'lucide-react';
import { resetDemoData } from '../lib/api';

interface SettingsProps {
  onDataReset: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onDataReset }) => {
  const [highThreshold, setHighThreshold] = useState(75);
  const [medThreshold, setMedThreshold] = useState(50);
  const [reviewConfidence, setReviewConfidence] = useState(70);
  const [modelVersion, setModelVersion] = useState('v1.2-gbm');
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetDatabase = async () => {
    if (!confirm('Reset SQLite database and reseed 100+ fresh synthetic demo leads?')) {
      return;
    }
    setResetting(true);
    try {
      await resetDemoData();
      setResetSuccess(true);
      onDataReset();
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (err) {
      alert('Failed to reset demo data.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-[#15803d]" />
          <span>System & Engine Settings</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Configure qualification thresholds, model inference parameters, and database state.
        </p>
      </div>

      {/* Threshold Configuration */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#15803d]" />
          <span>Qualification Cutoff Thresholds</span>
        </h3>

        <div className="space-y-4 pt-1">
          {/* High Priority Cutoff */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-gray-700">High Priority Minimum Score</span>
              <span className="font-bold text-[#15803d] tabular-nums">{highThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="60"
              max="90"
              value={highThreshold}
              onChange={(e) => setHighThreshold(Number(e.target.value))}
              className="w-full accent-[#15803d]"
            />
            <span className="text-[11px] text-gray-400">
              Leads scoring at or above this threshold receive immediate AE routing.
            </span>
          </div>

          {/* Medium Priority Cutoff */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-gray-700">Medium Priority Minimum Score</span>
              <span className="font-bold text-gray-800 tabular-nums">{medThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="30"
              max="65"
              value={medThreshold}
              onChange={(e) => setMedThreshold(Number(e.target.value))}
              className="w-full accent-[#15803d]"
            />
            <span className="text-[11px] text-gray-400">
              Leads between this and High priority are routed to the 14-day SDR nurture sequence.
            </span>
          </div>

          {/* Review Confidence Threshold */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-gray-700">Review Trigger Confidence Floor</span>
              <span className="font-bold text-amber-700 tabular-nums">{reviewConfidence}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="85"
              value={reviewConfidence}
              onChange={(e) => setReviewConfidence(Number(e.target.value))}
              className="w-full accent-amber-600"
            />
            <span className="text-[11px] text-gray-400">
              Scoring inferences below this confidence automatically route to Human Review.
            </span>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#15803d]" />
          <span>Active ML Model Version</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div
            onClick={() => setModelVersion('v1.2-gbm')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              modelVersion === 'v1.2-gbm'
                ? 'border-[#15803d] bg-green-50/50 shadow-xs'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gray-900">v1.2-gbm (Active Production)</span>
              {modelVersion === 'v1.2-gbm' && (
                <span className="text-[10px] font-bold text-[#15803d] bg-green-100 px-1.5 py-0.5 rounded">
                  Selected
                </span>
              )}
            </div>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              Calibrated Gradient Boosting Classifier with interaction terms & non-linear synergy modeling. Holdout accuracy: 89.4%.
            </p>
          </div>

          <div
            onClick={() => setModelVersion('v1.1-logreg')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              modelVersion === 'v1.1-logreg'
                ? 'border-[#15803d] bg-green-50/50 shadow-xs'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gray-900">v1.1-logreg (Baseline)</span>
              {modelVersion === 'v1.1-logreg' && (
                <span className="text-[10px] font-bold text-[#15803d] bg-green-100 px-1.5 py-0.5 rounded">
                  Selected
                </span>
              )}
            </div>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              Regularized Logistic Regression model. Linear logit without higher-order interaction features. Holdout accuracy: 82.1%.
            </p>
          </div>
        </div>
      </div>

      {/* Database State & Demo Reset */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-[#15803d]" />
          <span>Local Persistence & Demo Data Reset</span>
        </h3>
        <p className="text-xs text-gray-500">
          LeadMatrix persists all leads, reviews, and scoring results in local SQLite (<code className="text-gray-700 bg-gray-100 px-1 py-0.5 rounded text-[11px]">leadmatrix.db</code>).
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div>
            <div className="text-xs font-bold text-gray-800">Reseed Synthetic Demo Portfolio</div>
            <div className="text-[11px] text-gray-400">
              Clears and generates 100+ fresh synthetic leads with complete historical scoring.
            </div>
          </div>

          <button
            onClick={handleResetDatabase}
            disabled={resetting}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#15803d] hover:bg-[#166534] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Reseeding...' : 'Reset & Reseed Demo Data'}</span>
          </button>
        </div>

        {resetSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
            <span>Database successfully reset and reseeded with 100+ synthetic leads.</span>
          </div>
        )}
      </div>
    </div>
  );
};
