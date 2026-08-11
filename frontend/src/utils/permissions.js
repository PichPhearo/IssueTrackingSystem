import { ROLES } from '../constants/roles';
import {
  LayoutDashboard,
  FolderKanban,
  CircleDot,
  Users,
  UserCheck,
} from 'lucide-react';

// ─── Role Helpers ────────────────────────────────────────────────────────────

const isAdmin = (user) => user?.role === ROLES.ADMIN;
const isPM = (user) => user?.role === ROLES.PROJECT_MANAGER;
const isDev = (user) => user?.role === ROLES.DEVELOPER;
const isQA = (user) => user?.role === ROLES.QA;
const isAdminOrPM = (user) => isAdmin(user) || isPM(user);

// ─── Navigation Visibility ──────────────────────────────────────────────────

/**
 * All possible nav items. The `roles` array defines which roles can see it.
 * If `roles` is omitted or empty, every authenticated user sees it.
 */
const ALL_NAV_ITEMS = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: 'Projects',
    path: '/projects',
    icon: FolderKanban,
  },
  {
    name: 'Issues',
    path: '/issues',
    icon: CircleDot,
  },
  {
    name: 'My Issues',
    path: '/my-issues',
    icon: UserCheck,
    roles: [ROLES.DEVELOPER, ROLES.QA],
  },
  {
    name: 'Users',
    path: '/admin/users',
    icon: Users,
    roles: [ROLES.ADMIN],
  },
];

/**
 * Returns the nav items the current user is allowed to see.
 * Items without a `roles` constraint are visible to everyone.
 */
export const getNavItems = (user) => {
  if (!user) return [];
  return ALL_NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );
};

// ─── Project Permissions ────────────────────────────────────────────────────

/** Everyone can view projects */
export const canViewProjects = (_user) => true;

/** Admin & PM can create projects */
export const canCreateProject = (user) => isAdminOrPM(user);

/** Admin & PM can edit projects */
export const canEditProject = (user) => isAdminOrPM(user);

/** Only Admin can delete projects */
export const canDeleteProject = (user) => isAdmin(user);

/** Admin & PM can add/remove project members */
export const canManageMembers = (user) => isAdminOrPM(user);

// ─── Issue Permissions ──────────────────────────────────────────────────────

/** Everyone can view issues */
export const canViewIssues = (_user) => true;

/** Admin & PM can create issues */
export const canCreateIssue = (user) => isAdminOrPM(user);

/**
 * Admin & PM can edit any issue.
 * Developer can edit only if they are the assignee.
 */
export const canEditIssue = (user, issue) => {
  if (!user || !issue) return false;
  if (isAdminOrPM(user)) return true;
  if (isDev(user) && issue.assigned_to === user.id) return true;
  return false;
};

/** Admin & PM can delete issues */
export const canDeleteIssue = (user) => isAdminOrPM(user);

/**
 * Admin, PM, QA can change status on any issue.
 * Developer can change status only if they are the assignee.
 */
export const canChangeStatus = (user, issue) => {
  if (!user || !issue) return false;
  if (isAdminOrPM(user) || isQA(user)) return true;
  if (isDev(user) && issue.assigned_to === user.id) return true;
  return false;
};

/** Admin, PM, and QA can verify issues */
export const canVerifyIssue = (user) => {
  if (!user) return false;
  return isAdmin(user) || isPM(user) || isQA(user);
};

// ─── Issue Status Transitions ───────────────────────────────────────────────

/**
 * Status workflow — maps current status to all structurally-allowed next statuses.
 * Mirrors the backend IssueStatus::allowedTransitions().
 */
const STATUS_TRANSITIONS = {
  open: ['in_progress', 'closed'],
  in_progress: ['resolved', 'open'],
  resolved: ['verified', 'open', 'in_progress'],
  verified: ['closed', 'open'],
  closed: ['open'],
};

/**
 * Returns the list of statuses the given user can transition the issue to,
 * considering both the workflow graph and the user's role.
 *
 * - Admin / PM: all structural transitions allowed
 * - Developer (assigned): all structural transitions except → verified
 * - QA: all structural transitions allowed
 * - Everyone else: none
 */
export const getAllowedTransitions = (user, issue) => {
  if (!user || !issue) return [];

  const currentStatus = issue.status;
  const possible = STATUS_TRANSITIONS[currentStatus] || [];

  // Not authorised to change status at all
  if (!canChangeStatus(user, issue)) return [];

  // Developers cannot verify — filter out 'verified'
  if (isDev(user)) {
    return possible.filter((s) => s !== 'verified');
  }

  return possible;
};

// ─── Comment Permissions ────────────────────────────────────────────────────

/** Everyone can add comments */
export const canAddComment = (_user) => true;

/**
 * Admin can delete any comment.
 * Other users can only delete their own comments.
 */
export const canDeleteComment = (user, comment) => {
  if (!user || !comment) return false;
  if (isAdmin(user)) return true;
  return comment.user_id === user.id;
};

// ─── User Management ────────────────────────────────────────────────────────

/** Only Admin can view the user management list */
export const canViewUsers = (user) => isAdmin(user);

/** Only Admin can change roles */
export const canChangeRole = (user) => isAdmin(user);

/** Only Admin can toggle active/inactive */
export const canToggleActive = (user) => isAdmin(user);
