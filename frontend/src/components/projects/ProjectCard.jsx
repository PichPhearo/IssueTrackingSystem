import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { canEditProject, canDeleteProject, canManageMembers } from '../../utils/permissions';

export default function ProjectCard({ project }) {
  const { user } = useAuth();

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs hover:shadow-sm transition-shadow">
      <h4 className="text-base font-bold text-slate-900 truncate">
        {project?.name || 'Project'}
      </h4>
      {project?.description && (
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{project.description}</p>
      )}

      {/* Action buttons — shown per role */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        {canEditProject(user) && (
          <button className="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors">
            Edit
          </button>
        )}
        {canManageMembers(user) && (
          <button className="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors">
            Members
          </button>
        )}
        {canDeleteProject(user) && (
          <button className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors ml-auto">
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
