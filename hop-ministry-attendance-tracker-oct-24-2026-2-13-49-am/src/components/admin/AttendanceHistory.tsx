import React, { useState } from 'react';
import { useChurchData } from '../../context/ChurchDataContext';
import { AttendanceRecord } from '../../types/church';
import { Calendar, Printer, Trash2, Eye, X, BookOpen, Clock, Users, Download, Check, CheckSquare, UserCheck, UserX, CheckCircle2, XCircle } from 'lucide-react';

export const AttendanceHistory: React.FC = () => {
  const { attendanceRecords, deleteAttendanceRecord, branchSettings, members } = useChurchData();
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = attendanceRecords.filter(r => {
    if (filterType === 'All') return true;
    return r.serviceType.includes(filterType);
  });

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteAttendanceRecord(deletingId);
    setDeletingId(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-blue-950 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <span>Service Attendance Registers Archive</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Historical logs of Sunday services, midweek revivals, and vigil gatherings
          </p>
        </div>

        <div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-xs font-medium bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            <option value="All">All Service Categories</option>
            <option value="Sunday 1st">Sunday 1st Service</option>
            <option value="Sunday 2nd">Sunday 2nd Service</option>
            <option value="Wednesday Midweek">Wednesday Midweek</option>
            <option value="Friday All-Night">Friday All-Night</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No attendance records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Service Type</th>
                  <th className="p-3.5">Sermon Topic</th>
                  <th className="p-3.5 text-center">Men</th>
                  <th className="p-3.5 text-center">Women</th>
                  <th className="p-3.5 text-center">Youth</th>
                  <th className="p-3.5 text-center">Children</th>
                  <th className="p-3.5 text-center">1st Timers</th>
                  <th className="p-3.5 text-center font-bold text-blue-950">Total</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {record.date}
                    </td>
                    <td className="p-3.5 text-slate-800 font-medium">
                      {record.serviceType}
                    </td>
                    <td className="p-3.5 text-slate-600 truncate max-w-xs" title={record.sermonTopic}>
                      {record.sermonTopic}
                    </td>
                    <td className="p-3.5 text-center text-slate-700">{record.headcounts?.men}</td>
                    <td className="p-3.5 text-center text-slate-700">{record.headcounts?.women}</td>
                    <td className="p-3.5 text-center text-slate-700">{record.headcounts?.youth}</td>
                    <td className="p-3.5 text-center text-slate-700">{record.headcounts?.children}</td>
                    <td className="p-3.5 text-center text-amber-700 font-bold">{record.headcounts?.firstTimers}</td>
                    <td className="p-3.5 text-center font-black text-blue-950 text-sm bg-blue-50/50">
                      {record.headcounts?.total}
                    </td>
                    <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="p-1.5 text-blue-700 hover:bg-blue-50 rounded"
                        title="View Detailed Sheet"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(record.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail & Print Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-none">
            {/* Modal Top Bar (hidden on print) */}
            <div className="bg-blue-900 text-white p-4 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-300" />
                <h3 className="font-serif font-bold text-sm">
                  Official Attendance Register Sheet
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-blue-950 rounded text-xs font-bold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sheet</span>
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-blue-200 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="p-6 text-xs text-slate-800 space-y-5">
              {/* Official Church Letterhead */}
              <div className="text-center border-b-2 border-blue-900 pb-4">
                <h2 className="font-serif font-black text-lg text-blue-950 uppercase tracking-wide">
                  {branchSettings.churchName}
                </h2>
                <p className="text-xs font-serif font-semibold text-amber-700 uppercase">
                  {branchSettings.branchName} • {branchSettings.location}
                </p>
                <p className="text-[11px] text-slate-500 italic mt-0.5">
                  “Heaven Oo!!! Ɛho ɛna Yɛpɛ” • Founder: {branchSettings.spiritualLeader}
                </p>
                <div className="mt-2 inline-block bg-blue-950 text-white font-mono px-3 py-1 text-xs font-bold uppercase rounded">
                  SERVICE ATTENDANCE CERTIFICATION SHEET
                </div>
              </div>

              {/* Service Details Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-white print:border-slate-300">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Service Date & Time</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedRecord.date}</span>
                  <span className="text-slate-500 block text-[11px]">{selectedRecord.startTime} - {selectedRecord.endTime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Service Classification</span>
                  <span className="font-bold text-slate-900">{selectedRecord.serviceType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Presiding Minister</span>
                  <span className="font-medium text-slate-800">{selectedRecord.presidingMinister}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Preacher / Speaker</span>
                  <span className="font-medium text-slate-800">{selectedRecord.preacher}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sermon Topic & Scriptures</span>
                  <span className="font-serif font-bold text-blue-950 text-sm block">{selectedRecord.sermonTopic}</span>
                  <span className="text-slate-600 italic">{selectedRecord.bibleReference}</span>
                </div>
              </div>

              {/* Verified Count Table */}
              <div>
                <h4 className="font-bold text-xs uppercase text-slate-700 tracking-wider mb-2">
                  Certified Congregation Attendance Headcount
                </h4>
                <div className="grid grid-cols-5 text-center border border-slate-300 rounded-lg overflow-hidden">
                  <div className="p-3 border-r border-slate-300 bg-slate-50">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Men</span>
                    <span className="text-base font-bold text-slate-900">{selectedRecord.headcounts?.men}</span>
                  </div>
                  <div className="p-3 border-r border-slate-300 bg-slate-50">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Women</span>
                    <span className="text-base font-bold text-slate-900">{selectedRecord.headcounts?.women}</span>
                  </div>
                  <div className="p-3 border-r border-slate-300 bg-slate-50">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Youth</span>
                    <span className="text-base font-bold text-slate-900">{selectedRecord.headcounts?.youth}</span>
                  </div>
                  <div className="p-3 border-r border-slate-300 bg-slate-50">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Children</span>
                    <span className="text-base font-bold text-slate-900">{selectedRecord.headcounts?.children}</span>
                  </div>
                  <div className="p-3 bg-amber-500/10">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">Total</span>
                    <span className="text-lg font-black text-blue-950">{selectedRecord.headcounts?.total}</span>
                  </div>
                </div>
              </div>

              {/* Member Roll Call Register (Present vs Absent) */}
              {(() => {
                const statusMap = selectedRecord.memberAttendanceStatus || {};
                const rollCallIds = selectedRecord.rollCallMemberIds || [];
                const hasStatusMap = Object.keys(statusMap).length > 0;
                const hasRollCall = hasStatusMap || rollCallIds.length > 0;

                const presentList = members.filter(m => {
                  if (hasStatusMap) return statusMap[m.id] === 'present';
                  return rollCallIds.includes(m.id);
                });

                const absentList = members.filter(m => {
                  if (hasStatusMap) return statusMap[m.id] === 'absent';
                  return false;
                });

                return (
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-900" />
                        <span>Registered Member Roll-Call Attendance</span>
                      </h4>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {presentList.length} Present
                        </span>
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          {absentList.length} Absent
                        </span>
                      </div>
                    </div>

                    {!hasRollCall ? (
                      <p className="text-xs text-slate-500 italic py-1">
                        General headcount recorded. No individual member roll-call entries saved for this session.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs max-h-56 overflow-y-auto pr-1">
                        {/* Present Column */}
                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 space-y-1.5">
                          <div className="font-bold text-[11px] uppercase tracking-wider text-emerald-900 flex items-center gap-1 pb-1 border-b border-emerald-200">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Present Members ({presentList.length})</span>
                          </div>
                          {presentList.length === 0 ? (
                            <p className="text-slate-400 italic text-[11px]">No members marked present</p>
                          ) : (
                            <ul className="space-y-1">
                              {presentList.map(m => (
                                <li key={m.id} className="flex justify-between items-center text-slate-800 font-medium bg-white/70 px-2 py-1 rounded">
                                  <span>{m.fullName}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">{m.memberCode}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Absent Column */}
                        <div className="bg-rose-50/70 border border-rose-200 rounded-lg p-2.5 space-y-1.5">
                          <div className="font-bold text-[11px] uppercase tracking-wider text-rose-900 flex items-center gap-1 pb-1 border-b border-rose-200">
                            <UserX className="w-3.5 h-3.5 text-rose-600" />
                            <span>Absent Members ({absentList.length})</span>
                          </div>
                          {absentList.length === 0 ? (
                            <p className="text-slate-400 italic text-[11px]">No members marked absent</p>
                          ) : (
                            <ul className="space-y-1">
                              {absentList.map(m => (
                                <li key={m.id} className="flex justify-between items-center text-slate-800 font-medium bg-white/70 px-2 py-1 rounded">
                                  <span>{m.fullName}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">{m.memberCode}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* First-timers noted */}
              {(selectedRecord.firstTimersList || []).length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase text-slate-700 tracking-wider mb-1">
                    First-Time Visitors Logged ({(selectedRecord.firstTimersList || []).length})
                  </h4>
                  <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                    {selectedRecord.firstTimersList.map(ft => (
                      <li key={ft.id} className="p-2 flex justify-between">
                        <span className="font-semibold text-slate-800">{ft.fullName} ({ft.phone || 'No phone'})</span>
                        <span className="text-slate-500">{ft.residentialArea} · Status: {ft.followUpStatus}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300">
                <div className="border-t border-dashed border-slate-400 pt-1 text-center">
                  <p className="font-bold text-slate-800">{selectedRecord.recordedBy}</p>
                  <p className="text-[10px] text-slate-500">Recording Usher / Church Clerk Signature</p>
                </div>
                <div className="border-t border-dashed border-slate-400 pt-1 text-center">
                  <p className="font-bold text-slate-800">{selectedRecord.verifiedBy || branchSettings.pastorInCharge}</p>
                  <p className="text-[10px] text-slate-500">Resident Pastor / Overseer Counter-Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full text-center space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Delete Attendance Session?</h3>
            <p className="text-xs text-slate-600">This will remove this service record from your local church register.</p>
            <div className="flex justify-center gap-2 pt-2">
              <button onClick={() => setDeletingId(null)} className="px-3 py-1.5 border rounded text-xs font-semibold">Cancel</button>
              <button onClick={handleDelete} className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
