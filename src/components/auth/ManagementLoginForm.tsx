import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertBanner } from '../common/AlertBanner';
import {
  ShieldCheck,
  Lock,
  Mail,
  Loader2,
  ArrowRight,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';

interface ManagementLoginFormProps {
  onSwitchToStaffLogin: () => void;
  onSwitchToRegisterManagement: () => void;
}

export const ManagementLoginForm: React.FC<ManagementLoginFormProps> = ({
  onSwitchToStaffLogin,
  onSwitchToRegisterManagement,
}) => {
  const { login, registerManagement } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide your executive email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Executive sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setError(null);
    setLoading(true);
    const demoEmail = 'management@spiralsystems.co.za';
    const demoPass = 'Management2026!';

    try {
      try {
        await login(demoEmail, demoPass);
      } catch (err: any) {
        const msg = String(err?.message || '');
        if (
          msg.includes('user-not-found') ||
          msg.includes('invalid-credential') ||
          msg.includes('auth/invalid-credential')
        ) {
          await registerManagement('Executive Management', demoEmail, demoPass);
        } else {
          throw err;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Quick management login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="management-login-form" className="space-y-5">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            Executive Portal
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Strictly Non-Admin
          </span>
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Management Oversight Login
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Restricted access for Company Directors, General Managers, and SHEQ Executives to review live dashboards and export compliance audit reports.
        </p>
      </div>

      {error && (
        <AlertBanner
          id="mgmt-login-error"
          type="error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* 1-Click Demo Login Shortcut */}
      <button
        type="button"
        onClick={handleQuickDemoLogin}
        disabled={loading}
        className="w-full p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm text-xs font-bold flex items-center justify-between transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="text-left">
            <div className="leading-tight font-black">1-Click Executive Demo Login</div>
            <div className="text-[10px] text-emerald-100 font-normal mt-0.5">
              management@spiralsystems.co.za
            </div>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform shrink-0" />
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-3">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 absolute">
          Or Enter Credentials
        </span>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="mgmt-login-email"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
          >
            Executive Email Address
          </label>
          <div className="relative rounded-md shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="mgmt-login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. director@company.com"
              className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="mgmt-login-password"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
          >
            Password
          </label>
          <div className="relative rounded-md shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="mgmt-login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
            />
          </div>
        </div>

        <button
          id="btn-submit-mgmt-login"
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying Executive Role...</span>
            </>
          ) : (
            <>
              <span>Sign In to Executive Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Role Boundaries Clarity Card */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px] text-slate-600">
        <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Management Scope &amp; Role Boundary:
        </div>
        <div className="grid grid-cols-1 gap-1 pl-1">
          <div className="flex items-center gap-1.5 text-slate-700">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Read-only Executive Dashboard &amp; live KPI tracking</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Download &amp; Export high-res PDF and CSV reports</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <XCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Cannot edit inspections or assign corrective actions</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <XCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Cannot access administrative settings or user accounts</span>
          </div>
        </div>
      </div>

      {/* Navigation Switchers */}
      <div className="pt-2 border-t border-slate-200 flex flex-col gap-2 text-center text-xs text-slate-600">
        <div>
          Need a new management account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegisterManagement}
            className="font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            Register Management
          </button>
        </div>

        <div>
          Are you a field inspector or actioner?{' '}
          <button
            type="button"
            onClick={onSwitchToStaffLogin}
            className="font-semibold text-slate-900 hover:underline cursor-pointer"
          >
            Switch to Workplace Staff Login
          </button>
        </div>
      </div>
    </div>
  );
};
