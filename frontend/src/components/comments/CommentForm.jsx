import React from 'react';

export default function CommentForm({ issueId }) {
  // All authenticated users can add comments — no role guard needed
  return (
    <form className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
      <h4 className="text-sm font-bold text-slate-700">Add Comment</h4>
      <textarea
        className="w-full p-3 text-sm border border-slate-200 rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
        rows={3}
        placeholder="Write your comment..."
      />
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          Post Comment
        </button>
      </div>
    </form>
  );
}
