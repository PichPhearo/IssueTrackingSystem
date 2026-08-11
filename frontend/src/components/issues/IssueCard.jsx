import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { canEditIssue, canDeleteIssue } from '../../utils/permissions';
import IssueStatusBadge from './IssueStatusBadge';

export default function IssueCard({ issue }) {
  const { user } = useAuth();

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-bold text-slate-900 truncate">
            {issue?.title || 'Issue'}
          </h4>
          {issue?.status && (
            <div className="mt-1.5">
              <IssueStatusBadge status={issue.status} />
            </div>
          )}
        </div>
      </div>

      {/* Action buttons — shown per role */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        {canEditIssue(user, issue) && (
          <button className="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors">
            Edit
          </button>
        )}
        {canDeleteIssue(user) && (
          <button className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors ml-auto">
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
