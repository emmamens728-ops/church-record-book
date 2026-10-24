import React, { useState, useEffect, useCallback } from 'react';
import { useChurchData } from '../../context/ChurchDataContext';
import { useNavigation } from '../../context/NavigationContext';
import { ServiceType, AttendanceRecord, FirstTimer, Gender, AgeGroup } from '../../types/church';
import { Users, UserPlus, CheckSquare, Square, Save, Calendar, Clock, BookOpen, AlertCircle, CheckCircle2, Plus, Trash2, Check, X, Phone, UserCheck, UserX, RotateCcw } from 'lucide-react';
import { VoiceSearchBar } from '../common/VoiceSearchBar';
import { MemberPhoneActionModal } from '../common/MemberPhoneActionModal';

export const SundayAttendance: React.FC = () => {
  const { members, branchSettings, addAttendanceRecord } = useChurchData();
  const { currentView } = useNavigation();

  // Form state
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [serviceType, setServiceType] = useState<ServiceType>('Sunday 1st Service (Breakthrough Service)');
  const [startTime, setStartTime] = useState('06:30 AM');
  const [endTime, setEndTime] = useState('09:30 AM');
  const [presidingMinister, setPresidingMinister] = useState('Rev. Emmanuel Quayson');
  const [preacher, setPreacher] = useState('Rev. Emmanuel Quayson');
  const [sermonTopic, setSermonTopic] = useState('');
  const [bibleReference, setBibleReference] = useState('');
  const [recordedBy, setRecordedBy] = useState('Deaconess Akosua Baidoo (Ushering Head)');
  const [notes, setNotes] = useState('');

  // Headcounts
  const [menCount, setMenCount] = useState<number>(0);
  const [womenCount, setWomenCount] = useState<number>(0);
  const [youthCount, setYouthCount] = useState<number>(0);
  const [childrenCount, setChildrenCount] = useState<number>(0);

  // Individual Member Attendance Roster Statuses (Present / Absent)
  // Strictly temporary working selections that reset when leaving the page
  const [memberStatusMap, setMemberStatusMap] = useState<Record<string, 'present' | 'absent'>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Explicit reset function for working attendance selections
  const resetWorkingAttendanceSelections = useCallback(() => {
    setMemberStatusMap({});
  }, []);

  // Phone communication modal state
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

  // First-timers entered during this service
  const [firstTimers, setFirstTimers] = useState<Omit<FirstTimer, 'id'>[]>([]);
  const [newFtName, setNewFtName] = useState('');
  const [newFtPhone, setNewFtPhone] = useState('');
  const [newFtArea, setNewFtArea] = useState('');
  const [newFtGender, setNewFtGender] = useState<Gender>('Female');
  const [newFtAge, setNewFtAge] = useState<AgeGroup>('Youth');
  const [newFtRequest, setNewFtRequest] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Clear any legacy session storage that contained roster selections
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('hop_sunday_attendance_draft');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.sermonTopic) setSermonTopic(d.sermonTopic);
        if (d.bibleReference) setBibleReference(d.bibleReference);
        if (d.notes) setNotes(d.notes);
        if (typeof d.menCount === 'number') setMenCount(d.menCount);
        if (typeof d.womenCount === 'number') setWomenCount(d.womenCount);
        if (typeof d.youthCount === 'number') setYouthCount(d.youthCount);
        if (typeof d.childrenCount === 'number') setChildrenCount(d.childrenCount);
        // Note: memberStatusMap is intentionally NEVER restored.
        // PRESENT and ABSENT selections are temporary working selections that reset.
      }
    } catch {
      // ignore
    }
  }, []);

  // Save textual sermon/headcount draft while strictly excluding temporary roster selections
  useEffect(() => {
    try {
      const draft = {
        sermonTopic,
        bibleReference,
        notes,
        menCount,
        womenCount,
        youthCount,
        childrenCount,
      };
      if (sermonTopic || notes || menCount > 0 || womenCount > 0) {
        sessionStorage.setItem('hop_sunday_attendance_draft', JSON.stringify(draft));
      }
    } catch {
      // ignore
    }
  }, [sermonTopic, bibleReference, notes, menCount, womenCount, youthCount, childrenCount]);

  // Priority 1 Rule: When leaving the attendance recording page (via route change, view change,
  // browser back/forward buttons, or component unmounting), reset all working selections immediately.
  useEffect(() => {
    if (currentView !== 'recordbook') {
      resetWorkingAttendanceSelections();
    }
  }, [currentView, resetWorkingAttendanceSelections]);

  useEffect(() => {
    return () => {
      resetWorkingAttendanceSelections();
    };
  }, [resetWorkingAttendanceSelections]);

  useEffect(() => {
    const handleLeave = () => {
      resetWorkingAttendanceSelections();
    };
    window.addEventListener('popstate', handleLeave);
    window.addEventListener('hashchange', handleLeave);
    window.addEventListener('pagehide', handleLeave);
    return () => {
      window.removeEventListener('popstate', handleLeave);
      window.removeEventListener('hashchange', handleLeave);
      window.removeEventListener('pagehide', handleLeave);
    };
  }, [resetWorkingAttendanceSelections]);

  // Present / Absent Status Handlers (Mutually Exclusive per member)
  const handleSelectPresent = (memberId: string) => {
    setMemberStatusMap(prev => ({
      ...prev,
      [memberId]: 'present',
    }));
  };

  const handleSelectAbsent = (memberId: string) => {
    setMemberStatusMap(prev => ({
      ...prev,
      [memberId]: 'absent',
    }));
  };

  const handleToggleStatus = (memberId: string, status: 'present' | 'absent') => {
    setMemberStatusMap(prev => {
      // If clicking currently active status, reset to unselected; otherwise switch to target status
      if (prev[memberId] === status) {
        const next = { ...prev };
        delete next[memberId];
        return next;
      }
      return {
        ...prev,
        [memberId]: status,
      };
    });
  };

  const handleMarkAllFilteredPresent = () => {
    setMemberStatusMap(prev => {
      const next = { ...prev };
      filteredMembers.forEach(m => {
        next[m.id] = 'present';
      });
      return next;
    });
  };

  const handleMarkAllFilteredAbsent = () => {
    setMemberStatusMap(prev => {
      const next = { ...prev };
      filteredMembers.forEach(m => {
        next[m.id] = 'absent';
      });
      return next;
    });
  };

  const handleClearAllRosterSelections = () => {
    setMemberStatusMap({});
  };

  const handleAddFirstTimer = () => {
    if (!newFtName.trim()) {
      alert('Please enter visitor full name.');
      return;
    }
    const ft: Omit<FirstTimer, 'id'> = {
      fullName: newFtName.trim(),
      gender: newFtGender,
      ageGroup: newFtAge,
      phone: newFtPhone.trim(),
      residentialArea: newFtArea.trim() || 'Mankessim',
      prayerRequest: newFtRequest.trim(),
      followUpStatus: 'Pending',
      dateVisited: date,
    };
    setFirstTimers(prev => [...prev, ft]);
    setNewFtName('');
    setNewFtPhone('');
    setNewFtArea('');
    setNewFtRequest('');
  };

  const handleRemoveFirstTimer = (index: number) => {
    setFirstTimers(prev => prev.filter((_, i) => i !== index));
  };

  const totalHeadcount = menCount + womenCount + youthCount + childrenCount + firstTimers.length;

  const filteredMembers = members.filter(m =>
    m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentMembersList = Object.entries(memberStatusMap)
    .filter(([_, s]) => s === 'present')
    .map(([id]) => id);

  const absentMembersList = Object.entries(memberStatusMap)
    .filter(([_, s]) => s === 'absent')
    .map(([id]) => id);

  const totalMarkedCount = presentMembersList.length + absentMembersList.length;

  // Category Breakdown Calculations (Derived strictly from real database records and live working selections)
  const maleMembers = members.filter(m => m.gender === 'Male');
  const malePresent = maleMembers.filter(m => memberStatusMap[m.id] === 'present').length;
  const maleAbsent = maleMembers.filter(m => memberStatusMap[m.id] === 'absent').length;
  const malePending = maleMembers.length - malePresent - maleAbsent;

  const femaleMembers = members.filter(m => m.gender === 'Female');
  const femalePresent = femaleMembers.filter(m => memberStatusMap[m.id] === 'present').length;
  const femaleAbsent = femaleMembers.filter(m => memberStatusMap[m.id] === 'absent').length;
  const femalePending = femaleMembers.length - femalePresent - femaleAbsent;

  const childrenMembers = members.filter(m => m.ageCategory === 'Child' || m.ageGroup === 'Child');
  const childrenPresent = childrenMembers.filter(m => memberStatusMap[m.id] === 'present').length;
  const childrenAbsent = childrenMembers.filter(m => memberStatusMap[m.id] === 'absent').length;
  const childrenPending = childrenMembers.length - childrenPresent - childrenAbsent;

  const adultMembers = members.filter(m => (m.ageCategory === 'Adult' || !m.ageCategory) && m.ageGroup !== 'Child');
  const adultPresent = adultMembers.filter(m => memberStatusMap[m.id] === 'present').length;
  const adultAbsent = adultMembers.filter(m => memberStatusMap[m.id] === 'absent').length;
  const adultPending = adultMembers.length - adultPresent - adultAbsent;

  const totalRegisteredCount = members.length;
  const totalPresentCount = presentMembersList.length;
  const totalAbsentCount = absentMembersList.length;
  const totalPendingCount = totalRegisteredCount - totalPresentCount - totalAbsentCount;

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!sermonTopic.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter the sermon topic or theme for this Sunday service.' });
      return;
    }

    if (totalHeadcount === 0 && totalMarkedCount === 0) {
      setStatusMessage({ type: 'error', text: 'Please select PRESENT or ABSENT for registered members, or enter congregation headcounts.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedFirstTimers: FirstTimer[] = firstTimers.map((ft, idx) => ({
        ...ft,
        id: `ft-${Date.now()}-${idx}`,
      }));

      await addAttendanceRecord({
        date,
        serviceType,
        startTime,
        endTime,
        presidingMinister,
        preacher,
        sermonTopic,
        bibleReference,
        headcounts: {
          men: menCount,
          women: womenCount,
          youth: youthCount,
          children: childrenCount,
          firstTimers: firstTimers.length,
          total: totalHeadcount,
        },
        rollCallMemberIds: presentMembersList,
        memberAttendanceStatus: memberStatusMap,
        firstTimersList: formattedFirstTimers,
        recordedBy,
        notes,
      });

      setStatusMessage({
        type: 'success',
        text: `ATTENDANCE SUBMITTED SUCCESSFULLY! Record saved for Sunday Service on ${date} (${presentMembersList.length} Present, ${absentMembersList.length} Absent).`,
      });

      // Reset session form while preserving historical records
      setMenCount(0);
      setWomenCount(0);
      setYouthCount(0);
      setChildrenCount(0);
      setMemberStatusMap({});
      setFirstTimers([]);
      setSermonTopic('');
      setBibleReference('');
      setNotes('');
      try {
        sessionStorage.removeItem('hop_sunday_attendance_draft');
      } catch {
        // ignore
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Failed to record attendance to database. Your PRESENT and ABSENT selections have been preserved. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & info banner */}
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-blue-950 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <span>SUNDAY SERVICE ATTENDANCE</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {branchSettings.churchName} • {branchSettings.branchName}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-50/90 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-900 shadow-2xs">
          <Calendar className="w-4 h-4 text-blue-700" />
          <span>Active Session Date: {date}</span>
        </div>
      </div>

      {statusMessage && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50/95 backdrop-blur-md border border-emerald-200 text-emerald-800 shadow-lg'
              : 'bg-red-50/95 backdrop-blur-md border border-red-200 text-red-800 shadow-lg'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="font-medium text-xs leading-relaxed">{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmitAttendance} className="space-y-6">
        {/* Service Metadata Card */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
            1. Service Order & Pastoral Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Service Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Service Type *</label>
              <select
                value={serviceType}
                onChange={e => setServiceType(e.target.value as ServiceType)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="Sunday 1st Service (Breakthrough Service)">Sunday Service (Breakthrough Service - 1st Service)</option>
                <option value="Sunday 2nd Service (Power & Deliverance)">Sunday Service (Power & Deliverance - 2nd Service)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Presiding Minister</label>
              <input
                type="text"
                required
                value={presidingMinister}
                onChange={e => setPresidingMinister(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preacher / Speaker</label>
              <input
                type="text"
                required
                value={preacher}
                onChange={e => setPreacher(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sermon Topic / Message Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Walking in Divine Rest"
                value={sermonTopic}
                onChange={e => setSermonTopic(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scripture Reference(s)</label>
              <input
                type="text"
                placeholder="e.g. Isaiah 43:18-19"
                value={bibleReference}
                onChange={e => setBibleReference(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Headcounts Breakdown Card */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              2. Congregation Headcounts
            </h3>
            <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Total Counted: <span className="text-base text-amber-600 ml-1">{totalHeadcount}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-700 block uppercase">Men</span>
              <input
                type="number"
                min="0"
                value={menCount}
                onChange={e => setMenCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 mx-auto text-center text-xl font-bold p-1.5 border border-slate-300 rounded-lg mt-1 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-700 block uppercase">Women</span>
              <input
                type="number"
                min="0"
                value={womenCount}
                onChange={e => setWomenCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 mx-auto text-center text-xl font-bold p-1.5 border border-slate-300 rounded-lg mt-1 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-700 block uppercase">Youth</span>
              <input
                type="number"
                min="0"
                value={youthCount}
                onChange={e => setYouthCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 mx-auto text-center text-xl font-bold p-1.5 border border-slate-300 rounded-lg mt-1 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-700 block uppercase">Children</span>
              <input
                type="number"
                min="0"
                value={childrenCount}
                onChange={e => setChildrenCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 mx-auto text-center text-xl font-bold p-1.5 border border-slate-300 rounded-lg mt-1 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* First-Timers Check-in during this Service */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-amber-600" />
              <span>3. First-Time Visitors Check-In ({firstTimers.length})</span>
            </h3>
          </div>

          {/* Quick add visitor sub-form */}
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-3">
            <span className="text-xs font-bold text-amber-900 block">Add New First-Timer</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                placeholder="Visitor Full Name *"
                value={newFtName}
                onChange={e => setNewFtName(e.target.value)}
                className="p-2 border border-slate-300 rounded-lg bg-white"
              />
              <input
                type="tel"
                placeholder="Phone (Ghana) *"
                value={newFtPhone}
                onChange={e => setNewFtPhone(e.target.value)}
                className="p-2 border border-slate-300 rounded-lg bg-white"
              />
              <input
                type="text"
                placeholder="Residential Area / Landmark"
                value={newFtArea}
                onChange={e => setNewFtArea(e.target.value)}
                className="p-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <select
                value={newFtGender}
                onChange={e => setNewFtGender(e.target.value as Gender)}
                className="p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>

              <select
                value={newFtAge}
                onChange={e => setNewFtAge(e.target.value as AgeGroup)}
                className="p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Adult">Adult</option>
                <option value="Youth">Youth</option>
                <option value="Child">Child</option>
              </select>

              <input
                type="text"
                placeholder="Prayer Request / Notes"
                value={newFtRequest}
                onChange={e => setNewFtRequest(e.target.value)}
                className="p-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <button
              type="button"
              onClick={handleAddFirstTimer}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First-Timer to Roster</span>
            </button>
          </div>

          {/* List of first-timers */}
          {firstTimers.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Phone</th>
                    <th className="p-2.5">Area</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {firstTimers.map((ft, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-slate-800">{ft.fullName}</td>
                      <td className="p-2.5 text-slate-600">{ft.phone || '—'}</td>
                      <td className="p-2.5 text-slate-600">{ft.residentialArea}</td>
                      <td className="p-2.5 text-slate-500">{ft.gender} • {ft.ageGroup}</td>
                      <td className="p-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveFirstTimer(i)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 4. Registered Members Attendance Roster with Dedicated PRESENT and ABSENT Buttons */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-700" />
                <span>4. Sunday Service Members Attendance Roster</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mark each registered member as 🟢 PRESENT or 🔴 ABSENT for Sunday service roll-call
              </p>
            </div>

            <div className="w-full sm:w-80">
              <VoiceSearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={setSearchTerm}
                placeholder="Voice search member name... 🎤 🔍"
                id="rollcall-voice-search"
              />
            </div>
          </div>

          {/* Live Automatic Attendance Counters (Total Enrolled, Present, Absent, Pending) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Enrolled
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1 block">
                {totalRegisteredCount}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Registered congregation</span>
            </div>

            <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-300">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                <span>Total Present</span>
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-1 block">
                {totalPresentCount}
              </span>
              <span className="text-[10px] text-emerald-600 mt-0.5 block">Marked in attendance</span>
            </div>

            <div className="bg-rose-50/80 p-3.5 rounded-xl border border-rose-300">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block flex items-center gap-1">
                <X className="w-3 h-3 text-rose-700 stroke-[3]" />
                <span>Total Absent</span>
              </span>
              <span className="text-xl sm:text-2xl font-black text-rose-700 font-mono mt-1 block">
                {totalAbsentCount}
              </span>
              <span className="text-[10px] text-rose-600 mt-0.5 block">Marked absent</span>
            </div>

            <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-300">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                Pending Attendance
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-800 font-mono mt-1 block">
                {totalPendingCount}
              </span>
              <span className="text-[10px] text-amber-700 mt-0.5 block">Enrolled − Present − Absent</span>
            </div>
          </div>

          {/* Automatic Category Breakdown Table (Male, Female, Children, Adults, Total) */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Category Attendance Breakdown
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Calculated dynamically from live selections
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-center">Registered</th>
                    <th className="p-2.5 text-center text-emerald-700">Present</th>
                    <th className="p-2.5 text-center text-rose-700">Absent</th>
                    <th className="p-2.5 text-center text-amber-800">Pending</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800">Male</td>
                    <td className="p-2.5 text-center font-mono">{maleMembers.length}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-emerald-700 bg-emerald-50/40">{malePresent}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-rose-700 bg-rose-50/40">{maleAbsent}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-amber-800 bg-amber-50/40">{malePending}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800">Female</td>
                    <td className="p-2.5 text-center font-mono">{femaleMembers.length}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-emerald-700 bg-emerald-50/40">{femalePresent}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-rose-700 bg-rose-50/40">{femaleAbsent}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-amber-800 bg-amber-50/40">{femalePending}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800">Children</td>
                    <td className="p-2.5 text-center font-mono">{childrenMembers.length}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-emerald-700 bg-emerald-50/40">{childrenPresent}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-rose-700 bg-rose-50/40">{childrenAbsent}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-amber-800 bg-amber-50/40">{childrenPending}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800">Adults</td>
                    <td className="p-2.5 text-center font-mono">{adultMembers.length}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-emerald-700 bg-emerald-50/40">{adultPresent}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-rose-700 bg-rose-50/40">{adultAbsent}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-amber-800 bg-amber-50/40">{adultPending}</td>
                  </tr>
                  <tr className="bg-slate-50/90 font-bold border-t-2 border-slate-300 text-slate-900">
                    <td className="p-2.5 uppercase font-black">Total</td>
                    <td className="p-2.5 text-center font-mono font-black">{totalRegisteredCount}</td>
                    <td className="p-2.5 text-center font-mono font-black text-emerald-800 bg-emerald-100/50">{totalPresentCount}</td>
                    <td className="p-2.5 text-center font-mono font-black text-rose-800 bg-rose-100/50">{totalAbsentCount}</td>
                    <td className="p-2.5 text-center font-mono font-black text-amber-900 bg-amber-100/50">{totalPendingCount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Roster Batch Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-600 font-semibold">
                Showing {filteredMembers.length} of {members.length} member{members.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleMarkAllFilteredPresent}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-850 border border-emerald-300 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                title="Mark all matching members as Present"
              >
                Mark Shown Present
              </button>
              <button
                type="button"
                onClick={handleMarkAllFilteredAbsent}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-850 border border-rose-300 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                title="Mark all matching members as Absent"
              >
                Mark Shown Absent
              </button>
              {totalMarkedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllRosterSelections}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Reset Selections
                </button>
              )}
            </div>
          </div>

          {/* Voice & Search Matching Results Status */}
          {searchTerm.trim() && filteredMembers.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl flex items-center justify-between text-xs text-amber-950 font-medium shadow-xs">
              <span className="flex items-center gap-1.5">
                <span className="font-bold bg-amber-200 px-2 py-0.5 rounded font-mono text-[11px]">
                  {filteredMembers.length} MATCH{filteredMembers.length > 1 ? 'ES' : ''}
                </span>
                <span>Found member{filteredMembers.length > 1 ? 's' : ''} matching "{searchTerm}"</span>
              </span>
              <span className="text-[11px] text-amber-800 hidden sm:inline">
                Tap PRESENT or ABSENT below:
              </span>
            </div>
          )}

          {/* Members Attendance List - Smooth natural full layout */}
          <div className="space-y-2.5 p-1">
            {filteredMembers.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-2">
                <p className="font-bold text-base text-slate-800 tracking-wide">NO MATCHING MEMBER FOUND</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {searchTerm
                    ? `No church member records matched "${searchTerm}". Please speak or type another name.`
                    : 'No members currently enrolled in the Mankessim church database.'}
                </p>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="mt-1 px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              filteredMembers.map((member) => {
                const status = memberStatusMap[member.id];
                const isPresent = status === 'present';
                const isAbsent = status === 'absent';

                return (
                  <div
                    key={member.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isPresent
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-xs ring-1 ring-emerald-300/50'
                        : isAbsent
                        ? 'bg-rose-50/70 border-rose-300 shadow-xs ring-1 ring-rose-300/50'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Member Details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                          {member.memberCode}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {member.fullName}
                        </h4>
                        {/* Status Label for Accessibility & Color Blind Users */}
                        {isPresent && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                            <span>Status: Present</span>
                          </span>
                        )}
                        {isAbsent && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full">
                            <X className="w-3 h-3 text-rose-700 stroke-[3]" />
                            <span>Status: Absent</span>
                          </span>
                        )}
                        {!isPresent && !isAbsent && (
                          <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                            Not Recorded
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                        <span>{member.department}</span>
                        <span>·</span>
                        {/* Interactive Phone Link (CALL / SMS / WHATSAPP) */}
                        <button
                          type="button"
                          onClick={() => setPhoneModalData({
                            isOpen: true,
                            phone: member.phone,
                            name: member.fullName,
                            code: member.memberCode,
                            department: member.department,
                          })}
                          className="inline-flex items-center gap-1 font-mono font-semibold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                          title="Tap to Call, SMS, or WhatsApp this member"
                        >
                          <Phone className="w-3 h-3 text-blue-600" />
                          <span>{member.phone}</span>
                        </button>
                      </div>
                    </div>

                    {/* THE TWO EXPLICIT ATTENDANCE BUTTONS: PRESENT & ABSENT */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      {/* 🟢 PRESENT Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(member.id, 'present')}
                        className={`min-h-[44px] min-w-[108px] px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
                          isPresent
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-700 ring-4 ring-emerald-400/40 shadow-md scale-102 font-extrabold'
                            : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-2 border-slate-300 hover:border-emerald-400 font-semibold'
                        }`}
                        aria-pressed={isPresent}
                        title={`Mark ${member.fullName} as PRESENT`}
                      >
                        <Check className={`w-4 h-4 ${isPresent ? 'text-white stroke-[3]' : 'text-slate-400 stroke-[2]'}`} />
                        <span>PRESENT</span>
                      </button>

                      {/* 🔴 ABSENT Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(member.id, 'absent')}
                        className={`min-h-[44px] min-w-[108px] px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
                          isAbsent
                            ? 'bg-rose-600 hover:bg-rose-700 text-white border-2 border-rose-700 ring-4 ring-rose-400/40 shadow-md scale-102 font-extrabold'
                            : 'bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-800 border-2 border-slate-300 hover:border-rose-400 font-semibold'
                        }`}
                        aria-pressed={isAbsent}
                        title={`Mark ${member.fullName} as ABSENT`}
                      >
                        <X className={`w-4 h-4 ${isAbsent ? 'text-white stroke-[3]' : 'text-slate-400 stroke-[2]'}`} />
                        <span>ABSENT</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recording Clerk Signature & Submission */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recorded By (Usher / Clerk Name)
            </label>
            <input
              type="text"
              required
              value={recordedBy}
              onChange={e => setRecordedBy(e.target.value)}
              className="w-full sm:w-80 p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all focus:ring-4 focus:ring-blue-600/30 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{isSubmitting ? 'Submitting Attendance...' : 'SUBMIT ATTENDANCE'}</span>
          </button>
        </div>
      </form>

      {/* Global Interactive Member Phone Action Modal (1. CALL, 2. SMS, 3. WHATSAPP) */}
      <MemberPhoneActionModal
        isOpen={phoneModalData.isOpen}
        onClose={() => setPhoneModalData(prev => ({ ...prev, isOpen: false }))}
        phone={phoneModalData.phone}
        memberName={phoneModalData.name}
        memberCode={phoneModalData.code}
        department={phoneModalData.department}
      />
    </div>
  );
};
