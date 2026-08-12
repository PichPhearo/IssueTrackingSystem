import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { getAllowedTransitions, canChangeStatus } from '../../utils/permissions';
import { updateStatus } from '../../api/issues';
import { MessageSquare, GripVertical } from 'lucide-react';

// ─── Status Column Config ────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'open', label: 'Open', color: '#F59E0B', darkBg: 'bg-amber-950/30', lightBg: 'bg-amber-50/60' },
  { key: 'in_progress', label: 'In Progress', color: '#3B82F6', darkBg: 'bg-blue-950/30', lightBg: 'bg-blue-50/60' },
  { key: 'resolved', label: 'Resolved', color: '#22C55E', darkBg: 'bg-emerald-950/30', lightBg: 'bg-emerald-50/60' },
  { key: 'verified', label: 'Verified', color: '#8B5CF6', darkBg: 'bg-purple-950/30', lightBg: 'bg-purple-50/60' },
  { key: 'closed', label: 'Closed', color: '#94A3B8', darkBg: 'bg-slate-800/30', lightBg: 'bg-slate-100/60' },
];

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', dark: 'bg-red-950 text-red-300 border border-red-700', light: 'bg-red-200 text-red-800 border border-red-300' },
  high: { label: 'High', dark: 'bg-red-950/80 text-red-400 border border-red-800/50', light: 'bg-red-100 text-red-700 border border-red-200' },
  medium: { label: 'Medium', dark: 'bg-amber-950/80 text-amber-400 border border-amber-800/50', light: 'bg-amber-100 text-amber-700 border border-amber-200' },
  low: { label: 'Low', dark: 'text-slate-400', light: 'text-slate-500' },
};

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d`;
  return `${Math.floor(diffInDays / 30)}mo`;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function KanbanBoard({ issues, loading, onStatusChange }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [draggedIssue, setDraggedIssue] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // Group issues by status
  const columnData = {};
  COLUMNS.forEach((col) => {
    columnData[col.key] = (issues || []).filter((i) => i.status === col.key);
  });

  // ─── Toast helper ──────────────────────────────────────────────────────

  const showToast = (message, type = 'error') => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  // ─── Drag & Drop ───────────────────────────────────────────────────────

  const handleDragStart = (e, issue) => {
    setDraggedIssue(issue);
    e.dataTransfer.effectAllowed = 'move';
    // Make ghost slightly transparent
    if (e.target) {
      setTimeout(() => {
        e.target.style.opacity = '0.4';
      }, 0);
    }
  };

  const handleDragEnd = (e) => {
    if (e.target) e.target.style.opacity = '1';
    setDraggedIssue(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, columnKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnKey) {
      setDragOverColumn(columnKey);
    }
  };

  const handleDragLeave = (e, columnKey) => {
    // Only clear if truly leaving the column
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (dragOverColumn === columnKey) setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedIssue || draggedIssue.status === targetStatus) {
      setDraggedIssue(null);
      return;
    }

    // Check if user has permission to move this issue
    if (!canChangeStatus(user, draggedIssue)) {
      showToast('You do not have permission to move this issue.');
      setDraggedIssue(null);
      return;
    }

    // Check if user is allowed to perform this transition
    const allowed = getAllowedTransitions(user, draggedIssue);
    if (!allowed.includes(targetStatus)) {
      const colLabel = COLUMNS.find((c) => c.key === targetStatus)?.label || targetStatus;
      showToast(`Cannot move to "${colLabel}" — transition not allowed for your role.`);
      setDraggedIssue(null);
      return;
    }

    const targetIssue = draggedIssue;
    setDraggedIssue(null);
    setUpdatingId(targetIssue.id);

    try {
      if (onStatusChange) {
        await onStatusChange(targetIssue.id, targetStatus);
      } else {
        await updateStatus(targetIssue.id, targetStatus);
      }
      showToast('Status updated successfully', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status.';
      showToast(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  // ─── Loading Skeleton ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 animate-pulse">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className={`flex-shrink-0 w-72 rounded-xl border p-3 space-y-3 ${
              isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`h-5 w-24 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`h-28 rounded-lg ${isDark ? 'bg-slate-700/60' : 'bg-slate-200/80'}`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border transition-all animate-in slide-in-from-right duration-200 ${
            toast.type === 'success'
              ? isDark
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isDark
                ? 'bg-red-950 text-red-300 border-red-800'
                : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colIssues = columnData[col.key] || [];
          const isOver = dragOverColumn === col.key;
          const canDropHere =
            draggedIssue &&
            draggedIssue.status !== col.key &&
            getAllowedTransitions(user, draggedIssue).includes(col.key);

          return (
            <div
              key={col.key}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={(e) => handleDragLeave(e, col.key)}
              onDrop={(e) => handleDrop(e, col.key)}
              className={`flex-shrink-0 w-72 rounded-xl border transition-all duration-150 flex flex-col ${
                isDark
                  ? `border-slate-800 ${isOver && canDropHere ? 'border-blue-600 bg-blue-950/20' : isOver && !canDropHere ? 'border-red-700 bg-red-950/10' : 'bg-slate-800/30'}`
                  : `border-slate-200 ${isOver && canDropHere ? 'border-blue-400 bg-blue-50/50' : isOver && !canDropHere ? 'border-red-300 bg-red-50/30' : 'bg-slate-50/50'}`
              }`}
              style={{ minHeight: '200px' }}
            >
              {/* Column Header */}
              <div
                className={`flex items-center justify-between px-3.5 py-3 border-b ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: col.color }}
                  />
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    {col.label}
                  </span>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    isDark ? 'bg-slate-700/80 text-slate-400' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {colIssues.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto" style={{ maxHeight: '65vh' }}>
                {colIssues.length > 0 ? (
                  colIssues.map((issue) => (
                    <KanbanCard
                      key={issue.id}
                      issue={issue}
                      isDark={isDark}
                      isUpdating={updatingId === issue.id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onClick={() => navigate(`/issues/${issue.id}`)}
                    />
                  ))
                ) : (
                  <div
                    className={`flex items-center justify-center h-20 rounded-lg border border-dashed text-xs ${
                      isDark
                        ? 'border-slate-700 text-slate-500'
                        : 'border-slate-300 text-slate-400'
                    }`}
                  >
                    No issues
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Kanban Card ─────────────────────────────────────────────────────────────

function KanbanCard({ issue, isDark, isUpdating, onDragStart, onDragEnd, onClick }) {
  const { user } = useAuth();
  const priorityInfo = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.low;
  const canDrag = canChangeStatus(user, issue) && !isUpdating;

  return (
    <div
      draggable={canDrag}
      onDragStart={(e) => canDrag && onDragStart(e, issue)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group relative rounded-lg border p-3 cursor-pointer transition-all select-none ${
        isUpdating ? 'opacity-50 pointer-events-none animate-pulse' : ''
      } ${
        isDark
          ? 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Drag Handle (visible on hover for any issue the user can drag) */}
      {canDrag && (
        <div
          className={`absolute top-2.5 right-2 opacity-0 group-hover:opacity-60 transition-opacity ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      )}

      {/* Title */}
      <p
        className={`text-sm font-semibold leading-snug pr-5 line-clamp-2 ${
          isDark ? 'text-slate-100' : 'text-slate-900'
        }`}
      >
        {issue.title}
      </p>

      {/* Project Name */}
      <p
        className={`text-[11px] mt-1.5 truncate ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}
      >
        {issue.project?.name || `Project #${issue.project_id}`}
      </p>

      {/* Footer: Priority + Assignee + Time */}
      <div className="flex items-center justify-between mt-3 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Priority Badge */}
          {priorityInfo.label !== 'Low' ? (
            <span
              className={`px-1.5 py-0.5 text-[10px] font-semibold rounded shrink-0 ${
                priorityInfo[isDark ? 'dark' : 'light']
              }`}
            >
              {priorityInfo.label}
            </span>
          ) : (
            <span
              className={`text-[10px] font-medium shrink-0 ${
                priorityInfo[isDark ? 'dark' : 'light']
              }`}
            >
              Low
            </span>
          )}

          {/* Assignee */}
          {issue.assignee?.name && (
            <span
              className={`text-[10px] truncate ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              · {issue.assignee.name.split(' ')[0]}
            </span>
          )}
        </div>

        {/* Relative Time */}
        <span
          className={`text-[10px] whitespace-nowrap shrink-0 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          {formatRelativeTime(issue.updated_at || issue.created_at)}
        </span>
      </div>
    </div>
  );
}
