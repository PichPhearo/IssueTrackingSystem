import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useDashboard } from '../../context/DashboardContext';
import { canCreateProject } from '../../utils/permissions';
import ProjectForm from './ProjectForm';
import { ChevronRight, Search, Plus } from 'lucide-react';

export default function ProjectList() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  // Use cached data from DashboardContext as default
  const { projects: cachedProjects, loading, fetchData: fetchDashboard, refresh: refreshDashboard } = useDashboard();

  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch dashboard data on mount (skips if cache is fresh)
  useEffect(() => {
    fetchDashboard().catch(() => setError('Failed to load projects.'));
  }, []);

  // Instantaneous real-time search filtering (0ms latency)
  const projects = useMemo(() => {
    const list = cachedProjects || [];
    if (!search.trim()) return list;
    const q = search.toLowerCase().trim();
    return list.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.creator?.name?.toLowerCase().includes(q)
    );
  }, [cachedProjects, search]);

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    setSearch('');
    refreshDashboard(); // Refresh the shared cache
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getOwnerLabel = (project) => {
    if (project.creator?.role) {
      const roleLabels = {
        admin: 'Admin',
        project_manager: 'PM Lead',
        developer: 'Developer',
        qa: 'QA',
      };
      return roleLabels[project.creator.role] || project.creator.role;
    }
    return project.creator?.name || '—';
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Projects
        </h1>
        {canCreateProject(user) && (
          <button
            onClick={() => setShowCreateForm(true)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
                : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            New project
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
            isDark ? 'text-slate-400' : 'text-slate-400'
          }`}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search projects"
          className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
            isDark
              ? 'bg-slate-800/80 border-slate-700 text-slate-100 placeholder-slate-400 focus:ring-slate-600 focus:border-slate-600'
              : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-slate-300 focus:border-slate-400 shadow-2xs'
          }`}
        />
      </div>

      {/* Loading skeleton (nav / section switch) */}
      {loading && (
        <div
          className={`border rounded-xl overflow-hidden animate-pulse ${
            isDark ? 'border-slate-800' : 'border-slate-200 shadow-2xs'
          }`}
        >
          <div
            className={`grid grid-cols-12 px-4 py-2.5 border-b ${
              isDark ? 'bg-slate-800/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`col-span-4 h-3 w-20 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className={`col-span-3 h-3 w-16 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className={`col-span-2 h-3 w-14 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className={`col-span-2 h-3 w-16 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className={`col-span-1 h-3 w-8 rounded ml-auto ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`grid grid-cols-12 items-center px-4 py-3.5 border-t gap-2 ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}
            >
              <div className={`col-span-4 h-4 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
              <div className={`col-span-3 h-3 rounded ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}`} />
              <div className={`col-span-2 h-3 w-10 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
              <div className={`col-span-2 h-3 rounded ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}`} />
              <div className={`col-span-1 h-4 w-4 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div
          className={`p-4 text-sm font-medium rounded-xl text-center ${
            isDark
              ? 'text-red-400 bg-red-950/30 border border-red-900/50'
              : 'text-red-700 bg-red-50 border border-red-200'
          }`}
        >
          {error}
          <button onClick={() => refreshDashboard()} className="ml-2 underline hover:no-underline cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div
          className={`border rounded-xl overflow-hidden ${
            isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 shadow-2xs'
          }`}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                className={`border-b ${
                  isDark
                    ? 'border-slate-800 bg-slate-800/80'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                {['Name', 'Owner', 'Members', 'Open issues', 'Created', ''].map((col) => (
                  <th
                    key={col}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    } ${col === '' ? 'w-10' : ''}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}
            >
              {projects.length > 0 ? (
                projects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className={`transition-colors cursor-pointer ${
                      isDark
                        ? 'hover:bg-slate-750/50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td
                      className={`px-4 py-3.5 font-medium ${
                        isDark ? 'text-slate-100' : 'text-slate-900'
                      }`}
                    >
                      {project.name}
                    </td>
                    <td
                      className={`px-4 py-3.5 ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {getOwnerLabel(project)}
                    </td>
                    <td
                      className={`px-4 py-3.5 ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {project.members_count ?? '—'}
                    </td>
                    <td
                      className={`px-4 py-3.5 ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {project.issues_count ?? '—'}
                    </td>
                    <td
                      className={`px-4 py-3.5 ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {formatDate(project.created_at)}
                    </td>
                    <td className="px-4 py-3.5">
                      <ChevronRight
                        className={`w-4 h-4 ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className={`px-4 py-8 text-center ${
                      isDark ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateForm && (
        <ProjectForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}
