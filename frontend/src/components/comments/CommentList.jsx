import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { canDeleteComment } from '../../utils/permissions';
import CommentForm from './CommentForm';

export default function CommentList({ comments = [], issueId }) {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
        Comments
      </h4>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-sm font-semibold text-slate-900">
                  {comment.user?.name || 'User'}
                </span>
                <p className="text-sm text-slate-600 mt-1">{comment.body}</p>
              </div>

              {/* Delete button — visible to admin (any) or comment owner */}
              {canDeleteComment(user, comment) && (
                <button className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors shrink-0">
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">No comments yet.</p>
      )}

      {/* Comment form — all authenticated users can add comments */}
      <CommentForm issueId={issueId} />
    </div>
  );
}
