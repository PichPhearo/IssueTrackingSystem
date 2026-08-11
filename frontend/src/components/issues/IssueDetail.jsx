import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  canEditIssue,
  canDeleteIssue,
  canChangeStatus,
  getAllowedTransitions,
} from '../../utils/permissions';
import IssueStatusBadge from './IssueStatusBadge';

export default function IssueDetail({ issue }) {
  const { user } = useAuth();

  const allowedTransitions = getAllowedTransitions(user, issue);
  const showStatusControls = canChangeStatus(user, issue) && allowedTransitions.length > 0;

  return (
    <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {issue?.title || 'Issue Detail'}
          </h3>
          {issue?.status && (
            <div className="mt-2">
              <IssueStatusBadge status={issue.status} />
            </div>
          )}
        </div>

        {/* Edit / Delete actions */}
        <div className="flex items-center gap-2 shrink-0">
          {canEditIssue(user, issue) && (
            <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
              Edit
            </button>
          )}
          {canDeleteIssue(user) && (
            <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 transition-all">
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Status Transition Controls — role-aware */}
      {showStatusControls && (
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Change Status
          </h4>
          <div className="flex flex-wrap gap-2">
            {allowedTransitions.map((status) => (
              <button
                key={status}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all capitalize"
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
