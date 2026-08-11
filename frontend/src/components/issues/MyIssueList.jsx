import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

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
  open: {
    label: 'Open',
    dark: 'bg-amber-950/80 text-amber-400 border border-amber-800/50',
    light: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  in_progress: {
    label: 'In progress',
    dark: 'bg-blue-950/80 text-blue-400 border border-blue-800/50',
    light: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  resolved: {
    label: 'Resolved',
    dark: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50',
    light: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  },
  verified: {
    label: 'Verified',
    dark: 'bg-purple-950/80 text-purple-400 border border-purple-800/50',
    light: 'bg-purple-100 text-purple-700 border border-purple-200',
  },
  closed: {
    label: 'Closed',
    dark: 'bg-slate-800 text-slate-400 border border-slate-700',
    light: 'bg-slate-200 text-slate-600 border border-slate-300',
  },
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

export default function MyIssueList({ issues = [], loading, error, onRefresh }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  if (loading) {
    return (
      <div
        className={`border rounded-xl overflow-hidden divide-y animate-pulse ${
          isDark
            ? 'border-slate-800 divide-slate-800 bg-slate-800/40'
            : 'border-slate-200 divide-slate-200 bg-white shadow-2xs'
        }`}
      >
        <div
          className={`grid grid-cols-12 items-center px-4 py-2.5 border-b ${
            isDark ? 'bg-slate-800/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className={`col-span-5 h-3 w-16 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className={`col-span-3 h-3 w-14 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className={`col-span-1 h-3 w-12 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className={`col-span-2 h-3 w-14 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className={`col-span-1 h-3 w-10 rounded ml-auto ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="grid grid-cols-12 items-center px-4 py-3.5 gap-2">
            <div className={`col-span-5 h-4 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className={`col-span-3 h-3 rounded ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}`} />
            <div className={`col-span-1 h-5 w-12 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className={`col-span-2 h-5 w-20 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className={`col-span-1 h-3 rounded ${isDark ? 'bg-slate-700/60' : 'bg-slate-200/60'}`} />
          </div>
        ))}
      </div>
    );
  }

  if (error) return null;

  return (
    <div
      className={`border rounded-xl overflow-hidden divide-y ${
        isDark
          ? 'border-slate-800 divide-slate-800 bg-slate-800/40'
          : 'border-slate-200 divide-slate-200 bg-white shadow-2xs'
      }`}
    >
      {/* Table Header */}
      <div
        className={`grid grid-cols-12 items-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b ${
          isDark
            ? 'bg-slate-800/80 text-slate-400 border-slate-800'
            : 'bg-slate-50 text-slate-500 border-slate-200'
        }`}
      >
        <div className="col-span-5">Title</div>
        <div className="col-span-3">Project</div>
        <div className="col-span-1">Priority</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1 text-right">Updated</div>
      </div>

      {/* Table Body */}
      {issues.length > 0 ? (
        issues.map((issue) => {
          const priorityInfo =
            PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.low;
          const statusInfo =
            STATUS_CONFIG[issue.status] || STATUS_CONFIG.open;

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
                className={`col-span-3 text-xs truncate ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {issue.project?.name || `Project #${issue.project_id}`}
              </div>

              {/* Priority */}
              <div className="col-span-1 flex justify-start">
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
          className={`px-4 py-8 text-center text-xs ${
            isDark ? 'text-slate-400' : 'text-slate-400'
          }`}
        >
          No issues assigned to you match the selected filters.
        </div>
      )}
    </div>
  );
}
