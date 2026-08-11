import React, { createContext, useContext, useState, useCallback } from 'react';
import { getProjects } from '../api/projects';
import { getIssues } from '../api/issues';
import { getUsers } from '../api/users';

const DashboardContext = createContext();

// Cache TTL — data is considered fresh for 30 seconds
const CACHE_TTL = 30 * 1000;

// Module-level state survives StrictMode remounts (instance refs do not)
let dashboardInflight = null;
let dashboardLastFetched = 0;
let dashboardCache = { projects: [], issues: [], users: [] };

export function DashboardProvider({ children }) {
  const [projects, setProjects] = useState(dashboardCache.projects);
  const [issues, setIssues] = useState(dashboardCache.issues);
  const [users, setUsers] = useState(dashboardCache.users);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (force = false) => {
    const now = Date.now();

    // Reuse fresh module cache (covers StrictMode remount after first fetch finishes)
    if (!force && dashboardLastFetched && now - dashboardLastFetched < CACHE_TTL) {
      setProjects(dashboardCache.projects);
      setIssues(dashboardCache.issues);
      setUsers(dashboardCache.users);
      return;
    }

    // Share one in-flight request across remounts
    if (!dashboardInflight) {
      dashboardInflight = Promise.all([
        getProjects(),
        getIssues(),
        getUsers(force).catch(() => ({ data: { data: [] } })),
      ])
        .then(([projRes, issueRes, userRes]) => {
          dashboardCache = {
            projects: projRes.data?.data || [],
            issues: issueRes.data?.data || [],
            users: userRes.data?.data || userRes.data || [],
          };
          dashboardLastFetched = Date.now();
          return dashboardCache;
        })
        .finally(() => {
          dashboardInflight = null;
        });
    }

    setLoading(true);
    try {
      const data = await dashboardInflight;
      setProjects(data.projects);
      setIssues(data.issues);
      setUsers(data.users);
    } catch {
      // Silently fail — dashboard is a best-effort view
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return (
    <DashboardContext.Provider value={{ projects, issues, users, loading, fetchData, refresh }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
