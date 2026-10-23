import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertBanner } from '../common/AlertBanner';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToReset: () => void;
  onSwitchToInitialAdmin?: () => void;
  onSwitchToManagementLogin?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSwitchToReset,
  onSwitchToInitialAdmin,
  onSwitchToManagementLogin,
}) => {
  const { login, registerManagement, initialAdminExists } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickManagementLogin = async () => {
    setError(null);
    setLoading(true);
    const mgmtEmail = 'management@spiralsystems.co.za';
    const mgmtPass = 'Management2026!';
    try {
      try {
        await login(mgmtEmail, mgmtPass);
      } catch (err: any) {
        // If user doesn't exist yet, auto-provision management account
        const msg = String(err?.message || '');
        if (msg.includes('user-not-found') || msg.includes('invalid-credential') || msg.includes('auth/invalid-credential')) {
          await registerManagement('Executive Management', mgmtEmail, mgmtPass);
        } else {
          throw err;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Management sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-form-container" className="space-y-5">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            Inspector &amp; Staff Login
          </span>
          {onSwitchToManagementLogin && (
            <button
              type="button"
              onClick={onSwitchToManagementLogin}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Executive Login →
            </button>
          )}
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Workplace Sign In</h2>
        <p className="text-xs text-slate-500 mt-0.5">Enter your inspector or actioner credentials to manage walkthroughs and tasks.</p>
      </div>

      {error && <AlertBanner id="login-error-banner" type="error" message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Email Address
          </label>
          <div className="relative rounded-md shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. inspector@company.com"
              className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-800 focus:border-slate-800"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Password
            </label>
            <button
              type="button"
              id="btn-goto-forgot-password"
              onClick={onSwitchToReset}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative rounded-md shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-800 focus:border-slate-800"
            />
          </div>
        </div>

        <button
          id="btn-submit-login"
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Workplace Logins */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">
          Quick Workplace Access
        </div>

        <button
          type="button"
          onClick={handleQuickManagementLogin}
          disabled={loading}
          className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
        >
          <div className="text-left">
            <span className="block font-bold">Sign In as Management</span>
            <span className="text-[10px] text-emerald-700 font-normal">Executive Dashboard &amp; Download Reports</span>
          </div>
          <ArrowRight className="h-4 w-4 text-emerald-700 shrink-0" />
        </button>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => {
              setEmail('sheq@spiralsystems.co.za');
              setPassword('');
            }}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium text-center truncate cursor-pointer"
            title="Fill Administrator Email"
          >
            Admin: sheq@...
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail('hannes@spiralsystems.co.za');
              setPassword('');
            }}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium text-center truncate cursor-pointer"
            title="Fill Actioner Email"
          >
            Actioner: hannes@...
          </button>
        </div>
      </div>

      <div className="pt-2 flex flex-col gap-2.5 text-center text-xs text-slate-600">
        <div>
          New actioner team member?{' '}
          <button
            type="button"
            id="btn-goto-register"
            onClick={onSwitchToRegister}
            className="font-semibold text-slate-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Register account
          </button>
        </div>

        {!initialAdminExists && onSwitchToInitialAdmin && (
          <div className="p-2.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900">
            <p className="font-semibold">Initial Setup Required</p>
            <p className="text-[11px] text-amber-800 mt-0.5 mb-1.5">
              No administrator has been configured for this system yet.
            </p>
            <button
              type="button"
              id="btn-goto-initial-admin"
              onClick={onSwitchToInitialAdmin}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded shadow-xs cursor-pointer"
            >
              Configure First Administrator
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
