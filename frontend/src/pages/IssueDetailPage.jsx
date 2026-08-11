import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { getIssue, updateIssue, deleteIssue, updateStatus } from '../api/issues';
import { getUsers } from '../api/users';
import { groupUsersByRole } from '../utils/userHelpers';
import { getComments, createComment, deleteComment } from '../api/comments';
import {
  canEditIssue,
  canDeleteIssue,
  canChangeStatus,
  getAllowedTransitions,
  canDeleteComment,
} from '../utils/permissions';
import IssueForm from '../components/issues/IssueForm';
import { ChevronRight, ChevronDown, Trash2, AlertTriangle } from 'lucide-react';
import { MorphingSpinner } from '../components/reactbit/loading';

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

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  verified: 'Verified',
  closed: 'Closed',
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

export default function IssueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [issue, setIssue] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingField, setUpdatingField] = useState(false);

  const fetchIssueData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [issueRes, usersRes] = await Promise.all([
        getIssue(id),
        getUsers().catch(() => ({ data: { data: [] } })),
      ]);
      const issueData = issueRes.data?.data || issueRes.data;
      setIssue(issueData);
      setComments(issueData.comments || []);
      setUsersList(usersRes.data?.data || usersRes.data || []);
    } catch {
      setError('Failed to load issue details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIssueData();
  }, [fetchIssueData]);

  // Handle Status Change
  const handleStatusChange = async (newStatus) => {
    if (!issue || updatingField || newStatus === issue.status) return;
    setUpdatingField(true);
    try {
      await updateStatus(issue.id, newStatus);
      setIssue((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingField(false);
    }
  };

  // Handle Assignee Change
  const handleAssigneeChange = async (newAssigneeId) => {
    if (!issue || updatingField) return;
    setUpdatingField(true);
    const assignedVal = newAssigneeId ? Number(newAssigneeId) : null;
    try {
      await updateIssue(issue.id, {
        project_id: issue.project_id,
        title: issue.title,
        description: issue.description,
        priority: issue.priority,
        branch_name: issue.branch_name,
        assigned_to: assignedVal,
      });
      const updatedAssignee = usersList.find((u) => u.id === assignedVal) || null;
      setIssue((prev) =>
        prev
          ? {
              ...prev,
              assigned_to: assignedVal,
              assignee: updatedAssignee,
            }
          : null
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update assignee.');
    } finally {
      setUpdatingField(false);
    }
  };

  // Handle Delete Issue
  const confirmDeleteIssue = async () => {
    if (!issue || deleting) return;
    setDeleting(true);
    try {
      await deleteIssue(issue.id);
      navigate('/issues');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete issue.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Handle Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await createComment(issue.id, { body: newComment.trim() });
      const created = res.data?.data || res.data?.comment || {
        id: Date.now(),
        body: newComment.trim(),
        user: user,
        created_at: new Date().toISOString(),
      };
      setComments((prev) => [...prev, created]);
      setNewComment('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId) => {
    if (deletingCommentId) return;
    setDeletingCommentId(commentId);
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete comment.');
    } finally {
      setDeletingCommentId(null);
    }
  };

  // ─── Loading Skeleton ───────────────────────────────────────────────────
  if (loading && !issue) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className={`h-4 w-48 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-3">
              <div className={`h-8 w-3/4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
              <div className={`h-4 w-1/2 rounded ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}`} />
            </div>

            <div className={`h-24 w-full rounded-2xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-200/60'}`} />

            <div className="space-y-4 pt-6">
              <div className={`h-5 w-32 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
              <div className={`h-20 w-full rounded-xl ${isDark ? 'bg-slate-700/40' : 'bg-slate-200/50'}`} />
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-2">
              <div className={`h-3.5 w-16 rounded ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}`} />
              <div className={`h-10 w-full rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            </div>
            <div className="space-y-2">
              <div className={`h-3.5 w-16 rounded ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}`} />
              <div className={`h-6 w-20 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            </div>
            <div className="space-y-2">
              <div className={`h-3.5 w-16 rounded ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}`} />
              <div className={`h-10 w-full rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            </div>
            <div className="space-y-2">
              <div className={`h-3.5 w-16 rounded ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}`} />
              <div className={`h-5 w-40 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────
  if (error && !issue) {
    return (
      <div
        className={`p-6 text-center rounded-2xl border ${
          isDark
            ? 'bg-slate-800/80 border-slate-700 text-slate-300'
            : 'bg-white border-slate-200 text-slate-700'
        }`}
      >
        <p className="font-semibold text-lg">{error || 'Issue not found'}</p>
        <button
          onClick={fetchIssueData}
          className="mt-4 px-4 py-2 text-sm font-semibold rounded-xl bg-slate-900 text-white cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const allowedTransitions = getAllowedTransitions(user, issue);
  const canTransition = canChangeStatus(user, issue);
  const canEdit = canEditIssue(user, issue);
  const canDelete = canDeleteIssue(user);

  const priorityInfo = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.low;

  return (
    <div className="space-y-8">
      {/* ─── Breadcrumb ───────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-sm font-medium">
        <Link
          to="/issues"
          className={`transition-colors hover:underline ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Issues
        </Link>
        <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        <span className={`font-semibold truncate max-w-md ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {issue.title}
        </span>
      </nav>

      {/* ─── Main Two-Column Layout ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* ─── Left Column (Main Content) ─────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Title & Edit/Delete Action Buttons */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1
                className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {issue.title}
              </h1>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 pt-0.5">
                {canEdit && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${
                      isDark
                        ? 'border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${
                      isDark
                        ? 'border-slate-700 text-red-400 hover:bg-red-950/40 hover:border-red-900/60'
                        : 'border-red-200 text-red-600 hover:bg-red-50'
                    }`}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Subtitle */}
            <p
              className={`text-sm mt-2 font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {issue.project?.name || `Project #${issue.project_id}`} · opened by{' '}
              {issue.creator?.name || 'Unknown'} · {formatRelativeTime(issue.created_at)}
            </p>
          </div>

          {/* Description */}
          <div
            className={`text-sm leading-relaxed whitespace-pre-wrap ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            {issue.description || 'No description provided.'}
          </div>

          {/* ─── Comments Section ─────────────────────────────────────────── */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h2
              className={`text-base font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Comments ({comments.length})
            </h2>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          isDark ? 'text-slate-100' : 'text-slate-900'
                        }`}
                      >
                        {comment.user?.name || 'User'}
                      </span>
                      <span
                        className={`text-xs ${
                          isDark ? 'text-slate-400' : 'text-slate-400'
                        }`}
                      >
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>

                    {canDeleteComment(user, comment) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                        title="Delete comment"
                        className="text-slate-400 hover:text-red-400 transition-colors p-1 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p
                    className={`text-sm leading-relaxed whitespace-pre-wrap ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    {comment.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Add Comment Box */}
            <form onSubmit={handleAddComment} className="pt-3 space-y-2.5">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all resize-none focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-slate-800/90 border-slate-700 text-slate-100 placeholder-slate-400 focus:ring-slate-600'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-slate-300'
                }`}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 ${
                    isDark
                      ? 'bg-white text-slate-900 hover:bg-slate-100'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {submittingComment ? (
                    <span className="inline-flex items-center gap-2">
                      <MorphingSpinner size="xs" />
                      Posting...
                    </span>
                  ) : (
                    'Post comment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ─── Right Column (Sidebar / Metadata) ──────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status */}
          <div className="space-y-1.5">
            <label
              className={`text-sm font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Status
            </label>
            {canTransition ? (
              <div className="relative">
                <select
                  value={issue.status}
                  disabled={updatingField}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`w-full pl-3.5 pr-9 py-2.5 text-sm font-semibold rounded-xl border appearance-none transition-all cursor-pointer focus:outline-none focus:ring-2 disabled:opacity-50 ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-100 focus:ring-slate-600'
                      : 'bg-white border-slate-200 text-slate-900 shadow-2xs focus:ring-slate-300'
                  }`}
                >
                  <option value={issue.status}>
                    {STATUS_LABELS[issue.status] || issue.status}
                  </option>
                  {allowedTransitions.map((st) => (
                    <option
                      key={st}
                      value={st}
                      className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}
                    >
                      {STATUS_LABELS[st] || st}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                    isDark ? 'text-slate-400' : 'text-slate-400'
                  }`}
                />
              </div>
            ) : (
              <div
                className={`px-3.5 py-2 text-sm font-semibold rounded-xl border inline-block ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                {STATUS_LABELS[issue.status] || issue.status}
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label
              className={`text-sm font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Priority
            </label>
            <div>
              {priorityInfo.label !== 'Low' ? (
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border inline-block ${
                    priorityInfo[isDark ? 'dark' : 'light']
                  }`}
                >
                  {priorityInfo.label}
                </span>
              ) : (
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border inline-block ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-300'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  Low
                </span>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <label
              className={`text-sm font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Assignee
            </label>
            {canEdit ? (
              <div className="relative">
                <select
                  value={issue.assigned_to || ''}
                  disabled={updatingField}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className={`w-full pl-3.5 pr-9 py-2.5 text-sm font-semibold rounded-xl border appearance-none transition-all cursor-pointer focus:outline-none focus:ring-2 disabled:opacity-50 ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-100 focus:ring-slate-600'
                      : 'bg-white border-slate-200 text-slate-900 shadow-2xs focus:ring-slate-300'
                  }`}
                >
                  <option value="">Unassigned</option>
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
                <ChevronDown
                  className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                    isDark ? 'text-slate-400' : 'text-slate-400'
                  }`}
                />
              </div>
            ) : (
              <div
                className={`font-semibold text-sm ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                {issue.assignee?.name || 'Unassigned'}
              </div>
            )}
          </div>

          {/* Project */}
          <div className="space-y-1">
            <label
              className={`text-sm font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Project
            </label>
            <div>
              <Link
                to={`/projects/${issue.project_id}`}
                className={`font-bold text-sm hover:underline block ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {issue.project?.name || `Project #${issue.project_id}`}
              </Link>
            </div>
          </div>

          {/* Branch */}
          <div className="space-y-1">
            <label
              className={`text-sm font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Branch
            </label>
            <div>
              <code
                className={`font-mono text-xs ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {issue.branch_name || 'None'}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Edit Issue Modal ─────────────────────────────────────────────── */}
      {showEditModal && (
        <IssueForm
          projectId={issue.project_id}
          issue={issue}
          users={usersList}
          onSuccess={() => {
            setShowEditModal(false);
            fetchIssueData();
          }}
          onCancel={() => setShowEditModal(false)}
        />
      )}

      {/* ─── Delete Issue Confirmation Modal ──────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => !deactivating && setShowDeleteModal(false)}
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
                <h3 className="text-base font-bold text-red-400">Delete Issue?</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Are you sure you want to delete{' '}
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {issue.title}
              </span>
              ?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
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
                onClick={confirmDeleteIssue}
                disabled={deleting}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <span className="inline-flex items-center gap-2">
                    <MorphingSpinner size="xs" />
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
