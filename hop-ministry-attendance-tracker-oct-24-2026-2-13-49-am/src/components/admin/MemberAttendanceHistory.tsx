/**
 * House of Power Ministry International Church, Mankessim, Ghana
 * Feature: MEMBERS' ATTENDANCE HISTORY
 * 
 * Allows the administrator to inspect any registered church member's
 * complete Sunday attendance profile, fidelity rating, and chronological record.
 */

import React, { useState, useMemo } from 'react';
import { useChurchData } from '../../context/ChurchDataContext';
import { Member, AttendanceRecord } from '../../types/church';
import {
  Users,
  Search,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Phone,
  Printer,
  ChevronRight,
  AlertCircle,
  Check,
  X,
  Edit3,
  Shield,
  FileSpreadsheet,
  TrendingUp,
  Percent
} from 'lucide-react';
import { VoiceSearchBar } from '../common/VoiceSearchBar';
import { MemberPhoneActionModal } from '../common/MemberPhoneActionModal';

interface MemberAttendanceHistoryProps {
  initialMemberId?: string | null;
  onClose?: () => void;
}

export const MemberAttendanceHistory: React.FC<MemberAttendanceHistoryProps> = ({
  initialMemberId = null,
}) => {
  const { members, attendanceRecords, updateAttendanceRecord, branchSettings } = useChurchData();

  // Navigation state: either member list or selected member profile
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(initialMemberId);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');

  // Phone action modal
  const [phoneModalData, setPhoneModalData] = useState<{
    isOpen: boolean;
    phone: string;
    name?: string;
    code?: string;
    department?: string;
  }>({
    isOpen: false,
    phone: '',
  });

  // Correction confirmation modal state
  const [correctionTarget, setCorrectionTarget] = useState<{
    recordId: string;
    memberId: string;
    memberName: string;
    date: string;
    serviceType: string;
    currentStatus: 'present' | 'absent';
    newStatus: 'present' | 'absent';
  } | null>(null);

  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Helper: Format date as "18 October 2026"
  const formatSundayDate = (dateString: string): string => {
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const dateObj = new Date(year, monthIndex, day);
        return dateObj.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Helper: Get member attendance status for a specific Sunday record
  const getMemberStatusForRecord = (record: AttendanceRecord, memberId: string): 'present' | 'absent' | null => {
    // 1. Check explicit memberAttendanceStatus mapping
    if (record.memberAttendanceStatus && record.memberAttendanceStatus[memberId]) {
      return record.memberAttendanceStatus[memberId];
    }
    // 2. Check rollCallMemberIds list
    if (record.rollCallMemberIds && record.rollCallMemberIds.includes(memberId)) {
      return 'present';
    }
    // 3. If the record has roll-call data but this member wasn't present, check if member was recorded as absent
    if (record.memberAttendanceStatus && Object.keys(record.memberAttendanceStatus).length > 0) {
      return record.memberAttendanceStatus[memberId] || 'absent';
    }
    return null;
  };

  // Calculate stats for any member
  const getMemberAttendanceStats = (memberId: string) => {
    let totalSundaysRecorded = 0;
    let totalPresent = 0;
    let totalAbsent = 0;

    const sessionHistory: {
      record: AttendanceRecord;
      status: 'present' | 'absent';
      dateFormatted: string;
    }[] = [];

    // Sort attendance sessions by date descending (newest first)
    const sortedRecords = [...attendanceRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sortedRecords.forEach(record => {
      const status = getMemberStatusForRecord(record, memberId);
      if (status) {
        totalSundaysRecorded += 1;
        if (status === 'present') {
          totalPresent += 1;
        } else {
          totalAbsent += 1;
        }
        sessionHistory.push({
          record,
          status,
          dateFormatted: formatSundayDate(record.date),
        });
      }
    });

    const attendancePercentage =
      totalSundaysRecorded > 0 ? Math.round((totalPresent / totalSundaysRecorded) * 100) : 0;

    return {
      totalSundaysRecorded,
      totalPresent,
      totalAbsent,
      attendancePercentage,
      sessionHistory,
    };
  };

  // Filter members for searchable list
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch =
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm) ||
        (member.whatsappPhone && member.whatsappPhone.includes(searchTerm));

      const matchesDepartment =
        departmentFilter === 'All' || member.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [members, searchTerm, departmentFilter]);

  // Selected member object & computed statistics
  const selectedMember = useMemo(() => {
    if (!selectedMemberId) return null;
    return members.find(m => m.id === selectedMemberId) || null;
  }, [members, selectedMemberId]);

  const selectedMemberStats = useMemo(() => {
    if (!selectedMember) return null;
    return getMemberAttendanceStats(selectedMember.id);
  }, [selectedMember, attendanceRecords]);

  // Handle Controlled Correction
  const handleExecuteCorrection = async () => {
    if (!correctionTarget) return;

    try {
      const session = attendanceRecords.find(r => r.id === correctionTarget.recordId);
      if (!session) {
        setFeedbackMessage({
          type: 'error',
          text: 'Attendance session record could not be found.',
        });
        setCorrectionTarget(null);
        return;
      }

      const existingStatusMap = session.memberAttendanceStatus || {};
      const newStatusMap: Record<string, 'present' | 'absent'> = {
        ...existingStatusMap,
        [correctionTarget.memberId]: correctionTarget.newStatus,
      };

      let newRollCallIds = session.rollCallMemberIds ? [...session.rollCallMemberIds] : [];
      if (correctionTarget.newStatus === 'present') {
        if (!newRollCallIds.includes(correctionTarget.memberId)) {
          newRollCallIds.push(correctionTarget.memberId);
        }
      } else {
        newRollCallIds = newRollCallIds.filter(id => id !== correctionTarget.memberId);
      }

      await updateAttendanceRecord(session.id, {
        memberAttendanceStatus: newStatusMap,
        rollCallMemberIds: newRollCallIds,
      });

      setFeedbackMessage({
        type: 'success',
        text: `ATTENDANCE CORRECTED: ${correctionTarget.memberName}'s status on ${formatSundayDate(
          correctionTarget.date
        )} was updated to ${correctionTarget.newStatus.toUpperCase()}.`,
      });

      setCorrectionTarget(null);
      setTimeout(() => setFeedbackMessage(null), 6000);
    } catch {
      setFeedbackMessage({
        type: 'error',
        text: 'Failed to update attendance record. Please try again.',
      });
      setCorrectionTarget(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // =========================================================================
  // VIEW: INDIVIDUAL MEMBER ATTENDANCE PROFILE
  // =========================================================================
  if (selectedMember && selectedMemberStats) {
    const { totalSundaysRecorded, totalPresent, totalAbsent, attendancePercentage, sessionHistory } =
      selectedMemberStats;

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Top Profile Header Bar */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedMemberId(null)}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 bg-blue-900/10 hover:bg-blue-900/20 text-blue-950 font-bold text-xs rounded-xl border border-blue-900/30 transition-all cursor-pointer"
              title="Return to Members' Attendance List"
            >
              <ArrowLeft className="w-4 h-4 text-amber-600 stroke-[2.5]" />
              <span>BACK TO MEMBERS' LIST</span>
            </button>

            <div>
              <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-widest block">
                Member Profile Archive
              </span>
              <h2 className="text-xl font-serif font-black text-blue-950 leading-tight">
                {selectedMember.fullName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              title="Print Certified Member Attendance Statement"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Record</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedbackMessage && (
          <div
            role="alert"
            className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 shadow-md border ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="font-semibold">{feedbackMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Member Biographical Card */}
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 bg-blue-900 text-amber-300 rounded-lg text-xs font-mono font-bold">
                  {selectedMember.memberCode}
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                  {selectedMember.department}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    selectedMember.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {selectedMember.status} Member
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-blue-950 pt-1">
                {selectedMember.fullName}
              </h3>
              <p className="text-xs text-slate-500">
                Residence: {selectedMember.residentialAddress || 'Mankessim, Ghana'}
              </p>
            </div>

            {/* Interactive Phone Link (CALL / SMS / WHATSAPP) */}
            <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200/80 flex flex-col items-start sm:items-end gap-1">
              <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">
                Telephone & WhatsApp
              </span>
              <button
                type="button"
                onClick={() =>
                  setPhoneModalData({
                    isOpen: true,
                    phone: selectedMember.phone,
                    name: selectedMember.fullName,
                    code: selectedMember.memberCode,
                    department: selectedMember.department,
                  })
                }
                className="inline-flex items-center gap-1.5 font-mono text-sm font-bold text-blue-950 hover:text-blue-800 hover:underline cursor-pointer"
                title="Tap to Call, SMS, or WhatsApp this member"
              >
                <Phone className="w-3.5 h-3.5 text-amber-600" />
                <span>{selectedMember.phone}</span>
              </button>
              <span className="text-[10px] text-blue-600 italic">
                Tap number for CALL, SMS or WHATSAPP
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Registration Date
              </span>
              <span className="font-semibold text-slate-800">
                {selectedMember.dateJoined ? formatSundayDate(selectedMember.dateJoined) : 'Not recorded'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Gender / Age
              </span>
              <span className="font-semibold text-slate-800">
                {selectedMember.gender} • {selectedMember.ageGroup}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Baptism Status
              </span>
              <span className="font-semibold text-slate-800">
                {selectedMember.baptismStatus || 'Baptized'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Emergency Contact
              </span>
              <span className="font-semibold text-slate-800">
                {selectedMember.emergencyContactName || 'None'} ({selectedMember.emergencyContactPhone || '—'})
              </span>
            </div>
          </div>
        </div>

        {/* 4 Attendance Calculations KPI Cards (Accurate Mathematical Summary) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Sundays Recorded */}
          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Sundays Recorded
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-800" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-serif font-black text-slate-900 mt-2">
              {totalSundaysRecorded}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Logged Sunday services on record
            </p>
          </div>

          {/* 2. Total Sundays Marked PRESENT */}
          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-emerald-200 shadow-xl bg-gradient-to-br from-emerald-50/40 to-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Total Present
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-serif font-black text-emerald-700 mt-2">
              {totalPresent}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              Sundays marked in attendance
            </p>
          </div>

          {/* 3. Total Sundays Marked ABSENT */}
          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-rose-200 shadow-xl bg-gradient-to-br from-rose-50/40 to-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                Total Absent
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-rose-700" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-serif font-black text-rose-700 mt-2">
              {totalAbsent}
            </p>
            <p className="text-[11px] text-rose-600 font-medium mt-1">
              Recorded Sunday absences
            </p>
          </div>

          {/* 4. Attendance Fidelity Percentage */}
          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-amber-300 shadow-xl bg-gradient-to-br from-amber-50/40 to-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Attendance Fidelity
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Percent className="w-4 h-4 text-amber-700" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-serif font-black text-amber-600 mt-2">
              {totalSundaysRecorded > 0 ? `${attendancePercentage}%` : '0%'}
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  attendancePercentage >= 80
                    ? 'bg-emerald-500'
                    : attendancePercentage >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${attendancePercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">
              {totalSundaysRecorded === 0
                ? 'Not yet available'
                : attendancePercentage >= 80
                ? 'Faithful Attendance'
                : attendancePercentage >= 50
                ? 'Regular Turnout'
                : 'Follow-up Recommended'}
            </p>
          </div>
        </div>

        {/* Chronological Attendance History Table */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-base text-blue-950 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Sunday Service Attendance Register (Chronological)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Newest Sunday service sessions displayed first with certified attendance verification
              </p>
            </div>

            <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-900 rounded-full border border-blue-200">
              {sessionHistory.length} Session{sessionHistory.length === 1 ? '' : 's'} on Record
            </span>
          </div>

          {sessionHistory.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800 text-sm tracking-wider uppercase">
                NO ATTENDANCE HISTORY AVAILABLE FOR THIS MEMBER.
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No recorded Sunday attendance sessions currently match this member in the database. When an administrator records Sunday attendance, the member's profile updates automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto table-responsive-container">
              <table className="w-full text-left text-xs">
                <thead className="bg-blue-950 text-white text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Sunday Service Date</th>
                    <th className="p-3.5">Service</th>
                    <th className="p-3.5 text-center">Attendance Status</th>
                    <th className="p-3.5">Sermon Topic &amp; Preacher</th>
                    <th className="p-3.5 text-right">Register Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessionHistory.map(({ record, status, dateFormatted }) => {
                    const isPresent = status === 'present';
                    const isAbsent = status === 'absent';

                    return (
                      <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Sunday Service Date */}
                        <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                          <span className="font-serif text-sm block">{dateFormatted}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{record.date}</span>
                        </td>

                        {/* Service Type */}
                        <td className="p-3.5 text-slate-700 whitespace-nowrap">
                          <span className="font-semibold block">Sunday Service</span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                            {record.serviceType.replace('Sunday 1st Service', '1st Service').replace('Sunday 2nd Service', '2nd Service')}
                          </span>
                        </td>

                        {/* Attendance Status: PRESENT (Green) or ABSENT (Red) */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          {isPresent ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border-2 border-emerald-300 shadow-2xs">
                              <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                              <span>PRESENT</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 border-2 border-rose-300 shadow-2xs">
                              <X className="w-3.5 h-3.5 text-rose-700 stroke-[3]" />
                              <span>ABSENT</span>
                            </span>
                          )}
                        </td>

                        {/* Sermon Theme & Preacher */}
                        <td className="p-3.5 text-slate-600 max-w-sm">
                          <p className="font-serif font-bold text-blue-950 truncate">
                            {record.sermonTopic || 'Sunday Exhortation & Communion'}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            Preacher: {record.preacher || 'Rev. Emmanuel Quayson'}
                          </p>
                        </td>

                        {/* Controlled Correction Button */}
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              setCorrectionTarget({
                                recordId: record.id,
                                memberId: selectedMember.id,
                                memberName: selectedMember.fullName,
                                date: record.date,
                                serviceType: record.serviceType,
                                currentStatus: status,
                                newStatus: isPresent ? 'absent' : 'present',
                              })
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-900 hover:text-white bg-blue-50 hover:bg-blue-900 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                            title="Controlled correction for this Sunday service record"
                          >
                            <Edit3 className="w-3 h-3 text-amber-600" />
                            <span>Correct Status</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Controlled Correction Confirmation Modal */}
        {correctionTarget && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-blue-950">
                    Correct Attendance Status
                  </h4>
                  <p className="text-xs text-slate-500">
                    Controlled update of certified Sunday register
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Member:</span>
                  <span className="font-bold text-slate-900">{correctionTarget.memberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sunday Date:</span>
                  <span className="font-bold text-slate-900">
                    {formatSundayDate(correctionTarget.date)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Change Status:</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        correctionTarget.currentStatus === 'present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {correctionTarget.currentStatus.toUpperCase()}
                    </span>
                    <span className="text-slate-400">➔</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        correctionTarget.newStatus === 'present'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {correctionTarget.newStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                This modification will update the official historical attendance record for this Sunday session and immediately adjust the member's calculated fidelity percentage.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCorrectionTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteCorrection}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Confirm &amp; Update Record
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phone Action Modal */}
        <MemberPhoneActionModal
          isOpen={phoneModalData.isOpen}
          phone={phoneModalData.phone}
          memberName={phoneModalData.name}
          memberCode={phoneModalData.code}
          department={phoneModalData.department}
          onClose={() => setPhoneModalData(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW: SEARCHABLE LIST OF ALL REGISTERED MEMBERS
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Title & Info Banner */}
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-widest block">
            Executive Pastoral Management
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-blue-950 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-600" />
            <span>MEMBERS' ATTENDANCE HISTORY</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select any registered church member to inspect their complete Sunday-by-Sunday attendance record
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-blue-900 text-amber-300 rounded-xl text-xs font-bold font-mono shadow-xs">
            {members.length} Enrolled Members
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input with voice support */}
        <div className="w-full md:flex-1">
          <VoiceSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={setSearchTerm}
            placeholder="Search member by full name, code, or phone number... 🎤 🔍"
            id="members-history-search"
          />
        </div>

        {/* Department Filter */}
        <div className="w-full md:w-64">
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="All">All Departments &amp; Ministries</option>
            {branchSettings.departments.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Members Attendance History Table / Grid */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">NO MATCHING MEMBERS FOUND</p>
            <p className="text-xs text-slate-500">
              No registered members match your search criteria. Please adjust your query.
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-2 px-3.5 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-semibold"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto table-responsive-container">
            <table className="w-full text-left text-xs">
              <thead className="bg-blue-950 text-white text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Member Name</th>
                  <th className="p-3.5">Phone Number</th>
                  <th className="p-3.5">Ministry / Dept</th>
                  <th className="p-3.5 text-center">Sundays Logged</th>
                  <th className="p-3.5 text-center">Present / Absent</th>
                  <th className="p-3.5 text-center">Attendance %</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map(member => {
                  const stats = getMemberAttendanceStats(member.id);
                  const isHighTurnout = stats.attendancePercentage >= 80;

                  return (
                    <tr
                      key={member.id}
                      onClick={() => setSelectedMemberId(member.id)}
                      className="hover:bg-amber-50/50 transition-colors cursor-pointer group"
                    >
                      {/* Code */}
                      <td className="p-3.5 font-mono text-[11px] font-bold text-blue-950 whitespace-nowrap">
                        <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {member.memberCode}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900 text-sm group-hover:text-blue-900 transition-colors">
                          {member.fullName}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Joined {formatSundayDate(member.dateJoined)}
                        </span>
                      </td>

                      {/* Phone Number (Interactive Call/SMS/WhatsApp) */}
                      <td
                        className="p-3.5 whitespace-nowrap"
                        onClick={e => {
                          e.stopPropagation();
                          setPhoneModalData({
                            isOpen: true,
                            phone: member.phone,
                            name: member.fullName,
                            code: member.memberCode,
                            department: member.department,
                          });
                        }}
                      >
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 font-mono text-blue-700 hover:text-blue-900 font-bold hover:underline"
                          title="Tap to Call, SMS, or WhatsApp this member"
                        >
                          <Phone className="w-3 h-3 text-amber-600" />
                          <span>{member.phone}</span>
                        </button>
                      </td>

                      {/* Department */}
                      <td className="p-3.5 text-slate-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                          {member.department}
                        </span>
                      </td>

                      {/* Total Sundays Logged */}
                      <td className="p-3.5 text-center font-bold text-slate-800 whitespace-nowrap">
                        {stats.totalSundaysRecorded}
                      </td>

                      {/* Present / Absent counts */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold mr-2">
                          <Check className="w-3 h-3 stroke-[3]" />
                          {stats.totalPresent}
                        </span>
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                          <X className="w-3 h-3 stroke-[3]" />
                          {stats.totalAbsent}
                        </span>
                      </td>

                      {/* Attendance Percentage */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black ${
                            stats.totalSundaysRecorded === 0
                              ? 'bg-slate-100 text-slate-500'
                              : isHighTurnout
                              ? 'bg-emerald-100 text-emerald-800'
                              : stats.attendancePercentage >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {stats.totalSundaysRecorded > 0 ? `${stats.attendancePercentage}%` : '0%'}
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedMemberId(member.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-900 group-hover:bg-amber-500 group-hover:text-blue-950 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                        >
                          <span>View Profile</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Phone Action Modal */}
      <MemberPhoneActionModal
        isOpen={phoneModalData.isOpen}
        phone={phoneModalData.phone}
        memberName={phoneModalData.name}
        memberCode={phoneModalData.code}
        department={phoneModalData.department}
        onClose={() => setPhoneModalData(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
