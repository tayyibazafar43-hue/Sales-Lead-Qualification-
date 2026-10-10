import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TopNav, TabType } from './components/TopNav';
import { GalaxyBackground } from './components/GalaxyBackground';
import { CosmicForeground } from './components/CosmicForeground';
import { Dashboard } from './components/Dashboard';
import { LeadsDirectory } from './components/LeadsDirectory';
import { AddLead } from './components/AddLead';
import { BulkUpload } from './components/BulkUpload';
import { AnalyticsModels } from './components/AnalyticsModels';
import { ReviewQueue } from './components/ReviewQueue';
import { DriftMonitor } from './components/DriftMonitor';
import { Settings } from './components/Settings';
import { LeadDetailModal } from './components/LeadDetailModal';
import { Lead, AnalyticsData } from './types/lead';
import { fetchAnalytics, fetchLeads, fetchReviewQueue, fetchLeadById } from './lib/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      const [analyticsData, leadsData, reviewsData] = await Promise.all([
        fetchAnalytics(),
        fetchLeads({ limit: 15, sortBy: 'score', sortOrder: 'desc' }),
        fetchReviewQueue(),
      ]);

      setAnalytics(analyticsData);
      setRecentLeads(leadsData.leads);
      const pendingCount = reviewsData.reviews.filter((r) => r.status === 'Pending').length;
      setPendingReviewsCount(pendingCount);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectLeadById = async (leadId: number) => {
    try {
      const fullLead = await fetchLeadById(leadId);
      setSelectedLead(fullLead);
    } catch (err) {
      console.error('Error fetching lead file:', err);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-sans relative selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Deep Multicolor Animated Galaxy Background (Thousands of stars, nebulae, shooting stars) */}
      <GalaxyBackground />

      {/* 2. Interactive Foreground Cosmic Stardust, Sparkles & Mouse Ripple */}
      <CosmicForeground />

      {/* 3. Full-Width Green Header */}
      <div className="relative z-30">
        <Header inferenceTimeMs={analytics?.avg_inference_time_ms ?? 12.8} />
      </div>

      {/* 4. Horizontal Top Navigation (NO LEFT SIDEBAR) */}
      <div className="relative z-30">
        <TopNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingReviewsCount={pendingReviewsCount}
        />
      </div>

      {/* 5. Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-20">
        {activeTab === 'dashboard' && (
          <Dashboard
            analytics={analytics}
            recentLeads={recentLeads}
            onSelectLead={setSelectedLead}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'leads' && (
          <LeadsDirectory
            onSelectLead={setSelectedLead}
            onNavigateAddLead={() => setActiveTab('add-lead')}
          />
        )}

        {activeTab === 'add-lead' && (
          <AddLead
            onLeadCreated={loadData}
            onNavigateDirectory={() => setActiveTab('leads')}
          />
        )}

        {activeTab === 'bulk-upload' && (
          <BulkUpload
            onBatchProcessed={loadData}
            onNavigateDirectory={() => setActiveTab('leads')}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsModels analytics={analytics} />
        )}

        {activeTab === 'reviews' && (
          <ReviewQueue
            onReviewResolved={loadData}
            onSelectLeadById={handleSelectLeadById}
          />
        )}

        {activeTab === 'drift' && <DriftMonitor />}

        {activeTab === 'settings' && <Settings onDataReset={loadData} />}
      </main>

      {/* 6. Lead Detail Modal with Explainability & Human Override */}
      <div className="relative z-50">
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onLeadUpdated={loadData}
        />
      </div>

      {/* Quiet Enterprise Footer */}
      <footer className="w-full bg-[#050b18]/75 backdrop-blur-md border-t border-white/10 py-4 mt-auto relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">LeadMatrix</span>
            <span>·</span>
            <span className="text-slate-300">Sales Lead Qualification Engine</span>
            <span>·</span>
            <span className="text-slate-400">Multicolor Galaxy Engine</span>
          </div>
          <div>
            <span className="text-emerald-400 font-medium">Dual-Engine ML & Rules Ensemble v1.2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
