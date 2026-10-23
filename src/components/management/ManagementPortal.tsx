import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from '../admin/dashboard/AdminDashboard';
import { ExecutiveReportsView } from '../admin/reports/ExecutiveReportsView';
import { ReportPreviewModal } from '../admin/reports/ReportPreviewModal';
import { getInspectionById } from '../../services/inspectionService';
import { Inspection } from '../../types/sheq';
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Building2,
  Calendar,
  LogOut,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react';

interface ManagementPortalProps {
  onReturnToAdmin?: () => void;
}

export const ManagementPortal: React.FC<ManagementPortalProps> = ({ onReturnToAdmin }) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports'>('dashboard');

  // Modal inspection for direct report preview from dashboard drill-downs
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);

  const handleViewInspectionReport = async (inspectionId: string) => {
    try {
      const insp = await getInspectionById(inspectionId);
      if (insp) {
        setSelectedInspection(insp);
      }
    } catch (err) {
      console.error('Failed to load inspection report for management view:', err);
    }
  };

  return (
    <div id="management-portal-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Executive Welcome & Mode Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Executive Management Portal
            </span>
            <span className="text-xs text-slate-400 font-mono">•</span>
            <span className="text-xs font-semibold text-slate-300">
              {currentUser?.fullName || 'Executive Manager'}
            </span>
            <span className="text-xs text-slate-400 font-mono">•</span>
            <span className="text-xs text-slate-400">
              {currentUser?.email}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Executive SHEQ Oversight &amp; Reports Archive
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            High-level executive dashboard tracking workplace safety, compliance trends, overdue corrective actions, and downloadable audit reports with embedded high-resolution photographs.
          </p>
        </div>

        {/* Action Controls & Admin Preview Exit */}
        <div className="flex items-center gap-3 relative z-10 self-start md:self-center">
          {isAdmin && onReturnToAdmin && (
            <button
              type="button"
              onClick={onReturnToAdmin}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-amber-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm cursor-pointer"
              title="Return to full SHEQ Administrator console"
            >
              <Eye className="h-4 w-4" />
              <span>Back to Admin Console</span>
            </button>
          )}

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Strictly 2 tabs: Executive Dashboard & Download Reports) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-xl">
          <button
            type="button"
            id="tab-mgmt-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 text-emerald-600" />
            <span>Executive Dashboard</span>
          </button>

          <button
            type="button"
            id="tab-mgmt-reports"
            onClick={() => setActiveTab('reports')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="h-4 w-4 text-sky-600" />
            <span>Inspection Reports &amp; Downloads</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          {activeTab === 'dashboard'
            ? 'Real-time KPIs & Risk Metrics'
            : 'Downloadable Executive PDFs'}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            <AdminDashboard
              onNavigateToInspections={() => setActiveTab('reports')}
              onNavigateToActions={() => setActiveTab('reports')}
              onViewInspection={(id) => handleViewInspectionReport(id)}
              onOpenActionDetail={(_, inspectionId) => {
                if (inspectionId) {
                  handleViewInspectionReport(inspectionId);
                } else {
                  setActiveTab('reports');
                }
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <ExecutiveReportsView
              onViewInspectionDetail={(id) => handleViewInspectionReport(id)}
            />
          </div>
        )}
      </div>

      {/* Direct Report Preview Modal */}
      {selectedInspection && (
        <ReportPreviewModal
          inspection={selectedInspection}
          onClose={() => setSelectedInspection(null)}
        />
      )}
    </div>
  );
};
