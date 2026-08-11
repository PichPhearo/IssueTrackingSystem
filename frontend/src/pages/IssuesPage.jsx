import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { canCreateIssue } from '../utils/permissions';
import { getIssues, updateStatus } from '../api/issues';
import { getProjects } from '../api/projects';
import { getUsers } from '../api/users';
import { groupUsersByRole } from '../utils/userHelpers';
import IssueList from '../components/issues/IssueList';
import KanbanBoard from '../components/issues/KanbanBoard';
import IssueForm from '../components/issues/IssueForm';
import { Plus, ChevronDown, LayoutList, Kanban } from 'lucide-react';

// Survive StrictMode remounts
let dropdownInflight = null;
const issuesInflightByKey = new Map();

const VIEW_STORAGE_KEY = 'tracer-issues-view';

export default function IssuesPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // View toggle (persisted)
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

  // Data
  const [issues, setIssues] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [dropdownsLoading, setDropdownsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load dropdown lists (projects & users) on mount
  useEffect(() => {
    let active = true;

    if (!dropdownInflight) {
      dropdownInflight = Promise.all([
        getProjects().then((res) => res.data?.data || res.data || []),
        getUsers().then((res) => res.data?.data || res.data || []),
      ]).finally(() => {
        dropdownInflight = null;
      });
    }

    dropdownInflight
      .then(([projects, users]) => {
        if (!active) return;
        setProjectsList(projects);
        setUsersList(users);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setDropdownsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Fetch issues with current active filters
  const fetchIssuesList = useCallback(async () => {
    const params = {};
    if (selectedProject) params.project_id = selectedProject;
    if (selectedStatus) params.status = selectedStatus;
    if (selectedPriority) params.priority = selectedPriority;
    if (selectedAssignee) params.assigned_to = selectedAssignee;

    const key = JSON.stringify(params);
    setLoading(true);
    setError(null);

    try {
      if (!issuesInflightByKey.has(key)) {
        const request = getIssues(params)
          .then((res) => res.data?.data || res.data || [])
          .finally(() => {
            issuesInflightByKey.delete(key);
          });
        issuesInflightByKey.set(key, request);
      }

      const data = await issuesInflightByKey.get(key);
      setIssues(data);
    } catch {
      setError('Failed to load issues.');
    } finally {
      setLoading(false);
    }
  }, [selectedProject, selectedStatus, selectedPriority, selectedAssignee]);

  useEffect(() => {
    fetchIssuesList();
  }, [fetchIssuesList]);

  // Optimistic status update handler for instant drag & drop
  const handleStatusChange = useCallback(async (issueId, newStatus) => {
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
      fetchIssuesList();
      throw err;
    }
  }, [fetchIssuesList]);

  // ─── Shared Styles ─────────────────────────────────────────────────────

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
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Issues
        </h1>

        <div className="flex items-center gap-3">
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

          {canCreateIssue(user) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
                  : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              New issue
            </button>
          )}
        </div>
      </div>

      {/* ─── Filters Bar ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {dropdownsLoading ? (
          <>
            {[36, 32, 32, 40].map((w, i) => (
              <div
                key={i}
                className={`h-[38px] rounded-xl animate-pulse ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                style={{ width: `${w * 4}px` }}
              />
            ))}
          </>
        ) : (
          <>
            {/* Project Filter */}
            <div className="relative inline-flex items-center">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className={selectStyle}
              >
                <option value="" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>All projects</option>
                {projectsList.map((p) => (
                  <option key={p.id} value={p.id} className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
            </div>

            {/* Status Filter — hidden in board view since columns already represent status */}
            {view === 'table' && (
              <div className="relative inline-flex items-center">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={selectStyle}
                >
                  <option value="" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>All statuses</option>
                  <option value="open" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>Open</option>
                  <option value="in_progress" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>In progress</option>
                  <option value="resolved" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>Resolved</option>
                  <option value="verified" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>Verified</option>
                  <option value="closed" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>Closed</option>
                </select>
                <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
              </div>
            )}

            {/* Priority Filter */}
            <div className="relative inline-flex items-center">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className={selectStyle}
              >
                <option value="" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>All priorities</option>
                <option value="low" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>Low</option>
                <option value="medium" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>Medium</option>
                <option value="high" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>High</option>
                <option value="critical" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>Critical</option>
              </select>
              <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
            </div>

            {/* Assignee Filter */}
            <div className="relative inline-flex items-center">
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className={selectStyle}
              >
                <option value="" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                  All assignees
                </option>
                {groupUsersByRole(usersList).map((group) => (
                  <optgroup
                    key={group.key}
                    label={`── ${group.label} ──`}
                    className={isDark ? 'bg-slate-900 text-slate-400 font-semibold' : 'bg-slate-100 text-slate-600 font-semibold'}
                  >
                    {group.users.map((u) => (
                      <option
                        key={u.id}
                        value={u.id}
                        className={isDark ? 'bg-slate-800 text-slate-100 font-normal' : 'bg-white text-slate-900 font-normal'}
                      >
                        {u.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
            </div>
          </>
        )}
      </div>

      {/* ─── Error State ──────────────────────────────────────────────────── */}
      {error && !loading && (
        <div
          className={`p-4 text-sm font-medium rounded-xl text-center ${
            isDark
              ? 'text-red-400 bg-red-950/30 border border-red-900/50'
              : 'text-red-700 bg-red-50 border border-red-200'
          }`}
        >
          {error}
          <button
            onClick={fetchIssuesList}
            className="ml-2 underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── View Content ─────────────────────────────────────────────────── */}
      {view === 'table' ? (
        <IssueList
          issues={issues}
          loading={loading}
          error={error}
          onRefresh={fetchIssuesList}
        />
      ) : (
        <KanbanBoard
          issues={issues}
          loading={loading}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* ─── Create Issue Modal ───────────────────────────────────────────── */}
      {showCreateModal && (
        <IssueForm
          projects={projectsList}
          users={usersList}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchIssuesList();
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
