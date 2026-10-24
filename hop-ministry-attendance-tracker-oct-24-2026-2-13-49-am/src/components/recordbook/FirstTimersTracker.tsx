import React, { useState } from 'react';
import { useChurchData } from '../../context/ChurchDataContext';
import { FirstTimer } from '../../types/church';
import { UserCheck, Phone, CheckCircle, Clock, Calendar, Search } from 'lucide-react';
import { VoiceSearchBar } from '../common/VoiceSearchBar';

export const FirstTimersTracker: React.FC = () => {
  const { attendanceRecords, updateAttendanceRecord } = useChurchData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Aggregate all first-timers across all attendance sessions
  const allFirstTimers: { recordId: string; serviceDate: string; ft: FirstTimer }[] = [];
  attendanceRecords.forEach(record => {
    (record.firstTimersList || []).forEach(ft => {
      allFirstTimers.push({
        recordId: record.id,
        serviceDate: record.date,
        ft,
      });
    });
  });

  const filtered = allFirstTimers.filter(item => {
    const matchesSearch =
      item.ft.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ft.phone.includes(searchTerm) ||
      item.ft.residentialArea.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || item.ft.followUpStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (recordId: string, ftId: string, newStatus: FirstTimer['followUpStatus']) => {
    const targetRecord = attendanceRecords.find(r => r.id === recordId);
    if (!targetRecord) return;

    const updatedList = (targetRecord.firstTimersList || []).map(item => {
      if (item.id === ftId) {
        return { ...item, followUpStatus: newStatus };
      }
      return item;
    });

    updateAttendanceRecord(recordId, { firstTimersList: updatedList });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-blue-950 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-600" />
            <span>First-Timers & New Visitors Follow-Up Registry</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track pastoral visitation, follow-up calls, and assimilation of guest worshippers
          </p>
        </div>

        <div className="text-xs font-mono bg-blue-50/90 text-blue-900 border border-blue-200 px-3 py-1.5 rounded-lg font-semibold shadow-2xs">
          Total Visitors Logged: {allFirstTimers.length}
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <VoiceSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={setSearchTerm}
            placeholder="Search visitor by name, phone, area... 🎤 🔍"
            id="first-timers-voice-search"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-xs bg-white"
          >
            <option value="All">All Follow-up Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Called">Called / Telephoned</option>
            <option value="Visited">Home Visited</option>
            <option value="Integrated into Church">Integrated into Church</option>
            <option value="Not Interested">Not Interested</option>
          </select>
        </div>
      </div>

      {searchTerm.trim() && filtered.length > 0 && (
        <div className="bg-amber-50/95 border border-amber-200 px-4 py-2 rounded-xl flex items-center justify-between text-xs text-amber-950 font-medium shadow-sm">
          <span>Found {filtered.length} visitor record{filtered.length > 1 ? 's' : ''} matching "{searchTerm}"</span>
          <span className="text-[11px] text-amber-800">Select below to update follow-up status</span>
        </div>
      )}

      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-wide">
              NO MATCHING MEMBER FOUND
            </h3>
            <p className="text-xs text-slate-500 max-w-md">
              {searchTerm
                ? `No visitor records matched "${searchTerm}". You can try speaking or typing another name.`
                : 'No first-timer records found for the current follow-up filter.'}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-1 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(({ recordId, serviceDate, ft }) => (
              <div key={ft.id} className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900 text-sm">{ft.fullName}</h4>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {ft.gender} · {ft.ageGroup}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Service Date: {serviceDate}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 flex items-center gap-3">
                    <a href={`tel:${ft.phone}`} className="text-blue-700 font-mono flex items-center gap-1 font-medium hover:underline">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{ft.phone || 'No phone'}</span>
                    </a>
                    <span>· Area: <strong className="text-slate-800">{ft.residentialArea}</strong></span>
                    {ft.invitedBy && (
                      <span>· Invited by: <strong className="text-slate-800">{ft.invitedBy}</strong></span>
                    )}
                  </p>

                  {ft.prayerRequest && (
                    <p className="text-[11px] text-amber-900 bg-amber-50/80 px-2.5 py-1 rounded-md border border-amber-200/60 max-w-xl">
                      Prayer Point: <em>“{ft.prayerRequest}”</em>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs w-full md:w-auto justify-end">
                  <label className="text-[11px] text-slate-500 font-medium hidden sm:inline">Status:</label>
                  <select
                    value={ft.followUpStatus}
                    onChange={e => handleUpdateStatus(recordId, ft.id, e.target.value as FirstTimer['followUpStatus'])}
                    className="p-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Called">Called</option>
                    <option value="Visited">Home Visited</option>
                    <option value="Integrated into Church">Integrated into Church</option>
                    <option value="Not Interested">Not Interested</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
