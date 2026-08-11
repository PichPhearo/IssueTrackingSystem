import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import tracerLogo from '../assets/TracerLogo.png';
import Particles from '../components/reactbit/background';
import {
  LockKeyhole,
  FolderCode,
  CodeXml,
  Bug,
  Copy,
  Check,
  ArrowLeft,
  LogIn,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    roleKey: 'admin',
    name: 'System Admin',
    email: 'admin@example.com',
    password: 'password123',
    description: 'Full system control, user management, and system-wide configurations.',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    icon: LockKeyhole,
  },
  {
    role: 'Project Manager',
    roleKey: 'project_manager',
    name: 'Project Manager (Alex)',
    email: 'pm@example.com',
    password: 'password123',
    description: 'Create & manage projects, assign members, track issue progress.',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: FolderCode,
  },
  {
    role: 'Developer',
    roleKey: 'developer',
    name: 'John Developer',
    email: 'developer@example.com',
    password: 'password123',
    description: 'Primary dev account assigned to high-priority frontend & login issues.',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: CodeXml,
  },
  {
    role: 'Quality Assurance',
    roleKey: 'qa',
    name: 'Sarah QA',
    email: 'qa@example.com',
    password: 'password123',
    description: 'Verify resolved issues, perform regression testing, mark verified.',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Bug,
  },
];

export default function DemoAccountsPage() {
  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, fieldId) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleUseAccount = (email, password) => {
    navigate('/login', { state: { email, password } });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 bg-slate-50 text-slate-900 overflow-x-hidden select-none">
      {/* Background Interactive Particles */}
      <Particles
        className="absolute inset-0 z-0 pointer-events-none"
        quantity={350}
        ease={80}
        color="#000000"
        size={0.6}
        staticity={40}
      />

      {/* Decorative Glow Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-100/60 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl space-y-6 my-6">
        
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-white text-sm font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>

          <div className="flex items-center gap-2">
            <img src={tracerLogo} alt="Tracer Logo" className="w-7 h-7 object-contain" />
            <span className="text-lg font-extrabold tracking-wider font-tracer text-slate-900">
              TRACER DEMO
            </span>
          </div>
        </div>

        {/* Page Title Card */}
        <div className="backdrop-blur-md p-6 md:p-8 text-center space-y-3">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Demo Test Accounts
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Click <span className="font-semibold text-slate-800">"Use This Account"</span> to quickly auto-fill credentials.
          </p>
        </div>

        {/* Account Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEMO_ACCOUNTS.map((acc, index) => {
            const Icon = acc.icon;
            const emailFieldId = `email-${index}`;
            const passFieldId = `pass-${index}`;

            return (
              <div
                key={index}
                className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-5 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                {/* Header: Name & Role Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${acc.badgeClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {acc.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{acc.description}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border shrink-0 ${acc.badgeClass}`}>
                    {acc.role}
                  </span>
                </div>

                {/* Email & Password Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                  {/* Email row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-500 w-16">Email:</span>
                    <code className="font-mono text-slate-900 font-bold truncate flex-1 bg-white px-2 py-1 rounded border border-slate-200">
                      {acc.email}
                    </code>
                    <button
                      onClick={() => handleCopy(acc.email, emailFieldId)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0"
                      title="Copy Email"
                    >
                      {copiedField === emailFieldId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Password row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-500 w-16">Password:</span>
                    <code className="font-mono text-slate-900 font-bold truncate flex-1 bg-white px-2 py-1 rounded border border-slate-200">
                      {acc.password}
                    </code>
                    <button
                      onClick={() => handleCopy(acc.password, passFieldId)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0"
                      title="Copy Password"
                    >
                      {copiedField === passFieldId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* One-Click Action Button */}
                <button
                  type="button"
                  onClick={() => handleUseAccount(acc.email, acc.password)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-semibold rounded-xl text-xs shadow-md shadow-slate-900/10 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Use This Account to Sign In</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All passwords are initialized to <code className="font-mono font-bold text-slate-800">password123</code> for demo testing convenience.</span>
        </div>
      </div>
    </div>
  );
}
