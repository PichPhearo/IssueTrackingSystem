# 🚀 IssueFlow — Full-Stack Issue & Project Management System

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://issue-tracking-system-alpha.vercel.app/)
[![API Status](https://img.shields.io/badge/API_Status-Online-brightgreen?style=for-the-badge&logo=render)](https://issuetrackingsystem.onrender.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com/)

An enterprise-grade, multi-role Issue & Project Management application engineered with a decoupled architecture (**React + Vite** frontend and **Laravel 11 REST API** backend). Built as a portfolio project demonstrating scalable full-stack software architecture, strict security boundaries, state-machine workflows, and modern UI/UX design patterns.

---

## 🌐 Live Demo

🔗 **Explore Live Demo**: [https://issue-tracking-system-alpha.vercel.app](https://issue-tracking-system-alpha.vercel.app/)

> [!IMPORTANT]  
> **Render Cold Start Notice**: The backend API is hosted on Render's free tier, which spins down after 15 minutes of inactivity. When opening the live demo for the first time, please allow **30–50 seconds** for the backend server to wake up and respond.

---

## 🌟 Portfolio Highlights & Technical Accomplishments

* **🛡️ Security-First Architecture (Zero-Trust Authorization)**  
  Implemented **Laravel Sanctum** token authentication alongside granular **Laravel Policies** and role middleware. While the React UI conditionally hides unauthorized actions for user convenience, the backend strictly enforces authorization as the true security boundary.
* **🔄 Deterministic Status State Machine**  
  Engineered a strict lifecycle workflow (`Open` ➔ `In Progress` ➔ `Resolved` ➔ `Verified` / `Reopened` ➔ `Closed`) preventing illegal status transitions at both the API layer and the UI layer based on the user's role (e.g., Developers resolve issues; QA engineers verify or reopen them).
* **⚡ Decoupled & Lightweight State Management**  
  Designed a clean, context-driven frontend state architecture (`AuthContext`, `DashboardContext`, `NotificationContext`) avoiding external state management bloat (Redux/Zustand) while maintaining instant UI updates and global synchronization.
* **🎨 Modern Responsive UI & UX**  
  Features interactive Kanban board views, dynamic filterable issue tables, instant role-switching demo tools, real-time in-app notifications, and custom design tokens for seamless light/dark modes.

---

## ✨ Feature Breakdown

| Feature | Description | Key Tech / Pattern |
| :--- | :--- | :--- |
| **Multi-Role RBAC** | Support for 4 distinct roles: Admin, Project Manager, Developer, and QA Engineer. | Custom Middleware & Policies |
| **Project & Workspace Isolation** | Organize issues into projects with custom member access lists. | BelongsToMany Pivot Associations |
| **Kanban & List Views** | Interactive drag-and-drop board and table filters (by priority, status, project, assignee). | React Context + Vite Hooks |
| **Issue Workflow Engine** | Role-restricted status transitions with full audit timestamps. | Enums & Policy Enforcement |
| **Threaded Comments** | Real-time discussion feeds attached to individual issues. | API Resources & Serialization |
| **In-App Notifications** | Dynamic header dropdown for system notifications and activity alerts. | Context State & Polling |
| **Preset Demo Accounts** | One-click instant login switcher designed for seamless recruiter/reviewer evaluation. | Seeders & Custom Presets Page |

---

## 🏗️ Architecture & Stack Overview

```
                      ┌─────────────────────────────────────────┐
                      │    React 18 + Vite (Frontend Web App)   │
                      │  • Context API    • Axios Client        │
                      │  • React Router   • Component Library   │
                      └────────────────────┬────────────────────┘
                                           │
                                    REST API (JSON)
                                    Bearer Token Auth
                                           │
                      ┌────────────────────▼────────────────────┐
                      │      Laravel 11 (REST API Backend)      │
                      │  • Sanctum Auth   • Policy Boundary     │
                      │  • Form Requests  • API Resources       │
                      └────────────────────┬────────────────────┘
                                           │
                                    Database Layer
                             (SQLite / PostgreSQL / MySQL)
```

### **Tech Stack**
- **Frontend**: React 18, Vite, React Router v6, Axios, Lucide Icons, Custom Vanilla CSS Design System.
- **Backend**: PHP 8.2+, Laravel 11, Laravel Sanctum, Custom Policies, Form Request Validation.
- **Database & Storage**: SQLite (Default / Demo), PostgreSQL / MySQL supported.

---

## 🔑 Recruiter & Demo Access Credentials

To test the application across different permission levels, use the built-in **Demo Accounts Page** or log in manually with these preset credentials:

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@example.com` | `password` | Full system governance, user management, project & issue creation |
| **📋 Project Manager** | `pm@example.com` | `password` | Create projects, assign team members, manage project issues |
| **💻 Developer** | `dev@example.com` | `password` | Claim assigned issues, transition status to `In Progress` ➔ `Resolved` |
| **🔍 QA Engineer** | `qa@example.com` | `password` | Report bugs, verify resolved issues (`Verified`) or flag regressions (`Reopened`) |

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js** v18+ & **npm**
- **PHP** v8.2+ & **Composer**

### 1. Clone & Setup Backend (Laravel API)

```bash
git clone https://github.com/your-username/IssueTrackingSystem.git
cd IssueTrackingSystem/backend

# Install PHP dependencies
composer install

# Environment & Database Initialization
cp .env.example .env
touch database/database.sqlite

# Generate App Key & Seed Demo Accounts
php artisan key:generate
php artisan migrate:fresh --seed

# Start API Server (Runs at http://127.0.0.1:8000)
php artisan serve
```

### 2. Setup Frontend (React + Vite)

```bash
cd ../frontend

# Install JavaScript dependencies
npm install

# Configure Environment
cp .env.example .env

# Start Development Server (Runs at http://localhost:5173)
npm run dev
```

---

## 🌐 Production Deployment Architecture

This repository is optimized for **100% Free Production Deployment**:

- **Frontend (React)**: Deployed on **Vercel** CDN (Automatic CI/CD pipeline on main branch).
- **Backend (Laravel API)**: Deployed on **Render** as a Web Service running PHP + SQLite database.

---

## ✉️ Contact & Author

**Your Name**  
*Full-Stack Software Engineer*

- **Portfolio**: [yourportfolio.com](https://yourportfolio.com)
- **LinkedIn**: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- **GitHub**: [@your-username](https://github.com/your-username)
- **Email**: `your.email@example.com`

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).
