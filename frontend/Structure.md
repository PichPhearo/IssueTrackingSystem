# IssueFlow — React Frontend Folder Structure

Matches the Laravel API you already built (Sanctum auth, 4 roles, projects →
issues → comments, status workflow). Same philosophy as the backend: flat,
no over-engineering, nothing you don't need for the MVP.

Assumes Vite + React + React Router. Swap `axios` for `fetch` if you prefer
— doesn't change the structure.

```text
issueflow-web/
├── src/
│   ├── api/
│   │   ├── client.js                 # axios instance, baseURL, attaches Bearer token
│   │   ├── auth.js                   # login(), register(), logout(), me()
│   │   ├── projects.js               # getProjects, createProject, addMember, removeMember
│   │   ├── issues.js                 # getIssues, createIssue, updateIssue, updateStatus
│   │   ├── comments.js               # getComments, createComment, deleteComment
│   │   └── users.js                  # admin: getUsers, updateRole, toggleActive
│   │
│   ├── context/
│   │   └── AuthContext.jsx           # current user, role, login/logout, token storage
│   │
│   ├── hooks/
│   │   ├── useAuth.js                # wraps AuthContext
│   │   └── useRole.js                # isAdmin(), isPM(), isDev(), isQA() helpers
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx    # redirects to /login if no token
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   │
│   │   ├── projects/
│   │   │   ├── ProjectList.jsx
│   │   │   ├── ProjectCard.jsx
│   │   │   ├── ProjectForm.jsx       # create/edit, admin+PM only
│   │   │   └── ProjectMembers.jsx    # add/remove members, admin+PM only
│   │   │
│   │   ├── issues/
│   │   │   ├── IssueList.jsx         # filterable by project/status/assignee
│   │   │   ├── IssueCard.jsx
│   │   │   ├── IssueForm.jsx         # create/edit
│   │   │   ├── IssueDetail.jsx       # single issue + comments
│   │   │   └── IssueStatusBadge.jsx  # colored badge per status
│   │   │
│   │   ├── comments/
│   │   │   ├── CommentList.jsx
│   │   │   └── CommentForm.jsx
│   │   │
│   │   └── users/                    # admin only
│   │       ├── UserList.jsx
│   │       └── UserRoleForm.jsx
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx         # project list, entry point after login
│   │   ├── ProjectDetailPage.jsx     # issues within a project
│   │   ├── IssueDetailPage.jsx
│   │   └── UserManagementPage.jsx    # admin only
│   │
│   ├── constants/
│   │   ├── roles.js                  # ADMIN, PROJECT_MANAGER, DEVELOPER, QA
│   │   ├── priorities.js             # LOW, MEDIUM, HIGH, CRITICAL
│   │   └── statuses.js               # OPEN, IN_PROGRESS, RESOLVED, VERIFIED, CLOSED, REOPENED
│   │
│   ├── utils/
│   │   └── permissions.js            # canEditIssue(user, issue), canDeleteComment(user, comment) — mirrors your Laravel policies
│   │
│   ├── App.jsx                       # routes
│   ├── main.jsx                      # entry point
│   └── index.css
│
├── .env.example                      # VITE_API_URL=http://localhost:8000/api
├── index.html
├── package.json
└── vite.config.js
```

## Why it's shaped this way

- **`api/`** — one file per Laravel resource, mirrors your `routes/api.php`
  grouping exactly (projects.js ↔ ProjectController, issues.js ↔
  IssueController, etc.). Keeps API calls out of components.
- **`context/AuthContext.jsx`** — the single source of truth for "who's
  logged in and what's their role," since almost every screen needs it.
  No Redux/Zustand needed at this scope — Context + `useAuth` is enough.
- **`utils/permissions.js`** — client-side mirror of your Laravel policies,
  used purely for UX (hiding buttons a user can't use). The real
  enforcement stays on the backend, same principle your README called out.
  Keep this file thin — it's a convenience layer, not a security boundary.
- **`components/` split by resource** (projects/issues/comments/users) —
  matches your backend's controller split, easy to find things.
- **No global state library, no service/repository abstraction** — same
  "don't over-engineer" rule as the backend. `useState`/`useEffect` +
  Context is enough for a one-day MVP.
- **`constants/`** — mirrors your Laravel Enums (`UserRole`, `IssuePriority`,
  `IssueStatus`) so the frontend and backend never drift on valid values.

## Suggested page → route mapping

```text
/login              LoginPage
/register           RegisterPage
/                   DashboardPage         (project list)
/projects/:id       ProjectDetailPage     (issues in that project)
/issues/:id         IssueDetailPage       (detail + comments + status change)
/admin/users        UserManagementPage    (admin only, wrapped in role check)
```

## Quick scaffolding commands

```bash
npm create vite@latest issueflow-web -- --template react
cd issueflow-web
npm install axios react-router-dom

mkdir -p src/{api,context,hooks,components/{layout,auth,projects,issues,comments,users},pages,constants,utils}
```