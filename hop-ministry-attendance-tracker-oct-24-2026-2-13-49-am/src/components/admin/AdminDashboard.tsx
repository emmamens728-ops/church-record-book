import React from 'react';
import { useChurchData } from '../../context/ChurchDataContext';
import { Users, BookOpen, UserPlus, TrendingUp, Calendar, Clock, Award, Shield, ArrowUpRight, UserCheck, MessageSquare } from 'lucide-react';
import { MemberAttendanceHistory } from './MemberAttendanceHistory';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { members, attendanceRecords, branchSettings } = useChurchData();

  // Statistics
  // Member Counts derived strictly from saved database records
  const totalRegisteredMembers = members.length;
  const totalMaleMembers = members.filter(m => m.gender === 'Male').length;
  const totalFemaleMembers = members.filter(m => m.gender === 'Female').length;
  const totalChildren = members.filter(m => m.ageCategory === 'Child' || m.ageGroup === 'Child').length;
  const totalAdults = members.filter(m => (m.ageCategory === 'Adult' || !m.ageCategory) && m.ageGroup !== 'Child').length;
  const totalUnspecifiedGender = members.filter(m => m.gender === 'Prefer not to say').length;
  const activeMembers = members.filter(m => m.status === 'Active').length;
  
  // Aggregate attendance stats
  const totalServicesRecorded = attendanceRecords.length;
  const totalAttendances = attendanceRecords.reduce((acc, r) => acc + (r.headcounts?.total || 0), 0);
  const averageAttendance = totalServicesRecorded > 0 ? Math.round(totalAttendances / totalServicesRecorded) : 0;

  // Breakdown across all services
  const totalMen = attendanceRecords.reduce((acc, r) => acc + (r.headcounts?.men || 0), 0);
  const totalWomen = attendanceRecords.reduce((acc, r) => acc + (r.headcounts?.women || 0), 0);
  const totalYouth = attendanceRecords.reduce((acc, r) => acc + (r.headcounts?.youth || 0), 0);
  const totalChildrenAttendance = attendanceRecords.reduce((acc, r) => acc + (r.headcounts?.children || 0), 0);
  const totalFirstTimers = attendanceRecords.reduce((acc, r) => acc + (r.headcounts?.firstTimers || 0), 0);

  // Latest service
  const latestService = attendanceRecords[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg border border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
            Executive Pastoral Dashboard
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-black mt-1">
            {branchSettings.churchName}
          </h2>
          <p className="text-xs text-blue-200 mt-1">
            Mankessim Central Branch • General Overseer: {branchSettings.spiritualLeader}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('smsMessaging')}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-blue-950 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-950" />
            <span>SMS Notifications</span>
          </button>
          <button
            onClick={() => onNavigateTab('memberAttendanceHistory')}
            className="px-4 py-2 bg-blue-900/80 hover:bg-blue-800 text-amber-300 rounded-xl text-xs font-bold border border-blue-700 shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Members' Attendance History</span>
          </button>
          <button
            onClick={() => onNavigateTab('attendanceHistory')}
            className="px-4 py-2 bg-blue-900/80 hover:bg-blue-800 text-white rounded-xl text-xs font-bold border border-blue-700 shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Services Archive</span>
          </button>
        </div>
      </div>

      {/* 3. AUTOMATIC MEMBER COUNTING ON ADMIN DASHBOARD */}
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-serif font-bold text-sm text-blue-950 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              <span>Registered Church Membership Statistics</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Accurate summary counts derived strictly from saved church database records
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-200">
            Live Database
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Total Registered Members */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
              Total Registered
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
              {totalRegisteredMembers}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
              {activeMembers} Active
            </span>
          </div>

          {/* 2. Total Male Members */}
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 text-center">
            <span className="text-[10px] font-bold text-blue-900 block uppercase tracking-wider">
              Total Male
            </span>
            <span className="text-2xl font-black text-blue-950 font-mono mt-1 block">
              {totalMaleMembers}
            </span>
            <span className="text-[10px] text-blue-600 font-medium mt-0.5 block">
              Men & Boys
            </span>
          </div>

          {/* 3. Total Female Members */}
          <div className="bg-pink-50/70 p-4 rounded-xl border border-pink-200 text-center">
            <span className="text-[10px] font-bold text-pink-900 block uppercase tracking-wider">
              Total Female
            </span>
            <span className="text-2xl font-black text-pink-950 font-mono mt-1 block">
              {totalFemaleMembers}
            </span>
            <span className="text-[10px] text-pink-600 font-medium mt-0.5 block">
              Women & Girls
            </span>
          </div>

          {/* 4. Total Children */}
          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-center">
            <span className="text-[10px] font-bold text-emerald-900 block uppercase tracking-wider">
              Total Children
            </span>
            <span className="text-2xl font-black text-emerald-950 font-mono mt-1 block">
              {totalChildren}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
              Sunday School
            </span>
          </div>

          {/* 5. Total Adults */}
          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 text-center">
            <span className="text-[10px] font-bold text-amber-900 block uppercase tracking-wider">
              Total Adults
            </span>
            <span className="text-2xl font-black text-amber-950 font-mono mt-1 block">
              {totalAdults}
            </span>
            <span className="text-[10px] text-amber-700 font-medium mt-0.5 block">
              Adult Believers
            </span>
          </div>

          {/* 6. Unspecified Gender */}
          <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200 text-center">
            <span className="text-[10px] font-bold text-purple-900 block uppercase tracking-wider">
              Unspecified Gender
            </span>
            <span className="text-2xl font-black text-purple-950 font-mono mt-1 block">
              {totalUnspecifiedGender}
            </span>
            <span className="text-[10px] text-purple-600 font-medium mt-0.5 block">
              Prefer not to say
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Members
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-black text-slate-900 mt-2">
            {totalRegisteredMembers}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {activeMembers} Active in Mankessim
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Average Sunday Turnout
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-black text-slate-900 mt-2">
            {averageAttendance}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {totalServicesRecorded} Recorded Services
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              First-Timers Received
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-black text-slate-900 mt-2">
            {totalFirstTimers}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            New Visitors for Follow-up
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Latest Service Total
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-black text-slate-900 mt-2">
            {latestService ? latestService.headcounts?.total : 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {latestService ? latestService.date : 'No service yet'}
          </p>
        </div>
      </div>

      {/* Demographic Breakdown & Latest Service Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cumulative Demographic Distribution */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl lg:col-span-1 space-y-4">
          <h3 className="font-serif font-bold text-sm text-blue-950 border-b border-slate-100 pb-2">
            Congregation Demographics
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700">Women</span>
                <span className="text-blue-950 font-bold">{totalWomen}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full"
                  style={{ width: `${totalAttendances > 0 ? (totalWomen / totalAttendances) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700">Men</span>
                <span className="text-blue-950 font-bold">{totalMen}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${totalAttendances > 0 ? (totalMen / totalAttendances) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700">Youth</span>
                <span className="text-blue-950 font-bold">{totalYouth}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${totalAttendances > 0 ? (totalYouth / totalAttendances) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700">Children</span>
                <span className="text-blue-950 font-bold">{totalChildren}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${totalAttendances > 0 ? (totalChildren / totalAttendances) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
            Based on {totalAttendances} total worshippers counted across all logged sessions.
          </div>
        </div>

        {/* Latest Recorded Sunday Service Card */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-serif font-bold text-sm text-blue-950">
              Most Recent Sunday Service File
            </h3>
            {latestService && (
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {latestService.date}
              </span>
            )}
          </div>

          {latestService ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Service Type</span>
                  <span className="font-semibold text-slate-800">{latestService.serviceType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Preacher</span>
                  <span className="font-semibold text-slate-800">{latestService.preacher}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Sermon Topic</span>
                  <span className="font-serif font-bold text-blue-950 text-sm">{latestService.sermonTopic}</span>
                  {latestService.bibleReference && (
                    <span className="text-slate-500 block mt-0.5 italic">{latestService.bibleReference}</span>
                  )}
                </div>
              </div>

              {/* Headcounts row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                <div className="p-2 bg-blue-50/60 rounded-lg border border-blue-100">
                  <span className="text-[10px] text-slate-500 block uppercase">Men</span>
                  <span className="font-bold text-slate-900">{latestService.headcounts?.men}</span>
                </div>
                <div className="p-2 bg-pink-50/60 rounded-lg border border-pink-100">
                  <span className="text-[10px] text-slate-500 block uppercase">Women</span>
                  <span className="font-bold text-slate-900">{latestService.headcounts?.women}</span>
                </div>
                <div className="p-2 bg-amber-50/60 rounded-lg border border-amber-100">
                  <span className="text-[10px] text-slate-500 block uppercase">Youth</span>
                  <span className="font-bold text-slate-900">{latestService.headcounts?.youth}</span>
                </div>
                <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block uppercase">Children</span>
                  <span className="font-bold text-slate-900">{latestService.headcounts?.children}</span>
                </div>
                <div className="p-2 bg-purple-50/60 rounded-lg border border-purple-100 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-purple-700 block uppercase font-bold">Total</span>
                  <span className="font-black text-purple-950 text-base">{latestService.headcounts?.total}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500 text-[11px]">
                  Logged by: <strong>{latestService.recordedBy}</strong>
                </span>
                <button
                  onClick={() => onNavigateTab('reports')}
                  className="inline-flex items-center gap-1 text-blue-900 font-semibold hover:underline"
                >
                  <span>Open Full Reports</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No attendance logged yet.</p>
          )}
        </div>
      </div>

      {/* 
        FEATURE: MEMBERS' ATTENDANCE HISTORY SECTION
        Allows the administrator to select any registered church member and view
        that person's attendance history for every Sunday service already recorded.
      */}
      <div className="pt-2">
        <MemberAttendanceHistory />
      </div>
    </div>
  );
};
