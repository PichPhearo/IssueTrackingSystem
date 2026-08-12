import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { MorphingSpinner } from '../reactbit/loading';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center space-y-4 text-slate-900 dark:text-slate-100 transition-colors">
        <MorphingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 animate-pulse text-center max-w-xs">
          Waiting for Render to respond...
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center max-w-sm px-4">
          Free backend instances spin down after inactivity and may take 30–50 seconds to wake up.
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
