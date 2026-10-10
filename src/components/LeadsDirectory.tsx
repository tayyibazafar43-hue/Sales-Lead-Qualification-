import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Eye,
  Plus,
  RefreshCw,
  Building2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Flame,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Lead, PriorityLevel } from '../types/lead';
import { fetchLeads } from '../lib/api';

interface LeadsDirectoryProps {
  onSelectLead: (lead: Lead) => void;
  onNavigateAddLead: () => void;
}

export const LeadsDirectory: React.FC<LeadsDirectoryProps> = ({
  onSelectLead,
  onNavigateAddLead,
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await fetchLeads({
        search,
        priority: priorityFilter,
        industry: industryFilter,
        source: sourceFilter,
        sortBy,
        sortOrder,
        page,
        limit,
      });
      setLeads(data.leads);
      setTotalLeads(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [search, priorityFilter, industryFilter, sourceFilter, sortBy, sortOrder, page, limit]);

  const toggleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = [
      'ID',
      'Name',
      'Email',
      'Company',
      'Industry',
      'Company Size',
      'Budget ($)',
      'Urgency',
      'Engagement',
      'Source',
      'Score',
      'Priority',
      'Confidence',
      'Recommended Action',
      'Status',
      'Created At',
    ];

    const rows = leads.map((l) => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      `"${l.company.replace(/"/g, '""')}"`,
      `"${l.industry}"`,
      `"${l.company_size}"`,
      l.budget,
      `"${l.urgency}"`,
      `"${l.engagement}"`,
      `"${l.source}"`,
      l.score,
      `"${l.priority}"`,
      l.confidence,
      `"${(l.recommended_action || '').replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${l.created_at}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leadmatrix_directory_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header and Controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Leads Directory</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Comprehensive registry of scored sales prospects with firmographics, qualification indices, and prescriptive actions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onNavigateAddLead}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#15803d] hover:bg-[#166534] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Lead</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-gray-100">
          {/* Search */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, company, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#15803d]"
            />
          </div>

          {/* Priority filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs font-medium border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#15803d]"
            >
              <option value="All">All Priorities</option>
              <option value="High Priority">High Priority</option>
              <option value="Medium Priority">Medium Priority</option>
              <option value="Low Priority">Low Priority</option>
              <option value="Needs Review">Needs Review</option>
            </select>
          </div>

          {/* Industry filter */}
          <div>
            <select
              value={industryFilter}
              onChange={(e) => {
                setIndustryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs font-medium border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#15803d]"
            >
              <option value="All">All Industries</option>
              <option value="Tech/SaaS">Tech/SaaS</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Retail & E-commerce">Retail & E-commerce</option>
              <option value="Education">Education</option>
              <option value="Professional Services">Professional Services</option>
            </select>
          </div>

          {/* Source filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs font-medium border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#15803d]"
            >
              <option value="All">All Sources</option>
              <option value="Inbound Demo">Inbound Demo</option>
              <option value="Direct Referral">Direct Referral</option>
              <option value="Organic Search">Organic Search</option>
              <option value="Paid Campaign">Paid Campaign</option>
              <option value="Outbound SDR">Outbound SDR</option>
              <option value="Cold List / Event">Cold List / Event</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 divide-y divide-gray-200">
            <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 select-none">
              <tr>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-3.5 cursor-pointer hover:text-gray-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Lead / Company</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 hidden md:table-cell">Firmographics</th>
                <th
                  onClick={() => toggleSort('budget')}
                  className="py-3 px-3 cursor-pointer hover:text-gray-900 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Budget</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 hidden lg:table-cell">Urgency / Intent</th>
                <th
                  onClick={() => toggleSort('score')}
                  className="py-3 px-3 cursor-pointer hover:text-gray-900 text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Score</span>
                    <ArrowUpDown className="w-3 h-3 text-[#15803d]" />
                  </div>
                </th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3 hidden xl:table-cell">Recommended Action</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <div className="animate-spin w-6 h-6 border-2 border-[#15803d] border-t-transparent rounded-full mx-auto mb-2" />
                    Querying leads from SQLite persistence...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No leads found matching current criteria. Try adjusting your search or filters.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isHigh = lead.priority === 'High Priority';
                  const isReview = lead.priority === 'Needs Review';
                  const isMed = lead.priority === 'Medium Priority';

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="hover:bg-gray-50/90 transition-colors cursor-pointer"
                    >
                      {/* Lead / Company */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-gray-900 hover:text-[#15803d]">
                          {lead.name}
                        </div>
                        <div className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
                          <span className="font-semibold text-gray-700">{lead.company}</span>
                          <span>·</span>
                          <span className="truncate max-w-[150px]">{lead.email}</span>
                        </div>
                      </td>

                      {/* Firmographics */}
                      <td className="py-3 px-3 hidden md:table-cell">
                        <div className="text-gray-800">{lead.industry}</div>
                        <div className="text-[11px] text-gray-500">{lead.company_size}</div>
                      </td>

                      {/* Budget */}
                      <td className="py-3 px-3 text-right tabular-nums font-bold text-gray-900">
                        ${lead.budget.toLocaleString()}
                      </td>

                      {/* Urgency / Intent */}
                      <td className="py-3 px-3 hidden lg:table-cell">
                        <div className="text-gray-800 font-semibold">{lead.urgency}</div>
                        <div className="text-[11px] text-[#15803d]">{lead.source}</div>
                      </td>

                      {/* Score */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center font-extrabold text-xs px-2.5 py-1 rounded-md tabular-nums ${
                            lead.score >= 75
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : lead.score >= 50
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {lead.score}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                            isHigh
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isReview
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : isMed
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {lead.priority}
                        </span>
                      </td>

                      {/* Recommended Action */}
                      <td className="py-3 px-3 hidden xl:table-cell max-w-xs">
                        <p className="truncate text-gray-700 text-[11px]">
                          {lead.recommended_action}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLead(lead);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#15803d] hover:bg-green-50 border border-green-200 rounded-md transition-colors"
                        >
                          View File
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-500">
          <div className="tabular-nums">
            Showing <strong className="text-gray-800">{leads.length}</strong> of{' '}
            <strong className="text-gray-800">{totalLeads}</strong> leads
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="py-1 px-2 border border-gray-300 rounded bg-white text-gray-800 font-semibold focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold text-gray-800 tabular-nums">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
