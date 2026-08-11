import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex font-sans bg-theme-bg text-theme-text transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
