# IssueFlow — Laravel Backend Folder Structure

Based on the README: a Laravel REST API (Sanctum auth, PostgreSQL, role-based
authorization via Policies) that serves a separate React frontend. This
structure keeps things flat and MVP-appropriate — no over-engineering, no
service/repository layers you don't need yet.

```text
issueflow-api/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── Auth/
│   │   │       │   ├── RegisterController.php
│   │   │       │   ├── LoginController.php
│   │   │       │   └── LogoutController.php
│   │   │       ├── UserController.php          # admin: list/create/edit/role/deactivate
│   │   │       ├── ProjectController.php        # CRUD + members
│   │   │       ├── ProjectMemberController.php   # add/remove members
│   │   │       ├── IssueController.php          # CRUD
│   │   │       ├── IssueStatusController.php    # PATCH /issues/{id}/status
│   │   │       └── CommentController.php        # GET/POST /issues/{id}/comments
│   │   │
│   │   ├── Middleware/
│   │   │   └── CheckRole.php                    # role:admin, role:project_manager, etc.
│   │   │
│   │   ├── Requests/
│   │   │   ├── Auth/
│   │   │   │   ├── RegisterRequest.php
│   │   │   │   └── LoginRequest.php
│   │   │   ├── StoreProjectRequest.php
│   │   │   ├── UpdateProjectRequest.php
│   │   │   ├── StoreIssueRequest.php
│   │   │   ├── UpdateIssueRequest.php
│   │   │   ├── UpdateIssueStatusRequest.php
│   │   │   ├── StoreCommentRequest.php
│   │   │   └── UpdateUserRequest.php
│   │   │
│   │   └── Resources/
│   │       ├── UserResource.php
│   │       ├── ProjectResource.php
│   │       ├── IssueResource.php
│   │       ├── IssueDetailResource.php          # includes comments, history-ish fields
│   │       └── CommentResource.php
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── Project.php
│   │   ├── ProjectMember.php
│   │   ├── Issue.php
│   │   └── Comment.php
│   │
│   ├── Policies/
│   │   ├── ProjectPolicy.php
│   │   ├── IssuePolicy.php
│   │   ├── CommentPolicy.php
│   │   └── UserPolicy.php
│   │
│   ├── Enums/
│   │   ├── UserRole.php                         # admin, project_manager, developer, qa
│   │   ├── IssuePriority.php                    # low, medium, high, critical
│   │   └── IssueStatus.php                      # open, in_progress, resolved, verified, closed, reopened
│   │
│   └── Providers/
│       └── AuthServiceProvider.php              # register policies here
│
├── bootstrap/
│   └── app.php                                  # middleware aliases (role, etc.) — Laravel 11 style
│
├── config/
│   ├── cors.php                                 # allow the React dev origin
│   └── sanctum.php
│
├── database/
│   ├── migrations/
│   │   ├── xxxx_create_users_table.php
│   │   ├── xxxx_create_projects_table.php
│   │   ├── xxxx_create_project_members_table.php
│   │   ├── xxxx_create_issues_table.php
│   │   └── xxxx_create_comments_table.php
│   │
│   ├── factories/
│   │   ├── UserFactory.php
│   │   ├── ProjectFactory.php
│   │   └── IssueFactory.php
│   │
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── RoleUserSeeder.php                   # one admin/PM/dev/QA per role for the demo
│       └── DemoProjectSeeder.php                # "Healthcare Web Portal" + issue #101 flow
│
├── routes/
│   ├── api.php                                  # all routes below live here
│   └── console.php
│
├── tests/
│   ├── Feature/
│   │   ├── Auth/
│   │   │   ├── RegisterTest.php
│   │   │   └── LoginTest.php
│   │   ├── ProjectTest.php
│   │   ├── IssueTest.php
│   │   ├── IssueStatusWorkflowTest.php          # open→in_progress→resolved→verified/reopened→closed
│   │   ├── CommentTest.php
│   │   └── AuthorizationTest.php                # role-restricted endpoint checks
│   └── Unit/
│       └── IssueStatusTransitionTest.php        # if you encode transition rules on the model
│
├── postman/
│   └── IssueFlow.postman_collection.json        # exported collection per the README's test list
│
├── .env.example
└── composer.json
```

## Why it's shaped this way

- **`Enums/`** for role, priority, and status — keeps the status workflow
  (Open → In Progress → Resolved → Verified/Reopened → Closed) and role
  checks out of magic strings, without adding a state-machine package.
- **`Policies/` + `AuthServiceProvider`** are the real authorization boundary,
  matching the README's note that "frontend permissions are for UX, backend
  authorization is the real security boundary." One policy per model is
  enough — no need for a permissions package like spatie/laravel-permission
  at this scope, plain role checks in the policies will do.
- **`CheckRole` middleware** is optional/complementary to policies — handy
  for blanket-protecting whole route groups (e.g. all `/api/users/*` routes
  to admin only) while policies handle per-model nuance (e.g. "developer can
  update status but not reassign").
- **`Requests/`** centralizes the validation rules the README calls out
  (title/description required, project must exist, priority must be valid,
  assigned user must exist and have the right role, etc.) so controllers
  stay thin.
- **`Resources/`** shapes the JSON the React app consumes — `IssueResource`
  for list views, `IssueDetailResource` for the single-issue page with
  comments included.
- **No `Services/` or `Repositories/` layer** — deliberately, per the
  README's "do not over-engineer" principle. Controllers → Models/Policies
  is enough for this scope; add a service layer later only if a controller
  actually gets unwieldy.
- **`ProjectMember` model** exists to support the many-to-many between users
  and projects (with `Project::members()` / `User::projects()` belongsToMany
  through it).

## Suggested route grouping (`routes/api.php`)

```text
POST   /api/register
POST   /api/login
POST   /api/logout                    [auth:sanctum]

GET    /api/me                        [auth:sanctum]

GET    /api/projects                  [auth:sanctum]
POST   /api/projects                  [auth:sanctum] -> ProjectPolicy
GET    /api/projects/{id}
PUT    /api/projects/{id}
DELETE /api/projects/{id}
POST   /api/projects/{id}/members
DELETE /api/projects/{id}/members/{userId}

GET    /api/issues
POST   /api/issues
GET    /api/issues/{id}
PUT    /api/issues/{id}
DELETE /api/issues/{id}
PATCH  /api/issues/{id}/status

GET    /api/issues/{id}/comments
POST   /api/issues/{id}/comments

GET    /api/users                     [admin only]
POST   /api/users
GET    /api/users/{id}
PUT    /api/users/{id}
PATCH  /api/users/{id}/role
```

## Quick scaffolding commands

```bash
laravel new issueflow-api
cd issueflow-api
composer require laravel/sanctum

php artisan make:model Project -mf
php artisan make:model ProjectMember -m
php artisan make:model Issue -mf
php artisan make:model Comment -m

php artisan make:policy ProjectPolicy --model=Project
php artisan make:policy IssuePolicy --model=Issue
php artisan make:policy CommentPolicy --model=Comment
php artisan make:policy UserPolicy --model=User

php artisan make:controller Api/ProjectController --api
php artisan make:controller Api/IssueController --api
php artisan make:controller Api/CommentController --api
php artisan make:controller Api/UserController --api

php artisan make:request StoreIssueRequest
php artisan make:request UpdateIssueStatusRequest
```