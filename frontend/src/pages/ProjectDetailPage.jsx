import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import {
  canEditProject,
  canDeleteProject,
  canManageMembers,
  canCreateIssue,
} from '../utils/permissions';
import { getProject, deleteProject, removeMember } from '../api/projects';
import { getIssues } from '../api/issues';
import ProjectForm from '../components/projects/ProjectForm';
import AddMemberModal from '../components/projects/AddMemberModal';
import IssueForm from '../components/issues/IssueForm';
import { ChevronRight, Ellipsis, UserPlus, Plus, X } from 'lucide-react';
import { MorphingSpinner } from '../components/reactbit/loading';

const EMPTY_MEMBERS = [];

const ROLE_INITIALS = {
  admin: 'AD',
  project_manager: 'PM',
  developer: 'DEV',
  qa: 'QA',
};

const ROLE_BADGE_STYLES = {
  admin: {
    dark: 'bg-red-950/90 text-red-400 border-red-800/60',
    light: 'bg-red-100 text-red-700 border-red-200',
  },
  project_manager: {
    dark: 'bg-blue-950/90 text-blue-400 border-blue-800/60',
    light: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  developer: {
    dark: 'bg-indigo-950/90 text-indigo-400 border-indigo-800/60',
    light: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  qa: {
    dark: 'bg-amber-950/90 text-amber-400 border-amber-800/60',
    light: 'bg-amber-100 text-amber-700 border-amber-200',
  },
};

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

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateIssueModal, setShowCreateIssueModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Member removal confirmation state
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removingMember, setRemovingMember] = useState(false);

  const fetchingRef = useRef(false);

  const fetchProjectData = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const [projRes, issueRes] = await Promise.all([
        getProject(id),
        getIssues({ project_id: id }),
      ]);
      setProject(projRes.data?.data || projRes.data);
      setIssues(issueRes.data?.data || issueRes.data || []);
    } catch {
      setError('Failed to load project details.');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [id]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  // Actions
  const handleDeleteProject = async () => {
    if (!project || deleting) return;
    setDeleting(true);
    try {
      await deleteProject(project.id);
      navigate('/projects');
    } catch {
      setError('Failed to delete project.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove || removingMember) return;
    setRemovingMember(true);
    try {
      await removeMember(project.id, memberToRemove.id);
      setMemberToRemove(null);
      fetchProjectData();
    } catch {
      setError('Failed to remove member.');
    } finally {
      setRemovingMember(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCreatorLabel = (proj) => {
    if (proj.creator?.name) {
      const role = proj.creator.role ? ` (${proj.creator.role})` : '';
      return `${proj.creator.name}${role}`;
    }
    return 'Unknown';
  };

  // Loading Skeleton
  if (loading && !project) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className={`h-6 w-48 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
        <div className={`h-10 w-96 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
        <div className={`h-16 w-full rounded-xl ${isDark ? 'bg-slate-700/60' : 'bg-slate-200/80'}`} />
        <div className={`h-32 w-full rounded-xl ${isDark ? 'bg-slate-700/60' : 'bg-slate-200/80'}`} />
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div
        className={`p-6 text-center rounded-2xl border ${
          isDark
            ? 'bg-slate-800/80 border-slate-700 text-slate-300'
            : 'bg-white border-slate-200 text-slate-700'
        }`}
      >
        <p className="font-semibold text-lg">{error || 'Project not found'}</p>
        <button
          onClick={fetchProjectData}
          className="mt-4 px-4 py-2 text-sm font-semibold rounded-xl bg-slate-900 text-white cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  // Stable empty fallback — `|| []` creates a new array every render and
  // retriggered AddMemberModal's users fetch when it depended on existingMembers
  const membersList = project.members ?? EMPTY_MEMBERS;

  return (
    <div className="space-y-8">
      {/* ─── Breadcrumb Nav ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link
            to="/projects"
            className={`transition-colors hover:underline ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Projects
          </Link>
          <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {project.name}
          </span>
        </nav>
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

      {/* ─── Project Title & Actions ───────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1
            className={`text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {project.name}
          </h1>

          <div className="flex items-center gap-2.5 shrink-0">
            {canEditProject(user) && (
              <button
                onClick={() => setShowEditModal(true)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Edit
              </button>
            )}

            {canDeleteProject(user) && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-red-900/60 text-red-400 hover:bg-red-950/40 hover:border-red-800'
                    : 'border-red-200 text-red-600 hover:bg-red-50'
                }`}
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Project Description + Metadata */}
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {project.description ? `${project.description} ` : ''}
          Created by <span className="font-semibold">{getCreatorLabel(project)}</span> on{' '}
          {formatDate(project.created_at)}.
        </p>
      </div>

      {/* ─── Members Section ───────────────────────────────────────────────── */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2
            className={`text-sm font-bold tracking-wide uppercase ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            Members ({membersList.length})
          </h2>

          {canManageMembers(user) && (
            <button
              onClick={() => setShowAddMemberModal(true)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-700 text-slate-200 bg-slate-800/80 hover:bg-slate-700 hover:text-white'
                  : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add member
            </button>
          )}
        </div>

        {/* Member chips row */}
        <div className="flex flex-wrap items-center gap-3">
          {membersList.length > 0 ? (
            membersList.map((member) => {
              const roleKey = member.role || 'developer';
              const roleInitials = ROLE_INITIALS[roleKey] || 'DEV';
              const badgeStyle =
                (ROLE_BADGE_STYLES[roleKey] || ROLE_BADGE_STYLES.developer)[
                  isDark ? 'dark' : 'light'
                ];

              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                      : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                  }`}
                >
                  {/* Circle Badge with Role Initials */}
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 ${badgeStyle}`}
                  >
                    {roleInitials}
                  </span>
                  <span>{member.name}</span>

                  {canManageMembers(user) && (
                    <button
                      onClick={() => setMemberToRemove(member)}
                      className={`ml-0.5 p-0.5 rounded-full transition-colors cursor-pointer ${
                        isDark
                          ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                      title={`Remove ${member.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
              No members assigned to this project yet.
            </p>
          )}
        </div>
      </div>

      {/* ─── Issues Section ────────────────────────────────────────────────── */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2
            className={`text-sm font-bold tracking-wide uppercase ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            Issues ({issues.length})
          </h2>

          {canCreateIssue(user) && (
            <button
              onClick={() => setShowCreateIssueModal(true)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-700 text-slate-200 bg-slate-800/80 hover:bg-slate-700 hover:text-white'
                  : 'border-slate-900 text-white bg-slate-900 hover:bg-slate-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              New issue
            </button>
          )}
        </div>

        {/* Issues List Table */}
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
            <div className="col-span-2">Priority</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3 text-right">Assigned to</div>
          </div>

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

                  {/* Priority Pill */}
                  <div className="col-span-2 flex justify-start">
                    {priorityInfo.label !== 'Low' ? (
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
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

                  {/* Status Pill */}
                  <div className="col-span-2 flex justify-start">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        statusInfo[isDark ? 'dark' : 'light']
                      }`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Assignee */}
                  <div
                    className={`col-span-3 text-right font-medium truncate ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {issue.assignee?.name || 'Unassigned'}
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
              No issues logged for this project yet.
            </div>
          )}
        </div>
      </div>

      {/* ─── Modals ───────────────────────────────────────────────────────── */}
      {/* Edit Project Modal */}
      {showEditModal && (
        <ProjectForm
          project={project}
          onSuccess={() => {
            setShowEditModal(false);
            fetchProjectData();
          }}
          onCancel={() => setShowEditModal(false)}
        />
      )}

      {/* Delete Project Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowDeleteModal(false)}
          />
          <div
            className={`relative w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl border transition-colors ${
              isDark
                ? 'bg-slate-900 border-slate-750 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <h3 className="text-lg font-bold text-red-400">Delete Project?</h3>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Are you sure you want to delete <span className="font-semibold text-white">{project.name}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
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
                onClick={handleDeleteProject}
                disabled={deleting}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <span className="inline-flex items-center gap-2">
                    <MorphingSpinner size="xs" />
                    Deleting...
                  </span>
                ) : (
                  'Delete Project'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMemberToRemove(null)}
          />
          <div
            className={`relative w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl border transition-colors ${
              isDark
                ? 'bg-slate-900 border-slate-750 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <h3 className="text-lg font-bold text-red-400">Remove Member?</h3>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Are you sure you want to remove{' '}
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {memberToRemove.name}
              </span>{' '}
              from this project?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setMemberToRemove(null)}
                disabled={removingMember}
                className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveMember}
                disabled={removingMember}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 cursor-pointer disabled:opacity-50"
              >
                {removingMember ? (
                  <span className="inline-flex items-center gap-2">
                    <MorphingSpinner size="xs" />
                    Removing...
                  </span>
                ) : (
                  'Remove Member'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <AddMemberModal
          projectId={id}
          existingMembers={membersList}
          onSuccess={() => {
            setShowAddMemberModal(false);
            fetchProjectData();
          }}
          onCancel={() => setShowAddMemberModal(false)}
        />
      )}

      {/* Create Issue Modal */}
      {showCreateIssueModal && (
        <IssueForm
          projectId={id}
          onSuccess={() => {
            setShowCreateIssueModal(false);
            fetchProjectData();
          }}
          onCancel={() => setShowCreateIssueModal(false)}
        />
      )}
    </div>
  );
}
