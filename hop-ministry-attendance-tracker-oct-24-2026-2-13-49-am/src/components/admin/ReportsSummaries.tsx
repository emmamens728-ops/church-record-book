import React from 'react';
import { useChurchData } from '../../context/ChurchDataContext';
import { BarChart3, TrendingUp, Users, Printer, Download, Sparkles, Award } from 'lucide-react';

export const ReportsSummaries: React.FC = () => {
  const { members, attendanceRecords, branchSettings } = useChurchData();

  // Aggregate numbers
  const totalServices = attendanceRecords.length;
  const totalAttendance = attendanceRecords.reduce((acc, r) => acc + (r.headcounts?.total || 0), 0);
  const avgAttendance = totalServices > 0 ? Math.round(totalAttendance / totalServices) : 0;
  
  const totalMen = attendanceRecords.reduce((acc, r) => acc + (r.headcounts?.men || 0), 0);
  const totalWomen = attendanceRecords.reduce((acc, r) => acc + (r.headcounts?.women || 0), 0);
  const totalYouth = attendanceRecords.reduce((acc, r) => acc + (r.headcounts?.youth || 0), 0);
  const totalChildren = attendanceRecords.reduce((acc, r) => acc + (r.headcounts?.children || 0), 0);
  const totalFirstTimers = attendanceRecords.reduce((acc, r) => acc + (r.headcounts?.firstTimers || 0), 0);

  // Department distribution
  const deptCounts: Record<string, number> = {};
  members.forEach(m => {
    deptCounts[m.department] = (deptCounts[m.department] || 0) + 1;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-serif font-bold text-blue-950 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            <span>Pastoral Attendance & Growth Analytics Report</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive statistical summaries for church quarterly meetings and board reviews
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Print Pastoral Report</span>
        </button>
      </div>

      {/* Official Report Container */}
      <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/60 shadow-xl space-y-6">
        {/* Printable Official Header */}
        <div className="text-center border-b-2 border-blue-950 pb-5">
          <h2 className="text-xl sm:text-2xl font-serif font-black text-blue-950 uppercase">
            {branchSettings.churchName}
          </h2>
          <p className="text-xs font-serif font-bold text-amber-700 tracking-wider uppercase mt-0.5">
            {branchSettings.branchName} • MANKESSIM, CENTRAL REGION, GHANA
          </p>
          <p className="text-xs text-slate-500 italic mt-1">
            “Heaven Oo!!! Ɛho ɛna Yɛpɛ” • Founder: {branchSettings.spiritualLeader}
          </p>
          <div className="mt-3 inline-block bg-blue-950 text-amber-300 font-serif font-bold px-4 py-1 text-xs rounded-full uppercase tracking-wider">
            QUARTERLY ATTENDANCE AUDIT & GROWTH SUMMARY
          </div>
        </div>

        {/* Executive Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Services Held</span>
            <span className="text-2xl font-serif font-black text-blue-950 mt-1 block">{totalServices}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Cumulative Turnout</span>
            <span className="text-2xl font-serif font-black text-blue-950 mt-1 block">{totalAttendance}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Average Attendance</span>
            <span className="text-2xl font-serif font-black text-amber-600 mt-1 block">{avgAttendance}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total First-Timers</span>
            <span className="text-2xl font-serif font-black text-emerald-700 mt-1 block">{totalFirstTimers}</span>
          </div>
        </div>

        {/* Demographic Breakdown Table */}
        <div>
          <h3 className="font-serif font-bold text-sm text-blue-950 mb-3 uppercase tracking-wider">
            1. Congregation Demographic Aggregate Distribution
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Cumulative Count</th>
                  <th className="p-3 text-right">Proportion of Turnout</th>
                  <th className="p-3">Average Per Service</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-semibold text-slate-800">Women</td>
                  <td className="p-3 text-right font-mono font-bold text-pink-700">{totalWomen}</td>
                  <td className="p-3 text-right text-slate-600 font-mono">
                    {totalAttendance > 0 ? ((totalWomen / totalAttendance) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="p-3 text-slate-600 font-mono">
                    {totalServices > 0 ? (totalWomen / totalServices).toFixed(0) : 0} per Sunday
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800">Men</td>
                  <td className="p-3 text-right font-mono font-bold text-blue-800">{totalMen}</td>
                  <td className="p-3 text-right text-slate-600 font-mono">
                    {totalAttendance > 0 ? ((totalMen / totalAttendance) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="p-3 text-slate-600 font-mono">
                    {totalServices > 0 ? (totalMen / totalServices).toFixed(0) : 0} per Sunday
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800">Youth (15 - 35)</td>
                  <td className="p-3 text-right font-mono font-bold text-amber-700">{totalYouth}</td>
                  <td className="p-3 text-right text-slate-600 font-mono">
                    {totalAttendance > 0 ? ((totalYouth / totalAttendance) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="p-3 text-slate-600 font-mono">
                    {totalServices > 0 ? (totalYouth / totalServices).toFixed(0) : 0} per Sunday
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800">Children</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">{totalChildren}</td>
                  <td className="p-3 text-right text-slate-600 font-mono">
                    {totalAttendance > 0 ? ((totalChildren / totalAttendance) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="p-3 text-slate-600 font-mono">
                    {totalServices > 0 ? (totalChildren / totalServices).toFixed(0) : 0} per Sunday
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Roster Strength */}
        <div>
          <h3 className="font-serif font-bold text-sm text-blue-950 mb-3 uppercase tracking-wider">
            2. Departmental Workforce & Ministry Roster Strength
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(deptCounts).map(([dept, count]) => (
              <div key={dept} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800 truncate pr-2">{dept}</span>
                <span className="font-mono font-bold text-blue-950 bg-blue-100/70 px-2 py-0.5 rounded text-[11px]">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Certification Signoff */}
        <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-200 text-xs">
          <div className="border-t border-slate-400 pt-2 text-center">
            <p className="font-bold text-slate-900">Rev. Emmanuel Quayson</p>
            <p className="text-[11px] text-slate-500">Resident Pastor, Mankessim Central Branch</p>
          </div>
          <div className="border-t border-slate-400 pt-2 text-center">
            <p className="font-bold text-slate-900">Prophet Francis Kwarteng</p>
            <p className="text-[11px] text-slate-500">General Overseer & Spiritual Leader</p>
          </div>
        </div>
      </div>
    </div>
  );
};
