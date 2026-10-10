import React from 'react';
import { ShieldCheck, Activity, Cpu } from 'lucide-react';

interface HeaderProps {
  inferenceTimeMs?: number;
}

export const Header: React.FC<HeaderProps> = ({ inferenceTimeMs = 12.8 }) => {
  return (
    <header className="w-full bg-[#062414]/85 backdrop-blur-md text-white border-b border-emerald-500/25 shadow-[0_4px_24px_rgba(6,78,59,0.3)] relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Main Branding - Front & Prominent */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center font-extrabold text-white text-base tracking-wider shadow-[0_0_12px_rgba(52,211,153,0.3)]">
                LM
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2 drop-shadow-sm">
                LeadMatrix
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200/90 font-medium tracking-wide mt-0.5">
              Sales Lead Qualification Engine
            </p>
          </div>

          {/* Operational Indicators */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-emerald-100 font-medium">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0a351d]/70 border border-emerald-500/40 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span>Operational Triage Pipeline</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0a351d]/70 border border-emerald-500/40 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Simulated Portfolio Metrics</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0a351d]/70 border border-emerald-500/40 tabular-nums shadow-xs">
              <Cpu className="w-3.5 h-3.5 text-emerald-300" />
              <span>Model Inference: {inferenceTimeMs}ms</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
