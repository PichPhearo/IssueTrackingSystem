import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useDashboard } from '../../context/DashboardContext';
import { canCreateProject, canViewUsers } from '../../utils/permissions';
import ProjectForm from '../projects/ProjectForm';
import { Ellipsis } from 'lucide-react';

// ─── Status & Priority Config ────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  high: {
    label: 'High',
    dark: 'bg-red-950/80 text-red-400 border border-red-800/50',
    light: 'bg-red-100 text-red-700 border border-red-200',
  },
  critical: {
    label: 'Critical',
    dark: 'bg-red-950 text-red-300 border border-red-700 font-bold',
    light: 'bg-red-200 text-red-800 border border-red-300 font-bold',
  },
  medium: {
    label: 'Medium',
    dark: 'bg-amber-950/80 text-amber-400 border border-amber-800/50',
    light: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  low: {
    label: 'Low',
    dark: 'text-slate-400 font-medium',
    light: 'text-slate-500 font-medium',
  },
};

const STATUS_CONFIG = {
  open: { label: 'Open', color: '#F59E0B', dark: 'bg-amber-950/80 text-amber-400 border border-amber-800/50', light: 'bg-amber-100 text-amber-700 border border-amber-200' },
  in_progress: { label: 'In progress', color: '#3B82F6', dark: 'bg-blue-950/80 text-blue-400 border border-blue-800/50', light: 'bg-blue-100 text-blue-700 border border-blue-200' },
  resolved: { label: 'Resolved', color: '#22C55E', dark: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50', light: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  verified: { label: 'Verified', color: '#8B5CF6', dark: 'bg-purple-950/80 text-purple-400 border border-purple-800/50', light: 'bg-purple-100 text-purple-700 border border-purple-200' },
  closed: { label: 'Closed', color: '#94A3B8', dark: 'bg-slate-800 text-slate-400 border border-slate-700', light: 'bg-slate-200 text-slate-600 border border-slate-300' },
};

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
}

// ─── Dashboard Widget ───────────────────────────────────────────────────────

export default function DashboardStats() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const { projects, issues, users, loading, fetchData, refresh } = useDashboard();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch on mount (skips if data is still fresh from cache)
  useEffect(() => {
    fetchData();
  }, []);

  // ─── Computed Stats ─────────────────────────────────────────────────────

  const totalProjects = projects.length;
  const openIssues = issues.filter(
    (i) => i.status === 'open'
  ).length;
  const activeUsersCount = (users || []).filter((u) => u.is_active).length;

  // Status breakdown — only show statuses that have count > 0
  const statusBreakdown = Object.entries(STATUS_CONFIG)
    .map(([key, config]) => ({
      key,
      ...config,
      count: issues.filter((i) => i.status === key).length,
    }))
    .filter((s) => s.count > 0);

  // Recent activity — last 5 issues sorted by latest
  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    refresh(); // Force fresh fetch after creating a project
  };

  // ─── Skeleton Loader ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className={`h-8 w-40 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className={`h-9 w-32 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-20 rounded-xl ${isDark ? 'bg-slate-700/60' : 'bg-slate-200/80'}`} />
          ))}
        </div>
        <div className={`h-10 rounded-xl w-3/4 ${isDark ? 'bg-slate-700/60' : 'bg-slate-200/80'}`} />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-12 rounded-lg ${isDark ? 'bg-slate-700/60' : 'bg-slate-200/80'}`} />
          ))}
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Dashboard
        </h1>
        <div className="flex items-center gap-2">
          {canCreateProject(user) && (
            <button
              onClick={() => setShowCreateForm(true)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
                  : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
              }`}
            >
              <span className="text-base leading-none">+</span>
              New project
            </button>
          )}
          <button
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Ellipsis className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-5">
        <StatCard label="Projects" value={totalProjects} isDark={isDark} />
        <StatCard label="Open issues" value={openIssues} isDark={isDark} />
        {canViewUsers(user) ? (
          <StatCard label="Active users" value={activeUsersCount} isDark={isDark} />
        ) : (
          <StatCard
            label="My issues"
            value={issues.filter((i) => i.assigned_to === user?.id).length}
            isDark={isDark}
          />
        )}
      </div>

      {/* Issue Status Breakdown */}
      {statusBreakdown.length > 0 && (
        <div className="space-y-3">
          <h2 className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Issue status breakdown
          </h2>
          <div className="flex flex-wrap items-center gap-2.5">
            {statusBreakdown.map((s) => (
              <span
                key={s.key}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border ${
                  isDark
                    ? 'border-slate-700/60 bg-slate-800/50'
                    : 'border-slate-200 bg-slate-100/70'
                }`}
                style={{ color: s.color }}
              >
                {s.label} {s.count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="space-y-3">
        <h2 className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Recent activity
        </h2>
        <div
          className={`border rounded-xl overflow-hidden divide-y ${
            isDark
              ? 'border-slate-800 divide-slate-800 bg-slate-800/30'
              : 'border-slate-200 divide-slate-200 bg-white shadow-2xs'
          }`}
        >
          {/* Table Header with Column Titles */}
          <div
            className={`grid grid-cols-12 items-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b ${
              isDark
                ? 'bg-slate-800/80 text-slate-400 border-slate-800'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Project</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Updated</div>
          </div>

          {/* Table Body */}
          {recentIssues.length > 0 ? (
            recentIssues.map((issue) => {
              const priorityInfo = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.low;
              const statusInfo = STATUS_CONFIG[issue.status] || STATUS_CONFIG.open;

              return (
                <div
                  key={issue.id}
                  onClick={() => navigate(`/issues/${issue.id}`)}
                  className={`grid grid-cols-12 items-center px-4 py-3.5 text-sm transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-slate-750/50' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Title */}
                  <div
                    className={`col-span-5 font-semibold truncate ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}
                  >
                    {issue.title}
                  </div>

                  {/* Project */}
                  <div
                    className={`col-span-2 text-xs truncate ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {issue.project?.name || `Project #${issue.project_id}`}
                  </div>

                  {/* Priority */}
                  <div className="col-span-2 flex justify-start">
                    {priorityInfo.label !== 'Low' ? (
                      <span
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                          priorityInfo[isDark ? 'dark' : 'light']
                        }`}
                      >
                        {priorityInfo.label}
                      </span>
                    ) : (
                      <span className={`text-xs ${priorityInfo[isDark ? 'dark' : 'light']}`}>
                        Low
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex justify-start">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        statusInfo[isDark ? 'dark' : 'light']
                      }`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Relative Updated Time */}
                  <div
                    className={`col-span-1 text-right text-xs whitespace-nowrap ${
                      isDark ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    {formatRelativeTime(issue.updated_at || issue.created_at)}
                  </div>
                </div>
              );
            })
          ) : (
            <div
              className={`px-4 py-6 text-center text-sm ${
                isDark ? 'text-slate-400' : 'text-slate-400'
              }`}
            >
              No recent activity.
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateForm && (
        <ProjectForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({ label, value, isDark }) {
  return (
    <div className="space-y-1">
      <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        {label}
      </p>
      <p className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {value}
      </p>
    </div>
  );
}
