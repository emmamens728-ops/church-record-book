import React, { useState } from 'react';
import { ChurchImage } from '../common/ChurchImage';
import { NavBarControls } from '../common/NavBarControls';
import { AdminDashboard } from './AdminDashboard';
import { AdminMemberManager } from './AdminMemberManager';
import { AttendanceHistory } from './AttendanceHistory';
import { ReportsSummaries } from './ReportsSummaries';
import { AdminAccountSettings } from './AdminAccountSettings';
import { ApplicationSettings } from './ApplicationSettings';
import { BackupRecovery } from './BackupRecovery';
import { MemberAttendanceHistory } from './MemberAttendanceHistory';
import { useAuth } from '../../context/AuthContext';
import { useChurchData } from '../../context/ChurchDataContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  KeyRound,
  Settings,
  HardDrive,
  LogOut,
  Home,
  BookOpen,
  Menu,
  X,
  MapPin,
  UserCheck,
  MessageSquare,
  Shield,
} from 'lucide-react';
import { SmsMessaging } from './SmsMessaging';

interface AdminLayoutProps {
  onBackToHome: () => void;
  onOpenRecordBook: () => void;
}

type AdminTab =
  | 'dashboard'
  | 'smsMessaging'
  | 'memberAttendanceHistory'
  | 'members'
  | 'attendanceHistory'
  | 'reports'
  | 'accountSettings'
  | 'appSettings'
  | 'backup';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToHome, onOpenRecordBook }) => {
  const { currentUser, logout } = useAuth();
  const { branchSettings } = useChurchData();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onBackToHome();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'smsMessaging', label: 'SMS Messaging & Notifications', icon: MessageSquare },
    { id: 'memberAttendanceHistory', label: "Members' Attendance History", icon: UserCheck },
    { id: 'members', label: 'Member Directory & Roster', icon: Users },
    { id: 'attendanceHistory', label: 'Services Attendance Archive', icon: Calendar },
    { id: 'reports', label: 'Reports & Summaries', icon: BarChart3 },
    { id: 'accountSettings', label: 'Admin Security & Login', icon: KeyRound },
    { id: 'appSettings', label: 'SETTINGS', icon: Settings },
    { id: 'backup', label: 'Backup & Recovery', icon: HardDrive },
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row relative z-10">
      {/* Mobile Top Header with Navigation */}
      <header className="md:hidden bg-gradient-to-r from-blue-950/95 via-blue-900/95 to-blue-950/95 backdrop-blur-md text-white p-3.5 flex items-center justify-between border-b border-amber-500/30 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="h-8 w-auto flex items-center justify-center shrink-0 bg-transparent">
            <ChurchImage imageKey="primaryLogo" alt="Logo" className="h-8 w-auto object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" priority={true} />
          </div>
          <div>
            <h2 className="font-serif font-black text-xs uppercase text-amber-400">HOP ADMIN</h2>
            <p className="text-[9px] text-blue-200">Mankessim Branch</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NavBarControls variant="dark" showHome={false} />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar for Desktop / Mobile Drawer */}
      <aside
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-blue-950 text-white flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen z-30 border-r border-blue-900/80 shadow-xl`}
      >
        <div>
          {/* Church Branding Header in Sidebar */}
          <div className="p-5 border-b border-blue-900/80">
            <div className="flex items-center gap-3">
              <div className="h-11 w-auto flex items-center justify-center shrink-0 bg-transparent">
                <ChurchImage
                  imageKey="primaryLogo"
                  alt="House of Power Primary Logo"
                  className="h-11 w-auto object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
                  priority={true}
                />
              </div>

              <div>
                <h2 className="font-serif font-black text-sm text-amber-400 tracking-wide uppercase leading-tight">
                  HOUSE OF POWER
                </h2>
                <p className="text-[10px] text-blue-200 font-serif font-medium mt-0.5">
                  Mankessim Central Branch
                </p>
                <div className="flex items-center gap-1 text-[9px] text-amber-300/80 font-mono mt-0.5">
                  <Shield className="w-2.5 h-2.5" />
                  <span>Admin Authority</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as AdminTab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 min-h-[44px] px-3.5 py-2.5 rounded-xl font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-amber-500 text-blue-950 font-bold shadow-sm'
                      : 'text-blue-200 hover:bg-blue-900/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-950' : 'text-amber-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User identity & fast switches */}
        <div className="p-4 border-t border-blue-900/80 space-y-3">
          <div className="bg-blue-900/50 p-2.5 rounded-xl border border-blue-800 text-[11px]">
            <p className="text-blue-300 text-[10px]">Logged in as:</p>
            <p className="font-bold text-white truncate">{currentUser?.fullName || 'Rev. Administrator'}</p>
            <p className="text-[10px] text-amber-300 font-mono truncate">{currentUser?.email || 'admin@houseofpower.org'}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={onOpenRecordBook}
              className="min-h-[44px] px-2.5 py-2 bg-blue-900 hover:bg-blue-800 text-blue-200 hover:text-white rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              title="Open Record Book"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Record Book</span>
            </button>

            <button
              onClick={handleLogout}
              className="min-h-[44px] px-2.5 py-2 bg-red-950/60 hover:bg-red-900 text-red-200 hover:text-white rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOG OUT</span>
            </button>
          </div>

          <button
            onClick={onBackToHome}
            className="w-full py-1.5 text-center text-[11px] text-blue-300 hover:text-white transition-colors"
          >
            ← Return to Church Homepage
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Workspace Bar with Backward & Forward Navigation */}
        <div className="hidden md:flex items-center justify-between px-8 py-3.5 bg-blue-950/85 backdrop-blur-md border-b border-amber-500/30 text-white">
          <div className="flex items-center gap-3">
            <span className="font-serif font-black text-sm text-amber-400 tracking-wide uppercase">
              {navItems.find(i => i.id === activeTab)?.label || 'Admin Portal'}
            </span>
            <span className="text-xs text-blue-200">
              • Mankessim Central Branch
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Backward & Forward History Navigation */}
            <NavBarControls variant="dark" showHome={true} />

            <button
              onClick={onOpenRecordBook}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/80 hover:bg-blue-800 text-amber-300 rounded-lg text-xs font-semibold border border-amber-400/40 transition-colors shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Record Book</span>
            </button>
          </div>
        </div>

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={tab => setActiveTab(tab as AdminTab)} />}
          {activeTab === 'smsMessaging' && <SmsMessaging />}
          {activeTab === 'memberAttendanceHistory' && <MemberAttendanceHistory />}
          {activeTab === 'members' && <AdminMemberManager />}
          {activeTab === 'attendanceHistory' && <AttendanceHistory />}
          {activeTab === 'reports' && <ReportsSummaries />}
          {activeTab === 'accountSettings' && <AdminAccountSettings />}
          {activeTab === 'appSettings' && <ApplicationSettings />}
          {activeTab === 'backup' && <BackupRecovery />}
        </main>

        <footer className="bg-blue-950/90 backdrop-blur-md border-t border-amber-500/30 py-3 px-6 text-xs text-blue-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-serif font-medium text-amber-300">{branchSettings.churchName} • Mankessim, Ghana</span>
          <span className="text-[11px] text-blue-300/80 font-mono">
            Secure Admin Session • PBKDF2/SHA-256 Active
          </span>
        </footer>
      </div>
    </div>
  );
};
