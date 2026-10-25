import React from 'react';
import Link from 'next/link';
import { Shield, Lock, KeyRound, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface AdminPageProps {
  searchParams?: {
    returnTo?: string;
    error?: string;
    message?: string;
  };
}

export default function AdminPage({ searchParams }: AdminPageProps) {
  const returnTo = searchParams?.returnTo || '/admin/dashboard';
  const error = searchParams?.error;
  const message = searchParams?.message;

  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
  );

  return (
    <div className="min-h-screen bg-[#0D111A] bg-[radial-gradient(ellipse_at_top,#172338_0%,#090C12_80%)] flex items-center justify-center px-4 select-none font-sans text-slate-100">
      <div className="max-w-md w-full bg-[#161B27]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-7 shadow-[0_24px_70px_rgba(0,0,0,0.7)] space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#0078D4]/20 border border-[#0078D4]/40 flex items-center justify-center mx-auto text-[#0078D4] shadow-lg shadow-sky-500/20">
            <Shield size={24} />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">LivingYuji Administration</h1>
          <p className="text-xs text-slate-400">
            Authentication is required to access system controls, file management, and project publishing.
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
            <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-400" />
            <div>
              {error === 'session_required' && 'Your session has expired or authentication is required.'}
              {error === 'invalid_credentials' && 'Invalid administrator credentials. Access denied.'}
              {error === 'rate_limited' && 'Too many failed login attempts. Please wait before trying again.'}
              {error === 'missing_fields' && 'Please provide your administrator passphrase or email/password.'}
              {error === 'not_configured' && 'Cloud authentication service is not configured on this host.'}
              {error === 'server_error' && 'Server error verifying credentials. Please try again.'}
              {!['session_required', 'invalid_credentials', 'rate_limited', 'missing_fields', 'not_configured', 'server_error'].includes(error) && error}
            </div>
          </div>
        )}

        {message === 'logged_out' && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>Administrator session terminated successfully.</span>
          </div>
        )}

        {/* Login Form */}
        <form action="/api/admin/signin" method="POST" className="space-y-4">
          <input type="hidden" name="returnTo" value={returnTo} />

          {/* Primary Method: Administrator Passphrase */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <KeyRound size={13} className="text-sky-400" />
              <span>Administrator Passphrase</span>
            </label>
            <div className="relative">
              <input
                type="password"
                name="passphrase"
                placeholder="Enter master admin passphrase"
                autoFocus
                required={!isSupabaseConfigured}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F131D] border border-white/10 focus:border-[#0078D4] text-xs text-white placeholder-slate-500 outline-none transition-colors pr-10"
              />
              <Lock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
            <p className="text-[10px] text-slate-400">
              Configured via <code className="text-slate-300 font-mono">ADMIN_ACCESS_PASSPHRASE</code> on the host server.
            </p>
          </div>

          {/* Optional Supabase Email/Password if configured */}
          {isSupabaseConfigured && (
            <div className="pt-2 border-t border-white/10 space-y-3">
              <div className="text-[11px] text-slate-400 font-medium">Or sign in with Supabase account:</div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="admin@livingyuji.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#0F131D] border border-white/10 focus:border-[#0078D4] text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Account password"
                  className="w-full px-3 py-2 rounded-xl bg-[#0F131D] border border-white/10 focus:border-[#0078D4] text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Shield size={14} />
            <span>Verify & Enter Console</span>
          </button>
        </form>

        {/* Back Link */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
          <Link
            href="/"
            className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={12} />
            <span>Return to LivingYuji OS</span>
          </Link>
          <span className="text-slate-400 font-mono text-[10px]">LivingYuji OS v2.5 Security</span>
        </div>
      </div>
    </div>
  );
}
