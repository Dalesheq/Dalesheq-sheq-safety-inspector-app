import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface ManagementRouteProps {
  children: React.ReactNode;
  onNavigateToActioner?: () => void;
}

export const ManagementRoute: React.FC<ManagementRouteProps> = ({
  children,
  onNavigateToActioner,
}) => {
  const { currentUser, isManagement, isAdmin } = useAuth();

  if (!isManagement && !isAdmin) {
    return (
      <div id="management-access-denied" className="max-w-lg mx-auto my-12 p-6 bg-white rounded-xl shadow-xs border border-amber-200 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Management Access Required</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your current account (<strong className="text-slate-800">{currentUser?.email}</strong>) has the <strong className="uppercase text-slate-800">{currentUser?.role || 'actioner'}</strong> role.
        </p>
        <p className="text-xs text-slate-500">
          The Executive Portal is reserved for management leadership and SHEQ administrators.
        </p>
        {onNavigateToActioner && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onNavigateToActioner}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Go to My Actioner Dashboard
            </button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};
