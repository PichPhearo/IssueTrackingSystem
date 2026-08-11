import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Bell,
  CheckCheck,
  MessageSquare,
  RefreshCw,
  UserCheck,
  CircleDot,
  Clock,
  Sparkles,
} from 'lucide-react';

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
}

function getNotificationIcon(type, isDark) {
  switch (type) {
    case 'comment':
      return {
        icon: MessageSquare,
        bg: isDark ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/40' : 'bg-emerald-50 text-emerald-600 border-emerald-200',
      };
    case 'reassigned':
      return {
        icon: UserCheck,
        bg: isDark ? 'bg-indigo-950/70 text-indigo-400 border-indigo-800/40' : 'bg-indigo-50 text-indigo-600 border-indigo-200',
      };
    case 'status_changed':
      return {
        icon: RefreshCw,
        bg: isDark ? 'bg-amber-950/70 text-amber-400 border-amber-800/40' : 'bg-amber-50 text-amber-600 border-amber-200',
      };
    default:
      return {
        icon: CircleDot,
        bg: isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200',
      };
  }
}

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleNotificationClick = async (item) => {
    if (!item.is_read) {
      markAsRead(item.id);
    }
    setIsOpen(false);
    if (item.related_issue_id) {
      navigate(`/issues/${item.related_issue_id}`);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Icon Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
          isOpen
            ? isDark
              ? 'border-indigo-500/80 bg-indigo-950/40 text-indigo-300 ring-2 ring-indigo-500/20'
              : 'border-indigo-500 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-200'
            : isDark
            ? 'border-slate-700 bg-slate-750/70 text-slate-300 hover:text-white hover:bg-slate-700'
            : 'border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-2xs'
        }`}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 transition-transform hover:rotate-12" />

        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-[10px] font-extrabold text-white bg-red-500 rounded-full border-2 border-theme-sidebar shadow-xs animate-in zoom-in-50 duration-150">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popup Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 bottom-full mb-2 w-80 sm:w-88 rounded-2xl border shadow-xl backdrop-blur-md z-50 overflow-hidden flex flex-col transition-all animate-in fade-in-50 slide-in-from-bottom-2 duration-150 ${
            isDark
              ? 'bg-slate-900/95 border-slate-750 divide-slate-800 text-slate-100'
              : 'bg-white/95 border-slate-200 divide-slate-100 text-slate-900 shadow-slate-300/40'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-theme-border bg-theme-sidebar/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight">Notifications</span>
              {unreadCount > 0 && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isDark
                      ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/40'
                      : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800'
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-theme-border/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border ${
                    isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-400'
                      : 'bg-slate-100 border-slate-200 text-slate-500'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  All caught up!
                </p>
                <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  No notifications yet.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const isUnread = !item.is_read;
                const { icon: TypeIcon, bg: iconStyle } = getNotificationIcon(item.type, isDark);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer group ${
                      isUnread
                        ? isDark
                          ? 'bg-slate-800/50 hover:bg-slate-800'
                          : 'bg-indigo-50/40 hover:bg-indigo-50/80'
                        : isDark
                        ? 'hover:bg-slate-800/40'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Type Icon Badge */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 transition-transform group-hover:scale-105 ${iconStyle}`}
                    >
                      <TypeIcon className="w-4 h-4" />
                    </div>

                    {/* Message Body & Metadata */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p
                        className={`text-xs leading-snug line-clamp-2 ${
                          isUnread
                            ? isDark
                              ? 'text-white font-semibold'
                              : 'text-slate-950 font-semibold'
                            : isDark
                            ? 'text-slate-300 font-normal'
                            : 'text-slate-600 font-normal'
                        }`}
                      >
                        {item.message}
                      </p>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] flex items-center gap-1 ${
                            isDark ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(item.created_at)}
                        </span>

                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
