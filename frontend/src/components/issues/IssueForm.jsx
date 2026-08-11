import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { canCreateIssue, canEditIssue } from '../../utils/permissions';
import { createIssue, updateIssue } from '../../api/issues';
import { getProjects } from '../../api/projects';
import { getUsers } from '../../api/users';
import { groupUsersByRole } from '../../utils/userHelpers';
import { useTheme } from '../../context/ThemeContext';
import { MorphingSpinner } from '../reactbit/loading';

export default function IssueForm({
  projectId,
  issue = null,
  projects: initialProjects = [],
  users: initialUsers = [],
  onSuccess,
  onCancel,
}) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isEdit = !!issue;

  // Guard: permissions check
  if (isEdit && !canEditIssue(user, issue)) return null;
  if (!isEdit && !canCreateIssue(user)) return null;

  const [selectedProjectId, setSelectedProjectId] = useState(
    projectId || issue?.project_id || initialProjects[0]?.id || ''
  );
  const [title, setTitle] = useState(issue?.title || '');
  const [description, setDescription] = useState(issue?.description || '');
  const [priority, setPriority] = useState(issue?.priority || 'medium');
  const [assignedTo, setAssignedTo] = useState(issue?.assigned_to || '');
  const [branchName, setBranchName] = useState(issue?.branch_name || '');

  const [projectsList, setProjectsList] = useState(initialProjects);
  const [usersList, setUsersList] = useState(initialUsers);

  const needsProjects = !projectId && !isEdit && initialProjects.length === 0;
  const needsUsers = initialUsers.length === 0;
  const [initialLoading, setInitialLoading] = useState(needsProjects || needsUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const promises = [];

    if (needsUsers) {
      promises.push(
        getUsers()
          .then((res) => {
            if (active) setUsersList(res.data?.data || res.data || []);
          })
          .catch(() => {})
      );
    }

    if (needsProjects) {
      promises.push(
        getProjects()
          .then((res) => {
            if (!active) return;
            const projs = res.data?.data || res.data || [];
            setProjectsList(projs);
            if (projs.length > 0 && !selectedProjectId) {
              setSelectedProjectId(projs[0].id);
            }
          })
          .catch(() => {})
      );
    }

    if (promises.length > 0) {
      Promise.all(promises).finally(() => {
        if (active) setInitialLoading(false);
      });
    } else {
      setInitialLoading(false);
    }

    return () => {
      active = false;
    };
  }, [needsProjects, needsUsers, selectedProjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const targetProjectId = Number(selectedProjectId || projectId || issue?.project_id);
    if (!targetProjectId) {
      setError('Please select a project for this issue.');
      return;
    }
    if (!title.trim()) {
      setError('Issue title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        project_id: targetProjectId,
        title: title.trim(),
        description: description.trim(),
        priority: priority,
        assigned_to: assignedTo ? Number(assignedTo) : null,
        branch_name: branchName.trim() || null,
      };

      if (isEdit) {
        await updateIssue(issue.id, payload);
      } else {
        await createIssue(payload);
      }
      onSuccess?.();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.title?.[0] ||
        'Failed to save issue.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onCancel}
      />

      {/* Modal */}
      {initialLoading ? (
        <div
          className={`relative w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl border animate-pulse transition-colors ${
            isDark
              ? 'bg-slate-900 border-slate-750'
              : 'bg-white border-slate-200'
          }`}
        >
          {/* Header Title */}
          <div className={`h-6 w-40 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

          {/* Project Selection Skeleton */}
          <div className="space-y-1.5">
            <div className={`h-3 w-16 rounded ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}`} />
            <div className={`h-[42px] w-full rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <div className={`h-3 w-20 rounded ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}`} />
            <div className={`h-[42px] w-full rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className={`h-3 w-24 rounded ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}`} />
            <div className={`h-[88px] w-full rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          </div>

          {/* Priority & Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className={`h-3 w-16 rounded ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}`} />
              <div className={`h-[42px] w-full rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            </div>
            <div className="space-y-1.5">
              <div className={`h-3 w-16 rounded ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}`} />
              <div className={`h-[42px] w-full rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            </div>
          </div>

          {/* Git Branch Name */}
          <div className="space-y-1.5">
            <div className={`h-3 w-40 rounded ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}`} />
            <div className={`h-[42px] w-full rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3">
            <div className={`h-9 w-20 rounded-xl ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}`} />
            <div className={`h-9 w-28 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={`relative w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl border transition-colors ${
            isDark
              ? 'bg-slate-900 border-slate-750 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <h3 className="text-lg font-bold">
            {isEdit ? 'Edit Issue' : 'Create New Issue'}
          </h3>

        {error && (
          <div className="p-3 text-sm font-medium text-red-400 bg-red-950/40 border border-red-900/60 rounded-xl">
            {error}
          </div>
        )}

        {/* Project Selection (if creating from general Issues page) */}
        {!projectId && !isEdit && (
          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Project <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-100 focus:ring-slate-600'
                  : 'bg-white border-slate-200 text-slate-900 focus:ring-slate-300'
              }`}
            >
              {projectsList.map((p) => (
                <option key={p.id} value={p.id} className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Title */}
        <div className="space-y-1.5">
          <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Issue Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Login error message not displayed"
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all focus:outline-none focus:ring-2 ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400 focus:ring-slate-600'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-slate-300'
            }`}
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the issue..."
            rows={3}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all resize-none focus:outline-none focus:ring-2 ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400 focus:ring-slate-600'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-slate-300'
            }`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Priority */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-100 focus:ring-slate-600'
                  : 'bg-white border-slate-200 text-slate-900 focus:ring-slate-300'
              }`}
            >
              <option value="low" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>Low</option>
              <option value="medium" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>Medium</option>
              <option value="high" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>High</option>
              <option value="critical" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>Critical</option>
            </select>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Assignee
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-100 focus:ring-slate-600'
                  : 'bg-white border-slate-200 text-slate-900 focus:ring-slate-300'
              }`}
            >
              <option value="" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                Unassigned
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
            <p className={`text-[11px] leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              💡 Assign to a Developer to work on and resolve this issue. QA can test once resolved.
            </p>
          </div>
        </div>

        {/* Branch Name */}
        <div className="space-y-1.5">
          <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Git Branch Name (Optional)
          </label>
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="e.g. fix/login-message"
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all focus:outline-none focus:ring-2 ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400 focus:ring-slate-600'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-slate-300'
            }`}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 ${
              isDark
                ? 'bg-white text-slate-900 hover:bg-slate-100'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <MorphingSpinner size="xs" />
                Saving...
              </span>
            ) : isEdit ? (
              'Save Changes'
            ) : (
              'Create Issue'
            )}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
