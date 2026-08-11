import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import tracerLogo from '../assets/TracerLogo.png';
import Particles from '../components/reactbit/background';
import { Home, ArrowLeft, Compass } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900 overflow-hidden select-none">
      {/* Interactive Particles Background */}
      <Particles
        className="absolute inset-0 z-0 pointer-events-none"
        quantity={400}
        ease={80}
        color="#000000"
        size={0.6}
        staticity={40}
      />

      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-100/70 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-8 md:p-10 shadow-2xl shadow-slate-300/50 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* TRACER Logo Header */}
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

        {/* 404 Display Number with Google Font (Sekuya / font-tracer / font-press-start) */}
        <div className="relative py-2">
          <h1 className="text-7xl md:text-8xl font-black font-tracer tracking-widest text-slate-900 drop-shadow-sm select-none">
            404
          </h1>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Lost in Space?
          </h2>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-md mx-auto">
            The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-semibold text-sm transition-all cursor-pointer shadow-lg shadow-slate-900/10"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Footer tip */}
        <div className="pt-2 text-xs text-slate-400 flex items-center justify-center gap-1">
          <Compass className="w-3.5 h-3.5 text-slate-400" />
          <span>Double-check the URL or navigate back using the options above.</span>
        </div>
      </div>
    </div>
  );
}
