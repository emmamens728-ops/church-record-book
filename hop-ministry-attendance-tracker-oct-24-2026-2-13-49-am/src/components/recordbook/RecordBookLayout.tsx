import React, { useState } from 'react';
import { ChurchImage } from '../common/ChurchImage';
import { NavBarControls } from '../common/NavBarControls';
import { SundayAttendance } from './SundayAttendance';
import { MemberRegistration } from './MemberRegistration';
import { MemberDirectory } from './MemberDirectory';
import { FirstTimersTracker } from './FirstTimersTracker';
import { BookOpen, UserPlus, Users, UserCheck, ArrowLeft, Shield, MapPin, Sparkles } from 'lucide-react';
import { useChurchData } from '../../context/ChurchDataContext';

interface RecordBookLayoutProps {
  onBackToHome: () => void;
  onOpenAdmin: () => void;
}

type TabType = 'attendance' | 'registration' | 'directory' | 'visitors';

export const RecordBookLayout: React.FC<RecordBookLayoutProps> = ({ onBackToHome, onOpenAdmin }) => {
  const [activeTab, setActiveTab] = useState<TabType>('attendance');
  const { branchSettings } = useChurchData();

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative z-10">
      {/* Top App Header with Backward & Forward Navigation */}
      <header className="bg-gradient-to-r from-blue-950/95 via-blue-900/95 to-blue-950/95 backdrop-blur-md text-white shadow-lg sticky top-0 z-30 border-b border-amber-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Church Title */}
            <div className="flex items-center gap-3">
              <div className="h-10 sm:h-12 w-auto flex items-center justify-center shrink-0 bg-transparent">
                <ChurchImage
                  imageKey="primaryLogo"
                  alt="House of Power Church Logo"
                  className="h-10 sm:h-12 w-auto object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
                  priority={true}
                />
              </div>

              <div>
                <h1 className="font-serif font-black text-sm sm:text-base text-amber-400 tracking-wide uppercase leading-tight">
                  HOUSE OF POWER RECORD BOOK
                </h1>
                <p className="text-[11px] text-blue-200 flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>Mankessim Branch • Central Region, Ghana</span>
                </p>
              </div>
            </div>

            {/* Quick action buttons & Navigation */}
            <div className="flex items-center gap-2">
              {/* Backward & Forward Page Navigation */}
              <NavBarControls variant="dark" showHome={true} />

              <button
                onClick={onOpenAdmin}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/80 hover:bg-blue-800 text-amber-300 hover:text-white rounded-lg text-xs font-semibold border border-amber-400/40 transition-colors shadow-2xs"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Portal</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto space-x-2 pb-2.5 pt-1 text-xs scrollbar-none">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
                activeTab === 'attendance'
                  ? 'bg-amber-500 text-blue-950 font-bold shadow-xs'
                  : 'text-blue-200 hover:bg-blue-900/60 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>SUNDAY SERVICE ATTENDANCE</span>
            </button>

            <button
              onClick={() => setActiveTab('registration')}
              className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
                activeTab === 'registration'
                  ? 'bg-amber-500 text-blue-950 font-bold shadow-xs'
                  : 'text-blue-200 hover:bg-blue-900/60 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>MEMBER REGISTRATION</span>
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
                activeTab === 'directory'
                  ? 'bg-amber-500 text-blue-950 font-bold shadow-xs'
                  : 'text-blue-200 hover:bg-blue-900/60 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>MEMBER DIRECTORY</span>
            </button>

            <button
              onClick={() => setActiveTab('visitors')}
              className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                activeTab === 'visitors'
                  ? 'bg-amber-500 text-blue-950 font-bold shadow-xs'
                  : 'text-blue-200 hover:bg-blue-900/60 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>First-Timers Tracker</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'attendance' && <SundayAttendance />}
        {activeTab === 'registration' && <MemberRegistration />}
        {activeTab === 'directory' && <MemberDirectory />}
        {activeTab === 'visitors' && <FirstTimersTracker />}
      </main>

      {/* Footer */}
      <footer className="bg-blue-950/90 backdrop-blur-md border-t border-amber-500/30 py-4 text-center text-xs text-blue-200">
        <p className="font-serif font-bold text-amber-300">
          House of Power Ministry International • Mankessim, Ghana
        </p>
        <p className="text-[11px] text-blue-200/90 mt-0.5">
          Clerk & Ushering Duty Station • “Heaven Oo!!! Ɛho ɛna Yɛpɛ”
        </p>
      </footer>
    </div>
  );
};
