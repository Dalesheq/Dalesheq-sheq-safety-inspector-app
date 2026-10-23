import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  LayoutDashboard,
  FileText,
  Download,
  Eye,
  LogOut,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { AdminDashboard } from '../components/admin/dashboard/AdminDashboard';
import { ExecutiveReportsView } from '../components/admin/reports/ExecutiveReportsView';
import { ReportPreviewModal } from '../components/admin/reports/ReportPreviewModal';
import { getInspectionById } from '../services/inspectionService';
import { getActionById } from '../services/actionService';
import { Inspection, Action } from '../types/sheq';

interface ManagementHomePlaceholderProps {
  onSwitchToAdminView?: () => void;
}

type ManagementView = 'dashboard' | 'reports';

export const ManagementHomePlaceholder: React.FC<ManagementHomePlaceholderProps> = ({
  onSwitchToAdminView,
}) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<ManagementView>('dashboard');

  // Inspection modal for previewing / downloading PDF
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);

  // Read-only modal for inspecting an action clicked from the dashboard
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  const handleOpenInspectionReport = async (inspectionId: string) => {
    try {
      const insp = await getInspectionById(inspectionId);
      if (insp) {
        setSelectedInspection(insp);
      }
    } catch (err) {
      console.error('Failed to load inspection for report preview:', err);
    }
  };

  const handleOpenActionDetail = async (actionId: string) => {
    try {
      const act = await getActionById(actionId);
      if (act) {
        setSelectedAction(act);
      }
    } catch (err) {
      console.error('Failed to load action details:', err);
    }
  };

  return (
    <div id="management-home-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-6 shadow-sm border border-indigo-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            Executive Leadership &amp; Management Portal
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            SHEQ Executive Dashboard &amp; Official Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Authoritative visibility into company-wide safety, health, environmental, and quality performance, risk trends, and complete downloadable audit documentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && onSwitchToAdminView && (
            <button
              type="button"
              onClick={onSwitchToAdminView}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-100 text-xs font-semibold rounded-lg border border-indigo-700/50 transition-colors shrink-0 cursor-pointer"
            >
              <Eye className="h-4 w-4 text-amber-400" />
              Return to Admin Portal
            </button>
          )}
        </div>
      </div>

      {/* Management Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Executive Dashboard Tab */}
          <button
            id="tab-mgmt-dashboard"
            type="button"
            onClick={() => setCurrentView('dashboard')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 text-indigo-400" />
            Executive Dashboard
          </button>

          {/* Executive Reports Tab */}
          <button
            id="tab-mgmt-reports"
            type="button"
            onClick={() => setCurrentView('reports')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              currentView === 'reports'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="h-4 w-4 text-emerald-400" />
            Official Inspection Reports &amp; PDF Downloads
          </button>
        </div>

        <div className="text-xs font-medium text-slate-500 pr-2">
          Signed in as: <strong className="text-slate-800">{currentUser?.fullName || currentUser?.email}</strong>
        </div>
      </div>

      {/* Main View Area */}
      {currentView === 'dashboard' && (
        <AdminDashboard
          onNavigateToInspections={() => setCurrentView('reports')}
          onNavigateToActions={() => setCurrentView('reports')}
          onViewInspection={handleOpenInspectionReport}
          onOpenActionDetail={(actionId) => handleOpenActionDetail(actionId)}
        />
      )}

      {currentView === 'reports' && (
        <ExecutiveReportsView
          onViewInspectionDetail={handleOpenInspectionReport}
        />
      )}

      {/* Report Preview & High-Quality PDF Modal */}
      {selectedInspection && (
        <ReportPreviewModal
          inspection={selectedInspection}
          onClose={() => setSelectedInspection(null)}
        />
      )}

      {/* Read-Only Action Detail Modal for Management */}
      {selectedAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  {selectedAction.actionNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedAction.title}
                </h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                  selectedAction.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedAction.status === 'In Progress'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {selectedAction.status}
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <strong className="block text-slate-500 uppercase tracking-wider text-[10px]">
                  Description
                </strong>
                <p className="mt-0.5 text-slate-800">{selectedAction.description || 'No description provided.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <strong className="block text-slate-500 uppercase tracking-wider text-[10px]">
                    Assigned Actioner
                  </strong>
                  <p className="mt-0.5 font-semibold text-slate-800">{selectedAction.assignedToNameSnapshot || 'Unassigned'}</p>
                </div>
                <div>
                  <strong className="block text-slate-500 uppercase tracking-wider text-[10px]">
                    Department
                  </strong>
                  <p className="mt-0.5 font-semibold text-slate-800">{selectedAction.departmentNameSnapshot || 'General'}</p>
                </div>
                <div>
                  <strong className="block text-slate-500 uppercase tracking-wider text-[10px]">
                    Priority / Risk
                  </strong>
                  <p className="mt-0.5 font-semibold text-slate-800">{selectedAction.priority || 'Medium'}</p>
                </div>
                <div>
                  <strong className="block text-slate-500 uppercase tracking-wider text-[10px]">
                    Due Date
                  </strong>
                  <p className="mt-0.5 font-semibold text-slate-800">{selectedAction.dueDate || 'None'}</p>
                </div>
              </div>

              {selectedAction.resolutionNotes && (
                <div className="pt-2 border-t border-slate-100">
                  <strong className="block text-slate-500 uppercase tracking-wider text-[10px]">
                    Actioner Resolution Notes
                  </strong>
                  <p className="mt-0.5 text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200">
                    {selectedAction.resolutionNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedAction(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
