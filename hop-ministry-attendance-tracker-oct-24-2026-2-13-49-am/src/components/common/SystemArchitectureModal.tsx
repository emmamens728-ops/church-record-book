import React from 'react';
import { X, Server, Database, ShieldCheck, Github, HardDrive, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface SystemArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemArchitectureModal: React.FC<SystemArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between border-b border-blue-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold tracking-wide">
                System Architecture & Deployment Guide
              </h2>
              <p className="text-xs text-blue-200">
                House of Power Ministry International • Mankessim, Ghana
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-300 hover:text-white p-1 rounded-lg hover:bg-blue-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Current State Status */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 text-sm">
                  Active Storage Engine: Client-Side Persistent Storage (IndexedDB / LocalStorage)
                </h3>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  In compliance with development rules, this application does <strong>not</strong> fake external database operations or claim a remote server is connected when running as a frontend single-page application. All records entered are genuinely preserved in your browser's persistent storage, with full JSON Backup & Recovery support.
                </p>
              </div>
            </div>
          </div>

          {/* GitHub Pages vs Production Backend */}
          <div>
            <h3 className="text-base font-serif font-bold text-blue-950 flex items-center gap-2 mb-3">
              <Github className="w-4 h-4 text-slate-800" />
              Deployment Analysis: GitHub Pages (Static Hosting)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              GitHub Pages delivers static HTML, JavaScript, and CSS files. When this repository is pushed to GitHub and hosted on GitHub Pages:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                <div className="flex items-center gap-2 font-semibold text-slate-800 text-xs mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  What Works on GitHub Pages
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>Full UI, Sunday roll-call, and forms</li>
                  <li>Local storage of attendance records</li>
                  <li>Local JSON Database Export & Import</li>
                  <li>Single-device usher or clerk record keeping</li>
                  <li>Printable service summaries and statistics</li>
                </ul>
              </div>

              <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/40">
                <div className="flex items-center gap-2 font-semibold text-amber-900 text-xs mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  What Requires External Backend
                </div>
                <ul className="text-xs text-amber-800 space-y-1.5 list-disc list-inside">
                  <li>Multi-device real-time sync across multiple ushers</li>
                  <li>Centralized cloud database across pastoral branch network</li>
                  <li>Server-authoritative password authentication & RBAC</li>
                  <li>Automated daily offsite cloud backups</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recommended Backend Roadmap */}
          <div>
            <h3 className="text-base font-serif font-bold text-blue-950 flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-blue-700" />
              Recommended Production Backend Options
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              To connect this application to a shared central database for the Mankessim branch, any of the following standard architectures can be plugged into our modular data service:
            </p>

            <div className="space-y-2.5">
              <div className="p-3 border border-slate-200 rounded-lg bg-white flex items-start gap-3">
                <div className="w-7 h-7 rounded bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    PostgreSQL / Cloud SQL + Express REST API (Full Stack)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Provides enterprise relational schemas for membership directories, tithing, and attendance auditing with JWT session security.
                  </p>
                </div>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg bg-white flex items-start gap-3">
                <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    Supabase / Cloud Firestore (BaaS Backend)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Instant real-time subscriptions so multiple ushers simultaneously taking roll-call at different doors sync without conflicts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Password Storage */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-4 h-4 text-blue-800" />
              Cryptographic Password Security
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Passwords in this application are never stored in plain text. When created or changed, they are hashed using the browser's cryptographic Web Crypto API with SHA-256 and a 128-bit unique cryptographic salt.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Current Build: v1.0.0 (Foundation & Modular Architecture)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
