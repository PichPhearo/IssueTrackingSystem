import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { getUser, updateRole, toggleActive } from '../api/users';
import { ChevronRight, ChevronDown, AlertTriangle } from 'lucide-react';
import { MorphingSpinner } from '../components/reactbit/loading';

const ROLE_LABELS = {
  admin: 'Admin',
  project_manager: 'Project Manager',
  developer: 'Developer',
  qa: 'QA',
};

const ROLES_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'developer', label: 'Developer' },
  { value: 'qa', label: 'QA' },
];

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

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isAdmin = currentUser?.role === 'admin';

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUser(id);
      setUserData(res.data?.data || res.data);
    } catch {
      setError('Failed to load user details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleRoleChange = async (newRole) => {
    if (!isAdmin || updating || !userData) return;
    setUpdating(true);
    try {
      await updateRole(userData.id, newRole);
      setUserData((prev) => (prev ? { ...prev, role: newRole } : null));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role.');
    } finally {
      setUpdating(false);
    }
  };

  const handleActivate = async () => {
    if (!isAdmin || updating || !userData) return;
    setUpdating(true);
    try {
      const res = await toggleActive(userData.id);
      const updated = res.data?.user;
      setUserData((prev) =>
        prev
          ? { ...prev, is_active: updated ? updated.is_active : true }
          : null
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate user.');
    } finally {
      setUpdating(false);
    }
  };

  const confirmDeactivate = async () => {
    if (!userData || deactivating) return;
    setDeactivating(true);
    try {
      const res = await toggleActive(userData.id);
      const updated = res.data?.user;
      setUserData((prev) =>
        prev
          ? { ...prev, is_active: updated ? updated.is_active : false }
          : null
      );
      setShowDeactivateModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate user.');
    } finally {
      setDeactivating(false);
    }
  };

  // ─── Loading Skeleton ───────────────────────────────────────────────────
  if (loading && !userData) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className={`h-4 w-40 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

        {/* Profile Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className="space-y-2">
              <div className={`h-7 w-48 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
              <div className={`h-4 w-60 rounded ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}`} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-36 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className={`h-10 w-28 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          </div>
        </div>

        {/* Metrics Row Skeleton */}
        <div className="flex items-center gap-16 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className={`h-4 w-24 rounded ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}`} />
              <div className={`h-8 w-12 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            </div>
          ))}
        </div>

        {/* Projects Section Skeleton */}
        <div className="space-y-3 pt-4">
          <div className={`h-5 w-24 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className="flex gap-3">
            <div className={`h-10 w-44 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className={`h-10 w-36 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          </div>
        </div>

        {/* Assigned Issues Section Skeleton */}
        <div className="space-y-3 pt-4">
          <div className={`h-5 w-36 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className={`h-24 w-full rounded-2xl ${isDark ? 'bg-slate-700/60' : 'bg-slate-200/80'}`} />
        </div>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────
  if (error || !userData) {
    return (
      <div
        className={`p-6 text-center rounded-2xl border ${
          isDark
            ? 'bg-slate-800/80 border-slate-700 text-slate-300'
            : 'bg-white border-slate-200 text-slate-700'
        }`}
      >
        <p className="font-semibold text-lg">{error || 'User not found'}</p>
        <button
          onClick={fetchUserData}
          className="mt-4 px-4 py-2 text-sm font-semibold rounded-xl bg-slate-900 text-white cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const projects = userData.projects || [];
  const assignedIssues = userData.assigned_issues || [];
  const openIssuesCount = assignedIssues.filter((i) =>
    ['open', 'in_progress'].includes(i.status)
  ).length;

  const isSelf = currentUser?.id === userData.id;

  // Generate avatar initials
  const initials = userData.name
    ? userData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className="space-y-8">
      {/* ─── Breadcrumb ───────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-sm font-medium">
        <Link
          to="/admin/users"
          className={`transition-colors hover:underline ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Users & roles
        </Link>
        <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {userData.name}
        </span>
      </nav>

      {/* ─── Profile Header ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Avatar & Info */}
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg text-white shrink-0 ${
              isDark
                ? 'bg-blue-600/90 border border-blue-500/30'
                : 'bg-blue-600 shadow-sm'
            }`}
          >
            {initials}
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1
                className={`text-2xl font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {userData.name}
              </h1>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                  userData.is_active
                    ? isDark
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50'
                      : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : isDark
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-slate-200 text-slate-600 border-slate-300'
                }`}
              >
                {userData.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p
              className={`text-sm mt-0.5 font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {userData.email} · {ROLE_LABELS[userData.role] || userData.role}
            </p>
          </div>
        </div>

        {/* Right Actions: Role selector & Deactivate button */}
        {isAdmin && (
          <div className="flex items-center gap-3">
            {/* Role Select Dropdown */}
            <div className="relative inline-flex items-center">
              <select
                value={userData.role}
                disabled={updating}
                onChange={(e) => handleRoleChange(e.target.value)}
                className={`pl-3.5 pr-9 py-2 text-sm font-semibold rounded-xl border appearance-none transition-all cursor-pointer focus:outline-none focus:ring-2 disabled:opacity-50 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-100 focus:ring-slate-600'
                    : 'bg-white border-slate-200 text-slate-900 shadow-2xs focus:ring-slate-300'
                }`}
              >
                {ROLES_OPTIONS.map((r) => (
                  <option
                    key={r.value}
                    value={r.value}
                    className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}
                  >
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                  isDark ? 'text-slate-400' : 'text-slate-400'
                }`}
              />
            </div>

            {/* Deactivate / Activate Button */}
            {!isSelf && (
              userData.is_active ? (
                <button
                  onClick={() => setShowDeactivateModal(true)}
                  disabled={updating}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-colors cursor-pointer disabled:opacity-50 ${
                    isDark
                      ? 'border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Deactivate
                </button>
              ) : (
                <button
                  onClick={handleActivate}
                  disabled={updating}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Activate
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* ─── Metrics Counters Row ─────────────────────────────────────────── */}
      <div className="flex items-center gap-14 sm:gap-20 pt-2 border-b pb-8 border-slate-800">
        {/* Projects count */}
        <div>
          <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Projects
          </div>
          <div className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {projects.length}
          </div>
        </div>

        {/* Assigned issues count */}
        <div>
          <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Assigned issues
          </div>
          <div className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {assignedIssues.length}
          </div>
        </div>

        {/* Open issues count */}
        <div>
          <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Open
          </div>
          <div className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {openIssuesCount}
          </div>
        </div>
      </div>

      {/* ─── Projects Section ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Projects
        </h2>

        {projects.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-750 hover:border-slate-600 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                {p.name}
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
            No projects associated with this user.
          </p>
        )}
      </div>

      {/* ─── Assigned Issues Section ──────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Assigned issues
        </h2>

        {assignedIssues.length > 0 ? (
          <div
            className={`border rounded-2xl overflow-hidden divide-y ${
              isDark
                ? 'border-slate-800 divide-slate-800/80 bg-slate-800/40'
                : 'border-slate-200 divide-slate-200 bg-white shadow-2xs'
            }`}
          >
            {assignedIssues.map((issue) => {
              const priorityInfo =
                PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.low;
              const statusInfo =
                STATUS_CONFIG[issue.status] || STATUS_CONFIG.open;

              return (
                <div
                  key={issue.id}
                  onClick={() => navigate(`/issues/${issue.id}`)}
                  className={`grid grid-cols-12 items-center px-5 py-4 text-sm transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-slate-750/50' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Issue Title */}
                  <div
                    className={`col-span-5 font-semibold truncate ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}
                  >
                    {issue.title}
                  </div>

                  {/* Project Name */}
                  <div
                    className={`col-span-3 text-xs truncate ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {issue.project?.name || `Project #${issue.project_id}`}
                  </div>

                  {/* Priority Badge */}
                  <div className="col-span-2 flex justify-start">
                    {priorityInfo.label !== 'Low' ? (
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
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

                  {/* Status Badge */}
                  <div className="col-span-2 flex justify-end">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        statusInfo[isDark ? 'dark' : 'light']
                      }`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={`p-6 text-center text-sm rounded-2xl border ${
              isDark
                ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                : 'bg-white border-slate-200 text-slate-400 shadow-2xs'
            }`}
          >
            No assigned issues for this user.
          </div>
        )}
      </div>

      {/* ─── Deactivate Confirmation Modal ────────────────────────────────── */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => !deactivating && setShowDeactivateModal(false)}
          />
          <div
            className={`relative w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl border transition-colors ${
              isDark
                ? 'bg-slate-900 border-slate-750 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark
                    ? 'bg-red-950/80 text-red-400 border border-red-800/50'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-red-400">Deactivate User?</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Account access will be suspended
                </p>
              </div>
            </div>

            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Are you sure you want to deactivate{' '}
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {userData.name}
              </span>
              ? They will immediately lose access to log in and manage issues.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                disabled={deactivating}
                className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeactivate}
                disabled={deactivating}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deactivating ? (
                  <span className="inline-flex items-center gap-2">
                    <MorphingSpinner size="xs" />
                    Deactivating...
                  </span>
                ) : (
                  'Deactivate'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
