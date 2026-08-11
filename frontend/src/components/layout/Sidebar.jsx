import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { ROLES } from '../../constants/roles';
import { getNavItems } from '../../utils/permissions';
import tracerLogo from '../../assets/TracerLogo.png';
import tracerWhite from '../../assets/TracerWhite.png';
import NotificationDropdown from '../notifications/NotificationDropdown';
import {
  LogOut,
  LockKeyhole,
  FolderCode,
  CodeXml,
  Bug,
  User as UserIcon,
  Sun,
  Moon,
  AlertTriangle,
} from 'lucide-react';

const ROLE_CONFIG = {
  [ROLES.ADMIN]: {
    label: 'Admin',
    darkBadge: 'bg-red-950/60 text-red-400 border-red-800/50',
    lightBadge: 'bg-red-50 text-red-600 border-red-200',
    icon: LockKeyhole,
  },
  [ROLES.PROJECT_MANAGER]: {
    label: 'Project Manager',
    darkBadge: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
    lightBadge: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    icon: FolderCode,
  },
  [ROLES.DEVELOPER]: {
    label: 'Developer',
    darkBadge: 'bg-blue-950/60 text-blue-400 border-blue-800/50',
    lightBadge: 'bg-blue-50 text-blue-600 border-blue-200',
    icon: CodeXml,
  },
  [ROLES.QA]: {
    label: 'Quality Assurance',
    darkBadge: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
    lightBadge: 'bg-amber-50 text-amber-600 border-amber-200',
    icon: Bug,
  },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showLogoutModal && !loggingOut) {
        setShowLogoutModal(false);
      }
    };
    if (showLogoutModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutModal, loggingOut]);

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setShowLogoutModal(false);
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  // Role-filtered nav items from centralized permissions
  const navItems = getNavItems(user);

  const roleConfig = ROLE_CONFIG[user?.role] || {
    label: user?.role || 'User',
    darkBadge: 'bg-slate-800 text-slate-400 border-slate-700',
    lightBadge: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: UserIcon,
  };
  const RoleIcon = roleConfig.icon;
  const badgeClass = isDark ? roleConfig.darkBadge : roleConfig.lightBadge;

  return (
    <aside
      className="w-72 min-h-screen p-6 flex flex-col justify-between sticky top-0 h-screen select-none shrink-0 border-r border-theme-border bg-theme-sidebar text-theme-text transition-colors duration-200"
    >
      {/* Top Section: Logo & Navigation Links */}
      <div className="space-y-7">
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-3 px-2 py-1 group cursor-pointer">
          <img
            src={isDark ? tracerWhite : tracerLogo}
            alt="Tracer Logo"
            className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
          />
          <span
            className={`text-2xl font-extrabold tracking-wider font-tracer transition-colors ${
              isDark ? 'text-white' : 'text-slate-900 group-hover:text-indigo-600'
            }`}
          >
            TRACER
          </span>
        </Link>

        {/* Navigation Group */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider px-3 mb-2.5 text-theme-text-subtle">
            MAIN
          </h3>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-base transition-all duration-150 overflow-hidden ${
                      isActive
                        ? isDark
                          ? 'bg-slate-800 text-white font-bold'
                          : 'bg-slate-100 text-slate-900 font-bold'
                        : isDark
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className={`absolute left-0 top-2 bottom-2 w-1.5 rounded-r-md ${
                            isDark ? 'bg-white' : 'bg-slate-900'
                          }`}
                        />
                      )}
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-colors ${
                          isActive
                            ? isDark
                              ? 'text-white'
                              : 'text-slate-900'
                            : isDark
                            ? 'text-slate-400'
                            : 'text-slate-500'
                        }`}
                      />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section: User Profile, Role Badge, Theme Toggle & Logout */}
      {user && (
        <div className="pt-5 border-t border-theme-border space-y-3.5">
          {/* User Card with Dark / Light (Night / Day) Toggle next to User Info */}
          <div
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              isDark
                ? 'bg-slate-800/60 border-slate-700/60'
                : 'bg-slate-50 border-slate-200/80 shadow-2xs'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${badgeClass}`}
              title={roleConfig.label}
            >
              <RoleIcon className="w-5 h-5" />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span
                className={`text-sm font-bold truncate leading-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {user.name}
              </span>
              <span
                className={`text-xs font-medium truncate mt-0.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {roleConfig.label}
              </span>
            </div>

            {/* Notification Bell Dropdown */}
            <NotificationDropdown />

            {/* Theme Toggle Button next to user name & role */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                isDark
                  ? 'border-slate-700 bg-slate-750/70 text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-2xs'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark (Night) Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500 transition-transform hover:-rotate-12" />
              )}
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border transition-all cursor-pointer ${
              isDark
                ? 'border-slate-700 text-slate-300 hover:bg-red-950/40 hover:text-red-400 hover:border-red-800/60 active:bg-red-950/60'
                : 'border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:bg-red-100 shadow-2xs'
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          onClick={() => !loggingOut && setShowLogoutModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-150 ${
              isDark
                ? 'bg-slate-900 border-slate-750 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
            }`}
          >
            {/* Centered Warning Badge */}
            <div
              className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center border shrink-0 ${
                isDark
                  ? 'bg-red-950/70 border-red-800/50 text-red-400'
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>

            {/* Centered Text */}
            <div className="space-y-1">
              <h3 className="text-base font-bold tracking-tight">Confirm Logout</h3>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Are you sure you want to log out?
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className={`w-full py-2.5 text-sm font-semibold rounded-xl border transition-colors cursor-pointer disabled:opacity-50 ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={loggingOut}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>{loggingOut ? 'Logging out...' : 'Yes, Logout'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
