import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardProvider } from './context/DashboardContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import IssuesPage from './pages/IssuesPage';
import IssueDetailPage from './pages/IssueDetailPage';
import MyIssuesPage from './pages/MyIssuesPage';
import UserManagementPage from './pages/UserManagementPage';
import UserDetailPage from './pages/UserDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import DemoAccountsPage from './pages/DemoAccountsPage';
import { ROLES } from './constants/roles';

import MobileNotSupportedGuard from './components/layout/MobileNotSupportedGuard';

function App() {
  return (
    <ThemeProvider>
      <MobileNotSupportedGuard />
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
          <Routes>
            {/* Public Auth & Demo Routes (No Navbar / Sidebar) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/demo-accounts" element={<DemoAccountsPage />} />

            {/* Protected Application Routes (With Navbar & Sidebar) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardProvider><AppLayout /></DashboardProvider>}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
                <Route path="/issues" element={<IssuesPage />} />
                <Route path="/issues/:id" element={<IssueDetailPage />} />
                <Route element={<ProtectedRoute allowedRoles={[ROLES.DEVELOPER, ROLES.QA]} />}>
                  <Route path="/my-issues" element={<MyIssuesPage />} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                  <Route path="/admin/users" element={<UserManagementPage />} />
                  <Route path="/admin/users/:id" element={<UserDetailPage />} />
                </Route>
              </Route>
            </Route>

            {/* 404 Catch-All Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

