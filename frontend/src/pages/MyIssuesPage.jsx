import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { getIssues, updateStatus } from '../api/issues';
import MyIssueList from '../components/issues/MyIssueList';
import KanbanBoard from '../components/issues/KanbanBoard';
import { UserCheck, ChevronDown, LayoutList, Kanban } from 'lucide-react';

const VIEW_STORAGE_KEY = 'tracer-my-issues-view';

export default function MyIssuesPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // View toggle state (persisted)
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem(VIEW_STORAGE_KEY) || 'table';
    } catch {
      return 'table';
    }
  });

  const handleViewChange = (v) => {
    setView(v);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, v);
    } catch {}
  };

  // Data & Filter states
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Fetch issues assigned to the current user
  const fetchMyIssues = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    const params = { assigned_to: user.id };
    if (selectedStatus) params.status = selectedStatus;
    if (selectedPriority) params.priority = selectedPriority;

    try {
      const res = await getIssues(params);
      setIssues(res.data?.data || res.data || []);
    } catch {
      setError('Failed to load your issues.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedStatus, selectedPriority]);

  useEffect(() => {
    fetchMyIssues();
  }, [fetchMyIssues]);

  // Optimistic status update for instant drag & drop on My Issues board
  const handleStatusChange = useCallback(
    async (issueId, newStatus) => {
      // 1. Instantly update UI locally
      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue.id === issueId
            ? { ...issue, status: newStatus, updated_at: new Date().toISOString() }
            : issue
        )
      );

      // 2. Make API call in background
      try {
        await updateStatus(issueId, newStatus);
      } catch (err) {
        // 3. Rollback on error
        fetchMyIssues();
        throw err;
      }
    },
    [fetchMyIssues]
  );

  const selectStyle = `pl-3.5 pr-8 py-2.5 text-xs font-semibold rounded-xl border transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 ${
    isDark
      ? 'bg-slate-800 border-slate-700 text-slate-100 focus:ring-slate-600'
      : 'bg-white border-slate-200 text-slate-800 shadow-2xs focus:ring-slate-300'
  }`;

  const toggleBtnClass = (isActive) =>
    `flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
      isActive
        ? isDark
          ? 'bg-slate-700 text-white'
          : 'bg-slate-900 text-white shadow-sm'
        : isDark
          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl border ${
              isDark
                ? 'bg-indigo-950/60 border-indigo-800/50 text-indigo-400'
                : 'bg-indigo-50 border-indigo-200 text-indigo-600'
            }`}
          >
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              My Issues
            </h1>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Issues assigned to you
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Total count badge */}
          {!loading && (
            <span
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
              }`}
            >
              {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
            </span>
          )}

          {/* View Toggle */}
          <div
            className={`flex items-center gap-1 p-1 rounded-xl border ${
              isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button onClick={() => handleViewChange('table')} className={toggleBtnClass(view === 'table')}>
              <LayoutList className="w-3.5 h-3.5" />
              Table
            </button>
            <button onClick={() => handleViewChange('board')} className={toggleBtnClass(view === 'board')}>
              <Kanban className="w-3.5 h-3.5" />
              Board
            </button>
          </div>
        </div>
      </div>

      {/* ─── Filters Bar ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter (Table view only) */}
        {view === 'table' && (
          <div className="relative inline-flex items-center">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={selectStyle}
            >
              <option value="" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                All statuses
              </option>
              <option value="open" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                Open
              </option>
              <option value="in_progress" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                In progress
              </option>
              <option value="resolved" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                Resolved
              </option>
              <option value="verified" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                Verified
              </option>
              <option value="closed" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                Closed
              </option>
            </select>
            <ChevronDown
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${
                isDark ? 'text-slate-400' : 'text-slate-400'
              }`}
            />
          </div>
        )}

        {/* Priority Filter */}
        <div className="relative inline-flex items-center">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className={selectStyle}
          >
            <option value="" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
              All priorities
            </option>
            <option value="low" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
              Low
            </option>
            <option value="medium" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
              Medium
            </option>
            <option value="high" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
              High
            </option>
            <option value="critical" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
              Critical
            </option>
          </select>
          <ChevronDown
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${
              isDark ? 'text-slate-400' : 'text-slate-400'
            }`}
          />
        </div>
      </div>

      {/* ─── Error State ─────────────────────────────────────────────────── */}
      {error && !loading && (
        <div
          className={`p-4 text-sm font-medium rounded-xl text-center ${
            isDark
              ? 'text-red-400 bg-red-950/30 border border-red-900/50'
              : 'text-red-700 bg-red-50 border border-red-200'
          }`}
        >
          {error}
          <button onClick={fetchMyIssues} className="ml-2 underline hover:no-underline cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* ─── Content View ───────────────────────────────────────────────── */}
      {view === 'table' ? (
        <MyIssueList
          issues={issues}
          loading={loading}
          error={error}
          onRefresh={fetchMyIssues}
        />
      ) : (
        <KanbanBoard
          issues={issues}
          loading={loading}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
