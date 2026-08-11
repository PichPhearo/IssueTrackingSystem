import React, { useState, useEffect } from 'react';
import tracerLogo from '../../assets/TracerLogo.png';
import { Smartphone, Monitor, AlertTriangle, Laptop, Maximize2, ShieldAlert } from 'lucide-react';

const MIN_REQUIRED_WIDTH = 1024; // Desktop standard minimum breakpoint

export default function MobileNotSupportedGuard() {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < MIN_REQUIRED_WIDTH;

  if (!isMobile) return null;

  const progressPercent = Math.min(100, Math.round((windowWidth / MIN_REQUIRED_WIDTH) * 100));

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-6 text-center select-none bg-slate-50/95 backdrop-blur-md text-slate-900 transition-colors duration-200">
      {/* Subtle Background Glow Accent Shapes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-100/70 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-72 h-72 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card (White Background, Black Text) */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-slate-200/90 p-8 shadow-2xl shadow-slate-300/50 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3">
          <img
            src={tracerLogo}
            alt="Tracer Logo"
            className="w-10 h-10 object-contain drop-shadow-xs"
          />
          <span className="text-2xl font-extrabold tracking-wider font-tracer text-slate-900">
            TRACER
          </span>
        </div>

        {/* Visual Graphic Device Comparison */}
        <div className="relative py-3 flex items-center justify-center gap-6">
          {/* Mobile phone (Not Supported) */}
          <div className="relative flex flex-col items-center gap-1.5 opacity-80 scale-95">
            <div className="relative p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 shadow-xs">
              <Smartphone className="w-8 h-8" />
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-600 border-2 border-white flex items-center justify-center">
                <ShieldAlert className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <span className="text-xs font-semibold text-red-600">Mobile</span>
          </div>

          {/* Transfer icon */}
          <div className="flex flex-col items-center text-slate-400">
            <Maximize2 className="w-5 h-5 animate-pulse text-indigo-600" />
          </div>

          {/* Laptop / Monitor (Supported) */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-md shadow-emerald-100">
              <Monitor className="w-8 h-8" />
            </div>
            <span className="text-xs font-semibold text-emerald-600">Desktop</span>
          </div>
        </div>

        {/* Headline & Description */}
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Mobile Device Detected</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Application Not Supported on Mobile
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            TRACER Issue Tracking System is engineered for desktop-class screen resolutions with complex tables, sidebar navigation, and multi-panel issue workflows.
          </p>
        </div>

        {/* Live Screen Resolution Indicator & Progress Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Laptop className="w-4 h-4 text-indigo-600" />
              <span>Current Viewport Width</span>
            </span>
            <span className="font-mono text-amber-700 font-bold">
              {windowWidth}px <span className="text-slate-400 font-normal">/ {MIN_REQUIRED_WIDTH}px</span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-green-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Recommendation */}
        <div className="pt-1 text-xs text-slate-500 flex items-center justify-center gap-2 font-medium">
          <span>💡 Please expand your browser window or switch to a desktop computer.</span>
        </div>
      </div>
    </div>
  );
}
