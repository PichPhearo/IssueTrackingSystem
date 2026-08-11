import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { getUsers, updateRole, toggleActive } from '../../api/users';
import { Search, ChevronDown, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { MorphingSpinner } from '../reactbit/loading';

const ROLE_CONFIG = {
  admin: {
    label: 'Admin',
    dark: 'bg-purple-950/80 text-purple-300 border-purple-800/50',
    light: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  project_manager: {
    label: 'Project Manager',
    dark: 'bg-blue-950/80 text-blue-300 border-blue-800/50',
    light: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  developer: {
    label: 'Developer',
    dark: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50',
    light: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  qa: {
    label: 'QA',
    dark: 'bg-amber-950/80 text-amber-300 border-amber-800/50',
    light: 'bg-amber-100 text-amber-700 border-amber-200',
  },
};

const ROLES_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'developer', label: 'Developer' },
  { value: 'qa', label: 'QA' },
];

export default function UserList() {
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isAdmin = currentUser?.role === 'admin';
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const fetchUsersList = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers(force);
      const data = res.data?.data || res.data || [];
      setUsers(data);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsersList();
  }, [fetchUsersList]);

  const handleRoleChange = async (userId, newRole) => {
    if (!isAdmin || updatingUserId) return;
    setUpdatingUserId(userId);
    try {
      await updateRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleToggleActive = async (userId) => {
    if (!isAdmin || updatingUserId) return;
    setUpdatingUserId(userId);
    try {
      const res = await toggleActive(userId);
      const updated = res.data?.user;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, is_active: updated ? updated.is_active : !u.is_active }
            : u
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const confirmDeactivate = async () => {
    if (!userToDeactivate || deactivating) return;
    setDeactivating(true);
    try {
      const res = await toggleActive(userToDeactivate.id);
      const updated = res.data?.user;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userToDeactivate.id
            ? { ...u, is_active: updated ? updated.is_active : false }
            : u
        )
      );
      setUserToDeactivate(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate user.');
    } finally {
      setDeactivating(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let result = [...users].sort((a, b) => Number(a.id) - Number(b.id));
    if (!search.trim()) return result;
    const q = search.toLowerCase().trim();
    return result.filter((u) => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const role = (u.role || '').toLowerCase().replace(/_/g, ' ');
      const status = u.is_active ? 'active' : 'inactive';
      return (
        name.includes(q) ||
        email.includes(q) ||
        role.includes(q) ||
        status.includes(q)
      );
    });
  }, [users, search]);

  return (
    <div className="space-y-5">
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={`text-2xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Users
          </h1>
          <p
            className={`text-xs mt-1 font-medium ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Manage team members, roles, and account access
          </p>
        </div>
      </div>

      {/* ─── Search Bar ───────────────────────────────────────────────────── */}
      <div className="relative">
        <Search
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
            isDark ? 'text-slate-400' : 'text-slate-400'
          }`}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or role..."
          className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 ${
            isDark
              ? 'bg-slate-800/80 border-slate-700 text-slate-100 placeholder-slate-400 focus:ring-slate-600 focus:border-slate-600'
              : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-slate-300 focus:border-slate-400 shadow-2xs'
          }`}
        />
      </div>

      {/* ─── Loading Skeleton ────────────────────────────────────────────── */}
      {loading && (
        <div
          className={`border rounded-xl overflow-hidden divide-y animate-pulse ${
            isDark
              ? 'border-slate-800 divide-slate-800 bg-slate-800/40'
              : 'border-slate-200 divide-slate-200 bg-white shadow-2xs'
          }`}
        >
          {/* Skeleton Header */}
          <div
            className={`grid grid-cols-12 items-center px-5 py-3 border-b ${
              isDark ? 'bg-slate-800/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`col-span-4 h-3 w-16 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className={`col-span-4 h-3 w-16 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className={`col-span-2 h-3 w-12 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className={`col-span-2 h-3 w-14 rounded ml-auto ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          </div>

          {/* Skeleton Rows */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-12 items-center px-5 py-3.5 gap-4">
              <div className="col-span-4 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                <div className={`h-4 w-32 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
              </div>
              <div className={`col-span-4 h-3.5 w-48 rounded ${isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}`} />
              <div className={`col-span-2 h-6 w-24 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
              <div className={`col-span-2 h-6 w-16 rounded-full ml-auto ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            </div>
          ))}
        </div>
      )}

      {/* ─── Error State ──────────────────────────────────────────────────── */}
      {error && !loading && (
        <div
          className={`p-4 text-sm font-medium rounded-xl text-center ${
            isDark
              ? 'text-red-400 bg-red-950/30 border border-red-900/50'
              : 'text-red-700 bg-red-50 border border-red-200'
          }`}
        >
          {error}
          <button
            onClick={() => fetchUsersList(true)}
            className="ml-2 underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── Users Table ──────────────────────────────────────────────────── */}
      {!loading && !error && (
        <div
          className={`border rounded-xl overflow-hidden divide-y ${
            isDark
              ? 'border-slate-800 divide-slate-800 bg-slate-800/40'
              : 'border-slate-200 divide-slate-200 bg-white shadow-2xs'
          }`}
        >
          {/* Table Header */}
          <div
            className={`grid grid-cols-12 items-center px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b ${
              isDark
                ? 'bg-slate-800/80 text-slate-400 border-slate-800'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <div className="col-span-4">Name</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {/* Table Body */}
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => {
              const roleInfo =
                ROLE_CONFIG[u.role] || {
                  label: u.role,
                  dark: 'bg-slate-800 text-slate-300 border-slate-700',
                  light: 'bg-slate-100 text-slate-700 border-slate-200',
                };
              const isSelf = currentUser?.id === u.id;
              const isUpdating = updatingUserId === u.id;

              return (
                <div
                  key={u.id}
                  onClick={() => navigate(`/admin/users/${u.id}`)}
                  className={`grid grid-cols-12 items-center px-5 py-3.5 text-sm transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-slate-750/50' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Name */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isDark
                          ? 'bg-slate-700 text-slate-200 border border-slate-600'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold truncate ${
                            isDark ? 'text-slate-100' : 'text-slate-900'
                          }`}
                        >
                          {u.name}
                        </span>
                        {isSelf && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-md ${
                              isDark
                                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div
                    className={`col-span-4 text-xs truncate pr-4 ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {u.email}
                  </div>

                  {/* Role */}
                  <div
                    className="col-span-2 flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isAdmin ? (
                      <div className="relative inline-flex items-center">
                        <select
                          value={u.role}
                          disabled={isUpdating}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className={`pl-2.5 pr-7 py-1 text-xs font-semibold rounded-lg border appearance-none transition-all cursor-pointer focus:outline-none focus:ring-2 disabled:opacity-50 ${
                            isDark
                              ? `${roleInfo.dark} focus:ring-slate-600`
                              : `${roleInfo.light} focus:ring-slate-300`
                          }`}
                        >
                          {ROLES_OPTIONS.map((r) => (
                            <option
                              key={r.value}
                              value={r.value}
                              className={
                                isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
                              }
                            >
                              {r.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-60`}
                        />
                      </div>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                          isDark ? roleInfo.dark : roleInfo.light
                        }`}
                      >
                        {roleInfo.label}
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div
                    className="col-span-2 flex items-center justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isAdmin && !isSelf ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (u.is_active) {
                            setUserToDeactivate(u);
                          } else {
                            handleToggleActive(u.id);
                          }
                        }}
                        disabled={isUpdating}
                        title={`Click to ${u.is_active ? 'deactivate' : 'activate'} user`}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer disabled:opacity-50 ${
                          u.is_active
                            ? isDark
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/60'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : isDark
                              ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {u.is_active ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                          u.is_active
                            ? isDark
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isDark
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {u.is_active ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div
              className={`px-4 py-8 text-center text-xs ${
                isDark ? 'text-slate-400' : 'text-slate-400'
              }`}
            >
              {search ? 'No users match your search.' : 'No users found.'}
            </div>
          )}
        </div>
      )}

      {/* ─── Deactivate User Confirmation Alert Modal ────────────────────── */}
      {userToDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => !deactivating && setUserToDeactivate(null)}
          />

          {/* Dialog Card */}
          <div
            className={`relative w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl border transition-colors ${
              isDark
                ? 'bg-slate-900 border-slate-750 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark
                    ? 'bg-red-950/80 text-red-400 border border-red-800/50'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-red-400">Deactivate User?</h3>
                <p
                  className={`text-xs ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Account access will be suspended
                </p>
              </div>
            </div>

            <p
              className={`text-sm ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Are you sure you want to deactivate{' '}
              <span
                className={`font-semibold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {userToDeactivate.name}
              </span>
              ? They will immediately lose access to log in and interact with the system.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToDeactivate(null)}
                disabled={deactivating}
                className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeactivate}
                disabled={deactivating}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deactivating ? (
                  <span className="inline-flex items-center gap-2">
                    <MorphingSpinner size="xs" />
                    Deactivating...
                  </span>
                ) : (
                  'Deactivate'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
