import React, { useState } from 'react';
import { useChurchData } from '../../context/ChurchDataContext';
import { Member, Department } from '../../types/church';
import { Search, Filter, Phone, Mail, MapPin, User, ChevronRight, Eye, X, Download, MessageSquare, Send } from 'lucide-react';
import { VoiceSearchBar } from '../common/VoiceSearchBar';
import { MemberPhoneActionModal } from '../common/MemberPhoneActionModal';

export const MemberDirectory: React.FC = () => {
  const { members, branchSettings } = useChurchData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [activeMemberModal, setActiveMemberModal] = useState<Member | null>(null);
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

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.residentialAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'All' || m.department === selectedDept;
    const matchesGender = selectedGender === 'All' || m.gender === selectedGender;

    return matchesSearch && matchesDept && matchesGender;
  });

  const handleExportCSV = () => {
    const headers = ['Member Code', 'Full Name', 'Gender', 'Category', 'Phone', 'Address', 'Department', 'Baptism', 'Emergency Contact', 'Emergency Phone'];
    const rows = filteredMembers.map(m => [
      `"${m.memberCode}"`,
      `"${m.fullName}"`,
      `"${m.gender}"`,
      `"${m.ageGroup}"`,
      `"${m.phone}"`,
      `"${m.residentialAddress.replace(/"/g, '""')}"`,
      `"${m.department}"`,
      `"${m.baptismStatus}"`,
      `"${m.emergencyContactName}"`,
      `"${m.emergencyContactPhone}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HOP_Mankessim_Members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Directory Header */}
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-blue-950 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-600" />
            <span>Mankessim Church Member Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Total Enrolled Members: <strong className="text-blue-900 font-bold">{members.length}</strong>
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/90 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Directory (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="sm:col-span-1">
          <VoiceSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={setSearchTerm}
            placeholder="Search member name...  🎤 🔍"
            id="directory-voice-search"
          />
        </div>

        <div>
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
          >
            <option value="All">All Departments / Ministries</option>
            {branchSettings.departments.map((dept, i) => (
              <option key={i} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedGender}
            onChange={e => setSelectedGender(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
          >
            <option value="All">All Genders</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
        </div>
      </div>

      {/* Voice & Search Matching Results Banner */}
      {searchTerm.trim() && filteredMembers.length > 0 && (
        <div className="bg-amber-50/95 border border-amber-200 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-sm">
          <div className="flex items-center gap-2 text-amber-950">
            <span className="font-bold bg-amber-200/80 px-2 py-0.5 rounded text-[11px] font-mono">
              {filteredMembers.length} MATCH{filteredMembers.length > 1 ? 'ES' : ''}
            </span>
            <span className="font-medium">
              Found {filteredMembers.length} member{filteredMembers.length > 1 ? 's' : ''} matching "{searchTerm}"
            </span>
          </div>
          <p className="text-[11px] text-amber-800">
            {filteredMembers.length > 1
              ? 'Multiple similar names found. Select the desired member below:'
              : 'Tap details or view full profile below:'}
          </p>
        </div>
      )}

      {/* Members Table (Desktop) & Cards (Mobile) */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-wide">
              NO MATCHING MEMBER FOUND
            </h3>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              {searchTerm
                ? `No church member records matched "${searchTerm}". Please verify the spoken or typed name, check the spelling, or register a new member.`
                : 'No church members match the currently selected ministry department or gender filter.'}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Clear Search & Show All Members
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">Full Name</th>
                    <th className="p-3.5">Gender / Age</th>
                    <th className="p-3.5">Phone Contact</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Residential Locality</th>
                    <th className="p-3.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-900">
                        {member.memberCode}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900">
                        {member.fullName}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {member.gender} · {member.ageGroup}
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => setPhoneModalData({
                            isOpen: true,
                            phone: member.phone,
                            name: member.fullName,
                            code: member.memberCode,
                            department: member.department,
                          })}
                          className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-950 font-mono text-xs font-bold transition-all shadow-2xs hover:scale-102 active:scale-98 cursor-pointer"
                          title={`Tap to Call, SMS, or WhatsApp ${member.fullName}`}
                        >
                          <Phone className="w-3.5 h-3.5 text-blue-700" />
                          <span>{member.phone}</span>
                          <span className="text-[10px] font-sans font-semibold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded ml-0.5">
                            Call/SMS/WA
                          </span>
                        </button>
                      </td>
                      <td className="p-3.5 text-slate-700">
                        <span className="font-medium text-slate-800">{member.department}</span>
                      </td>
                      <td className="p-3.5 text-slate-600 truncate max-w-xs" title={member.residentialAddress}>
                        {member.residentialAddress}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setActiveMemberModal(member)}
                          className="p-1.5 hover:bg-slate-100 rounded text-blue-900 cursor-pointer"
                          title="View Complete Member File"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredMembers.map((member) => (
                <div key={member.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                        {member.memberCode}
                      </span>
                      <h4 className="font-semibold text-slate-900 text-sm mt-1">
                        {member.fullName}
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveMemberModal(member)}
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-900 rounded font-medium cursor-pointer"
                    >
                      View
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    {member.gender} · {member.ageGroup} · {member.department}
                  </p>

                  <div className="flex items-center gap-3 text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setPhoneModalData({
                        isOpen: true,
                        phone: member.phone,
                        name: member.fullName,
                        code: member.memberCode,
                        department: member.department,
                      })}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-950 font-mono font-bold text-xs min-h-[44px] cursor-pointer"
                      title="Tap for Call, SMS, or WhatsApp options"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-700" />
                      <span>{member.phone}</span>
                      <span className="text-[10px] font-sans bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                        Call/SMS/WA
                      </span>
                    </button>
                    <span className="text-slate-400 truncate text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{member.residentialAddress}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Member Full File Modal */}
      {activeMemberModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-300">
                  {activeMemberModal.memberCode}
                </span>
                <h3 className="font-serif font-bold text-base">
                  {activeMemberModal.fullName}
                </h3>
              </div>
              <button
                onClick={() => setActiveMemberModal(null)}
                className="text-blue-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 text-xs text-slate-700 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Gender & Age</span>
                  <span className="font-semibold text-slate-800">{activeMemberModal.gender} ({activeMemberModal.ageGroup})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Marital Status</span>
                  <span className="font-semibold text-slate-800">{activeMemberModal.maritalStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Occupation</span>
                  <span className="font-semibold text-slate-800">{activeMemberModal.occupation || 'Not Specified'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Hometown / Region</span>
                  <span className="font-semibold text-slate-800">{activeMemberModal.hometownOrRegion || 'Not Specified'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-2">Contact Information</span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block">Primary Phone</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{activeMemberModal.phone}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhoneModalData({
                        isOpen: true,
                        phone: activeMemberModal.phone,
                        name: activeMemberModal.fullName,
                        code: activeMemberModal.memberCode,
                        department: activeMemberModal.department,
                      })}
                      className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Connect (Call / SMS / WA)</span>
                    </button>
                  </div>

                  {activeMemberModal.whatsappPhone && (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div>
                        <span className="text-[10px] text-emerald-800 font-semibold block">WhatsApp Phone</span>
                        <span className="font-mono font-bold text-emerald-950 text-sm">{activeMemberModal.whatsappPhone}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPhoneModalData({
                          isOpen: true,
                          phone: activeMemberModal.whatsappPhone || activeMemberModal.phone,
                          name: activeMemberModal.fullName,
                          code: activeMemberModal.memberCode,
                          department: activeMemberModal.department,
                        })}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>WhatsApp Chat</span>
                      </button>
                    </div>
                  )}

                  {activeMemberModal.email && (
                    <p className="px-2.5 text-xs text-slate-600">Email: <strong className="text-slate-900">{activeMemberModal.email}</strong></p>
                  )}
                  <p className="px-2.5 text-xs text-slate-600">Address: <strong className="text-slate-900">{activeMemberModal.residentialAddress}</strong></p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Church Profile</span>
                <p>Department: <strong className="text-blue-900">{activeMemberModal.department}</strong></p>
                <p className="mt-0.5">Baptism: <strong className="text-slate-900">{activeMemberModal.baptismStatus}</strong></p>
                <p className="mt-0.5">Date Enrolled: <strong className="text-slate-900">{activeMemberModal.dateJoined}</strong></p>
              </div>

              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                <span className="text-amber-900 block text-[10px] uppercase font-bold tracking-wider mb-1">Emergency Contact</span>
                <p className="text-slate-800">
                  Name: <strong className="text-slate-950">{activeMemberModal.emergencyContactName}</strong> ({activeMemberModal.emergencyContactRelation})
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-200">
                  <span className="font-mono font-bold text-slate-900">{activeMemberModal.emergencyContactPhone}</span>
                  <button
                    type="button"
                    onClick={() => setPhoneModalData({
                      isOpen: true,
                      phone: activeMemberModal.emergencyContactPhone,
                      name: `${activeMemberModal.emergencyContactName} (Emergency contact for ${activeMemberModal.fullName})`,
                      code: activeMemberModal.memberCode,
                    })}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call / SMS / WA</span>
                  </button>
                </div>
              </div>

              {activeMemberModal.notes && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Pastoral Remarks</span>
                  <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-600 italic">
                    {activeMemberModal.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveMemberModal(null)}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
