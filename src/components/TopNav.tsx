import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Upload,
  BarChart3,
  ClipboardCheck,
  TrendingDown,
  Settings as SettingsIcon,
  Menu,
  X,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'leads'
  | 'add-lead'
  | 'bulk-upload'
  | 'analytics'
  | 'reviews'
  | 'drift'
  | 'settings';

interface TopNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pendingReviewsCount?: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
  pendingReviewsCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: TabType; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads Directory', icon: Users },
    { id: 'add-lead', label: 'Add Lead', icon: UserPlus },
    { id: 'bulk-upload', label: 'Bulk Upload', icon: Upload },
    { id: 'analytics', label: 'Analytics & Models', icon: BarChart3 },
    {
      id: 'reviews',
      label: 'Review Queue',
      icon: ClipboardCheck,
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
    },
    { id: 'drift', label: 'Drift Monitor', icon: TrendingDown },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleNavClick = (id: TabType) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="w-full bg-[#050b18]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13">
          {/* Desktop Horizontal Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2 h-full overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs lg:text-sm font-semibold rounded-md transition-all relative whitespace-nowrap ${
                    isActive
                      ? 'text-emerald-300 bg-emerald-950/50 border-b-2 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active page indicator title on mobile */}
          <div className="flex md:hidden items-center">
            <span className="text-sm font-semibold text-white">
              {navItems.find((n) => n.id === activeTab)?.label}
            </span>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#050b18]/95 backdrop-blur-md px-2 pt-2 pb-3 space-y-1 shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-semibold'
                    : 'text-slate-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
