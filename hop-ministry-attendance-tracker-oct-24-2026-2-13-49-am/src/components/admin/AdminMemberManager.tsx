import React, { useState } from 'react';
import { useChurchData } from '../../context/ChurchDataContext';
import { Member, Department, MemberStatus } from '../../types/church';
import { Users, Search, Edit2, Trash2, CheckCircle, AlertTriangle, X, Save, Phone, Calendar } from 'lucide-react';
import { VoiceSearchBar } from '../common/VoiceSearchBar';
import { MemberPhoneActionModal } from '../common/MemberPhoneActionModal';
import { MemberAttendanceHistory } from './MemberAttendanceHistory';

export const AdminMemberManager: React.FC = () => {
  const { members, updateMember, deleteMember, branchSettings } = useChurchData();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
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

  const [selectedHistoryMemberId, setSelectedHistoryMemberId] = useState<string | null>(null);

  const filtered = members.filter(m =>
    m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone.includes(searchTerm) ||
    m.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    await updateMember(editingMember.id, editingMember);
    setStatusFeedback(`Member ${editingMember.fullName} updated successfully.`);
    setEditingMember(null);
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    await deleteMember(deletingId);
    setStatusFeedback('Member removed from registry.');
    setDeletingId(null);
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-blue-950 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            <span>Pastoral Member Management & Records Control</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Edit membership profiles, change ecclesiastical standing, and manage church registry
          </p>
        </div>

        <span className="text-xs font-mono font-bold bg-blue-50/90 text-blue-900 px-3 py-1.5 rounded-lg border border-blue-200 shadow-2xs">
          Enrolled: {members.length}
        </span>
      </div>

      {statusFeedback && (
        <div className="bg-emerald-50/95 backdrop-blur-md border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-medium flex items-center gap-2 shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* Voice & Text Search */}
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-white/60 shadow-xl">
        <VoiceSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={setSearchTerm}
          placeholder="Search member by name or code to manage... 🎤 🔍"
          id="admin-member-voice-search"
        />
      </div>

      {/* Search Matching Feedback */}
      {searchTerm.trim() && filtered.length > 0 && (
        <div className="bg-amber-50/95 border border-amber-200 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs text-amber-950 font-medium shadow-sm">
          <span>Found {filtered.length} member{filtered.length > 1 ? 's' : ''} matching "{searchTerm}"</span>
          <span className="text-[11px] text-amber-800">Select member below to edit profile or standing</span>
        </div>
      )}

      {/* Members Management Table */}
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
                ? `No church member records matched "${searchTerm}". You can try speaking first name or last name, check spelling, or clear search.`
                : 'No members currently enrolled.'}
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
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Member Name</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(member => (
                  <tr key={member.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-blue-900">{member.memberCode}</td>
                    <td className="p-3.5 font-semibold text-slate-900">{member.fullName}</td>
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
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                        title="Tap to Call, SMS, or WhatsApp"
                      >
                        <Phone className="w-3 h-3 text-blue-600" />
                        <span>{member.phone}</span>
                        <span className="text-[10px] font-sans font-semibold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded ml-0.5">
                          Call/SMS/WA
                        </span>
                      </button>
                    </td>
                    <td className="p-3.5 text-slate-700">{member.department}</td>
                    <td className="p-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        member.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedHistoryMemberId(member.id)}
                        className="p-1.5 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                        title="View Sunday Attendance History"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingMember(member)}
                        className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Member Profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(member.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Member"
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

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm">
                Edit Member Record: {editingMember.memberCode}
              </h3>
              <button onClick={() => setEditingMember(null)} className="text-blue-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 text-xs space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingMember.fullName}
                  onChange={e => setEditingMember({ ...editingMember, fullName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={editingMember.gender}
                    onChange={e => setEditingMember({ ...editingMember, gender: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age Category</label>
                  <select
                    value={editingMember.ageCategory || (editingMember.ageGroup === 'Child' ? 'Child' : 'Adult')}
                    onChange={e => setEditingMember({ ...editingMember, ageCategory: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Adult">Adult</option>
                    <option value="Child">Child</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={editingMember.phone}
                    onChange={e => setEditingMember({ ...editingMember, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingMember.status}
                    onChange={e => setEditingMember({ ...editingMember, status: e.target.value as MemberStatus })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Under Follow-up">Under Follow-up</option>
                    <option value="Transferred">Transferred</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={editingMember.department}
                  onChange={e => setEditingMember({ ...editingMember, department: e.target.value as Department })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {branchSettings.departments.map((dept, i) => (
                    <option key={i} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={editingMember.residentialAddress}
                  onChange={e => setEditingMember({ ...editingMember, residentialAddress: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pastoral Notes</label>
                <textarea
                  rows={2}
                  value={editingMember.notes || ''}
                  onChange={e => setEditingMember({ ...editingMember, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 text-white rounded-lg font-bold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-slate-900">
              Confirm Member Deletion
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove this member from the church registry? This action will permanently remove their records from local storage.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Attendance History Modal */}
      {selectedHistoryMemberId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <MemberAttendanceHistory
              initialMemberId={selectedHistoryMemberId}
              onClose={() => setSelectedHistoryMemberId(null)}
            />
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
