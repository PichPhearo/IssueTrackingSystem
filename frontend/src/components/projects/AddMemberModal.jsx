import React, { useState, useEffect, useMemo } from 'react';
import { getUsers } from '../../api/users';
import { addMember } from '../../api/projects';
import { useTheme } from '../../context/ThemeContext';
import { MorphingSpinner } from '../reactbit/loading';

// Survives StrictMode remounts so opening the modal only hits /users once
let usersInflight = null;

export default function AddMemberModal({ projectId, existingMembers = [], onSuccess, onCancel }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    if (!usersInflight) {
      usersInflight = getUsers()
        .then((res) => res.data?.data || res.data || [])
        .finally(() => {
          usersInflight = null;
        });
    }

    usersInflight
      .then((list) => {
        if (!active) return;
        setAllUsers(list);
      })
      .catch(() => {
        if (!active) return;
        setError('Failed to load user list.');
      });

    return () => {
      active = false;
    };
  }, []);

  const existingIds = useMemo(
    () => new Set(existingMembers.map((m) => m.id)),
    [existingMembers]
  );

  const users = useMemo(
    () => allUsers.filter((u) => !existingIds.has(u.id)),
    [allUsers, existingIds]
  );

  useEffect(() => {
    if (users.length > 0) {
      setSelectedUserId((prev) =>
        users.some((u) => String(u.id) === String(prev)) ? prev : String(users[0].id)
      );
    } else {
      setSelectedUserId('');
    }
  }, [users]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setLoading(true);
    setError(null);
    try {
      await addMember(projectId, Number(selectedUserId));
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add member to project.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onCancel}
      />

      {/* Modal */}
      <form
        onSubmit={handleSubmit}
        className={`relative w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl border transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-750 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <h3 className="text-lg font-bold">Add Team Member</h3>

        {error && (
          <div className="p-3 text-sm font-medium text-red-400 bg-red-950/40 border border-red-900/60 rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Select User
          </label>
          {users.length > 0 ? (
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-100 focus:ring-slate-600'
                  : 'bg-white border-slate-200 text-slate-900 focus:ring-slate-300'
              }`}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id} className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                  {u.name} ({u.role?.toUpperCase()})
                </option>
              ))}
            </select>
          ) : (
            <p className={`text-sm py-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              All available users are already members of this project.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || users.length === 0}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 ${
              isDark
                ? 'bg-white text-slate-900 hover:bg-slate-100'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <MorphingSpinner size="xs" />
                Adding...
              </span>
            ) : (
              'Add Member'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
