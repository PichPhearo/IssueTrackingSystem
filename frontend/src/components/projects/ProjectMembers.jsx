import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { canManageMembers } from '../../utils/permissions';

export default function ProjectMembers({ project = null }) {
  const { user } = useAuth();

  // Guard: only Admin & PM can manage members
  if (!canManageMembers(user)) return null;

  return (
    <div className="space-y-4 p-4 bg-white border border-slate-200 rounded-xl">
      <h3 className="text-lg font-bold text-slate-900">Project Members</h3>
      {/* Member list and add/remove controls will go here */}
    </div>
  );
}
