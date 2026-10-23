import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { Navbar } from './components/common/Navbar';
import { AuthPage } from './pages/AuthPage';
import { AccountDeactivated } from './pages/AccountDeactivated';
import { AdminHomePlaceholder } from './pages/AdminHomePlaceholder';
import { ActionerHomePlaceholder } from './pages/ActionerHomePlaceholder';
import { ManagementPortal } from './components/management/ManagementPortal';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { AdminRoute } from './components/routing/AdminRoute';
import { ActionerRoute } from './components/routing/ActionerRoute';
import { OfflineIndicator } from './components/common/PWAStatusAndInstall';

type PortalView = 'admin' | 'actioner' | 'management';

const AppContent: React.FC = () => {
  const { firebaseUser, currentUser, loading, isAdmin, isActioner, isManagement } = useAuth();
  const [activePortal, setActivePortal] = useState<PortalView>('admin');

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading SHEQ System..." subtext="Connecting to Firebase Authentication" />;
  }

  // If unauthenticated, display the authentication portal
  if (!firebaseUser || !currentUser) {
    return <AuthPage />;
  }

  // If user profile is marked inactive (deactivated by admin)
  if (!currentUser.active) {
    return <AccountDeactivated />;
  }

  // Determine current portal view:
  // - Management users can ONLY see the management portal
  // - Actioners can ONLY see the actioner portal
  // - Admins see admin by default, but can preview management or actioner views
  const effectivePortal: PortalView = isManagement
    ? 'management'
    : isActioner
    ? 'actioner'
    : activePortal;

  return (
    <ProtectedRoute>
      <div id="sheq-app-root" className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <Navbar
          currentView={effectivePortal}
          onNavigate={(view) => setActivePortal(view as PortalView)}
        />

        <main className="flex-1">
          {effectivePortal === 'management' ? (
            <ManagementPortal onReturnToAdmin={isAdmin ? () => setActivePortal('admin') : undefined} />
          ) : effectivePortal === 'actioner' ? (
            <ActionerRoute>
              <ActionerHomePlaceholder onReturnToAdmin={() => setActivePortal('admin')} />
            </ActionerRoute>
          ) : (
            <AdminRoute onNavigateToActioner={() => setActivePortal('actioner')}>
              <AdminHomePlaceholder
                onSwitchToActionerView={() => setActivePortal('actioner')}
                onSwitchToManagementView={() => setActivePortal('management')}
              />
            </AdminRoute>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <OfflineIndicator />
    </AuthProvider>
  );
}
