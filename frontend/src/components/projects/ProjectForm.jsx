import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { canCreateProject, canEditProject } from '../../utils/permissions';
import { createProject } from '../../api/projects';
import { MorphingSpinner } from '../reactbit/loading';

export default function ProjectForm({ project = null, onSuccess, onCancel }) {
  const { user } = useAuth();
  const isEdit = !!project;

  // Guard: only Admin & PM can create/edit
  if (isEdit && !canEditProject(user)) return null;
  if (!isEdit && !canCreateProject(user)) return null;

  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
      };

      await createProject(payload);
      setName('');
      setDescription('');
      onSuccess?.();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.name?.[0] ||
        'Failed to create project. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95"
      >
        <h3 className="text-lg font-bold text-slate-900">
          {isEdit ? 'Edit Project' : 'Create New Project'}
        </h3>

        {error && (
          <div className="p-3 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="project-name" className="text-sm font-semibold text-slate-700">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mobile App Redesign"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="project-desc" className="text-sm font-semibold text-slate-700">
            Description
          </label>
          <textarea
            id="project-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the project..."
            rows={3}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <MorphingSpinner size="xs" />
                {isEdit ? 'Saving...' : 'Creating...'}
              </span>
            ) : isEdit ? (
              'Save Changes'
            ) : (
              'Create Project'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
