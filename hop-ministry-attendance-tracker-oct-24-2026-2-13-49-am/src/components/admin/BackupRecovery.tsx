import React, { useState } from 'react';
import { useChurchData } from '../../context/ChurchDataContext';
import { HardDrive, Download, Upload, RotateCcw, CheckCircle2, AlertTriangle, Database, ShieldAlert, AlertOctagon, X, Check } from 'lucide-react';

export const BackupRecovery: React.FC = () => {
  const { members, attendanceRecords, exportBackup, restoreBackup, resetOperationalRecords } = useChurchData();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleDownloadBackup = () => {
    const jsonStr = exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HOP_Church_Mankessim_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setFeedback({
      type: 'success',
      message: 'Church database exported successfully as a secure JSON backup snapshot!',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = restoreBackup(content);
        if (result.success) {
          setFeedback({
            type: 'success',
            message: `Database restored: ${result.count?.members} members and ${result.count?.attendance} attendance records recovered!`,
          });
        } else {
          setFeedback({
            type: 'error',
            message: result.message || 'Restoration failed due to invalid file structure.',
          });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    setFeedback(null);
    try {
      // 1. Auto-export a safety backup file download to the administrator's device
      handleDownloadBackup();

      // 2. Perform database operational reset
      const result = await resetOperationalRecords(true);

      if (result.success) {
        setShowResetModal(false);
        setFeedback({
          type: 'success',
          message:
            'CHURCH OPERATIONAL DATA CLEARED SUCCESSFULLY: Old member and attendance records have been reset. A safety backup JSON was exported automatically. Initial database values: Total Registered Members: 0, Total Male: 0, Total Female: 0, Total Children: 0, Present Today: 0, Absent Today: 0, Pending: 0.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: 'Reset could not complete. Your existing records were not modified.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'An error occurred while executing database reset.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-blue-950 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-amber-600" />
            <span>Database Backup, Export & Disaster Recovery</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Download full snapshots of church membership rolls and attendance registers
          </p>
        </div>
      </div>

      {feedback && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="font-medium text-xs leading-relaxed">{feedback.message}</span>
        </div>
      )}

      {/* Storage Status */}
      <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-5 text-xs text-blue-950">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm text-blue-950">
              Active Storage Statistics: File &amp; Browser Persistent Store
            </h3>
            <p className="text-blue-800/80 text-[11px] mt-1">
              Currently preserving <strong>{members.length} registered members</strong> and <strong>{attendanceRecords.length} service attendance sessions</strong> in server files and instant browser cache.
            </p>
            <p className="text-[11px] text-blue-800/70 mt-0.5">
              To safeguard against accidental data loss, export a JSON backup file regularly.
            </p>
          </div>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Backup Card */}
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-blue-950">
              Export Database Snapshot (.json)
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Creates an encrypted, formatted JSON archive containing all members, service attendance headcounts, roll-call records, and church settings. Suitable for offsite archival and migration.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Download Church Backup File</span>
          </button>
        </div>

        {/* Restore Backup Card */}
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-blue-950">
              Restore from Backup Archive
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upload a previously generated <code>.json</code> backup to restore your church data. Validates database schema before applying changes to prevent corruption.
            </p>
          </div>

          <label className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Select &amp; Restore Backup File</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Reset Operational Data Afresh Section */}
      <div className="bg-red-50/50 rounded-2xl border border-red-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-base text-red-950 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
              <span>Reset Member and Attendance Records Afresh</span>
            </h4>
            <p className="text-xs text-red-800/80 leading-relaxed max-w-2xl">
              Permanently clears existing member records and attendance history to start fresh from member registration. Preserves church logo, lion background, admin login accounts, SMS configurations, and website settings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-colors cursor-pointer shrink-0"
          >
            Clear Records &amp; Start Afresh
          </button>
        </div>
      </div>

      {/* Prescribed Exact Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-slate-900">
                  Confirm Database Reset
                </h4>
                <p className="text-[11px] text-slate-500">
                  House of Power Ministry International, Mankessim
                </p>
              </div>
            </div>

            {/* Prescribed Exact Warning Notice */}
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl">
              <p className="text-xs font-bold text-red-950 leading-relaxed">
                WARNING: This action will permanently clear the existing member records and attendance history. This action cannot be undone unless a backup is available. Do you want to continue?
              </p>
            </div>

            <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <p className="font-semibold text-slate-800">What will happen:</p>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600">
                <li>An automated safety backup JSON file will be downloaded immediately.</li>
                <li>All old member records and attendance submissions will be cleared.</li>
                <li>Initial counts will reset to 0: Registered: 0, Male: 0, Female: 0, Children: 0, Present Today: 0, Absent Today: 0, Pending: 0.</li>
                <li>Church logo, background artwork, admin accounts, and website settings remain protected and intact.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleConfirmReset}
                className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{isResetting ? 'Exporting Backup & Resetting...' : 'Yes, Export Backup & Reset Records'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

