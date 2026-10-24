import React, { useState } from 'react';
import { useChurchData } from '../../context/ChurchDataContext';
import { Gender, AgeCategory, AgeGroup, MaritalStatus, Department, BaptismStatus } from '../../types/church';
import { UserPlus, Save, CheckCircle2, AlertCircle, Phone, Home, Briefcase, Heart, Shield, MessageSquare, Send, ExternalLink } from 'lucide-react';
import { MemberPhoneActionModal } from '../common/MemberPhoneActionModal';
import { formatGhanaianWhatsApp, formatNativeCall, formatNativeSms } from '../../utils/phoneUtils';
import { Member } from '../../types/church';

export const MemberRegistration: React.FC = () => {
  const { members, branchSettings, addMember } = useChurchData();

  // Next member code calculation
  const nextNumber = members.length + 1;
  const autoMemberCode = `HOP-MKS-${String(nextNumber).padStart(3, '0')}`;

  const [fullName, setFullName] = useState('');
  const [memberCode, setMemberCode] = useState(autoMemberCode);
  const [gender, setGender] = useState<Gender>('Male');
  const [ageCategory, setAgeCategory] = useState<AgeCategory>('Adult');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('Adult');
  const [phone, setPhone] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [email, setEmail] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [hometownOrRegion, setHometownOrRegion] = useState('');
  const [occupation, setOccupation] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('Single');
  const [department, setDepartment] = useState<Department>('None / General Congregation');
  const [baptismStatus, setBaptismStatus] = useState<BaptismStatus>('Baptized (Immersion)');
  const [dateJoined, setDateJoined] = useState(() => new Date().toISOString().split('T')[0]);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('');
  const [notes, setNotes] = useState('');

  const [lastRegisteredMember, setLastRegisteredMember] = useState<Member | null>(null);
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Restore unsaved registration draft if user switched views
  React.useEffect(() => {
    try {
      const saved = sessionStorage.getItem('hop_member_reg_draft');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.fullName) setFullName(d.fullName);
        if (d.phone) setPhone(d.phone);
        if (d.whatsappPhone) setWhatsappPhone(d.whatsappPhone);
        if (d.email) setEmail(d.email);
        if (d.residentialAddress) setResidentialAddress(d.residentialAddress);
        if (d.hometownOrRegion) setHometownOrRegion(d.hometownOrRegion);
        if (d.occupation) setOccupation(d.occupation);
        if (d.emergencyContactName) setEmergencyContactName(d.emergencyContactName);
        if (d.emergencyContactPhone) setEmergencyContactPhone(d.emergencyContactPhone);
        if (d.emergencyContactRelation) setEmergencyContactRelation(d.emergencyContactRelation);
        if (d.notes) setNotes(d.notes);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Auto-save form draft whenever key information is typed
  React.useEffect(() => {
    try {
      const draft = {
        fullName,
        phone,
        whatsappPhone,
        email,
        residentialAddress,
        hometownOrRegion,
        occupation,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelation,
        notes,
      };
      if (fullName || phone || residentialAddress) {
        sessionStorage.setItem('hop_member_reg_draft', JSON.stringify(draft));
      }
    } catch {
      // ignore
    }
  }, [fullName, phone, whatsappPhone, email, residentialAddress, hometownOrRegion, occupation, emergencyContactName, emergencyContactPhone, emergencyContactRelation, notes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!fullName.trim()) {
      setStatusMessage({ type: 'error', text: 'Full name is required.' });
      return;
    }

    if (!phone.trim()) {
      setStatusMessage({ type: 'error', text: 'Primary contact telephone is required.' });
      return;
    }

    if (!residentialAddress.trim()) {
      setStatusMessage({ type: 'error', text: 'Residential address / Mankessim locality is required.' });
      return;
    }

    if (!emergencyContactName.trim() || !emergencyContactPhone.trim()) {
      setStatusMessage({ type: 'error', text: 'Emergency contact name and phone number are required.' });
      return;
    }

    // Duplicate Member Registration Prevention
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const cleanName = fullName.trim().toLowerCase();
    const existingDuplicate = members.find(m => {
      const mPhone = m.phone.replace(/\D/g, '');
      const mName = m.fullName.trim().toLowerCase();
      return mPhone === cleanPhone || (mName === cleanName && mPhone === cleanPhone);
    });

    if (existingDuplicate) {
      setStatusMessage({
        type: 'error',
        text: `Duplicate Registration Prevented: A member named "${existingDuplicate.fullName}" is already registered with telephone number "${existingDuplicate.phone}" (Code: ${existingDuplicate.memberCode}). Each member must have a unique telephone number.`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await addMember({
        memberCode: memberCode.trim() || autoMemberCode,
        fullName: fullName.trim(),
        gender,
        ageCategory,
        ageGroup: ageCategory === 'Child' ? 'Child' : ageGroup,
        phone: phone.trim(),
        whatsappPhone: whatsappPhone.trim() || phone.trim(),
        email: email.trim(),
        residentialAddress: residentialAddress.trim(),
        hometownOrRegion: hometownOrRegion.trim(),
        occupation: occupation.trim(),
        maritalStatus,
        department,
        baptismStatus,
        dateJoined,
        status: 'Active',
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone: emergencyContactPhone.trim(),
        emergencyContactRelation: emergencyContactRelation.trim() || 'Next of Kin',
        notes: notes.trim(),
      });

      setLastRegisteredMember(created);
      setStatusMessage({
        type: 'success',
        text: `MEMBER REGISTERED SUCCESSFULLY! "${created.fullName}" enrolled with Code ${created.memberCode}.`,
      });

      // Clear form
      setFullName('');
      setPhone('');
      setWhatsappPhone('');
      setEmail('');
      setResidentialAddress('');
      setHometownOrRegion('');
      setOccupation('');
      setEmergencyContactName('');
      setEmergencyContactPhone('');
      setEmergencyContactRelation('');
      setNotes('');
      try {
        sessionStorage.removeItem('hop_member_reg_draft');
      } catch {
        // ignore
      }
      // update next auto code
      setMemberCode(`HOP-MKS-${String(nextNumber + 1).padStart(3, '0')}`);
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to save member record. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-blue-950 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-600" />
            <span>MEMBER REGISTRATION</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enroll new converts, baptized believers, and transfers into the Mankessim registry
          </p>
        </div>

        <div className="text-xs font-mono bg-amber-50/90 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-lg font-bold shadow-2xs">
          Assigned Code: {memberCode}
        </div>
      </div>

      {statusMessage && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-xs flex flex-col gap-2.5 animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50/95 backdrop-blur-md border border-emerald-200 text-emerald-800 shadow-md'
              : 'bg-red-50/95 backdrop-blur-md border border-red-200 text-red-800 shadow-md'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="font-bold text-xs leading-relaxed block">{statusMessage.text}</span>
            </div>
          </div>

          {statusMessage.type === 'success' && lastRegisteredMember && (
            <div className="mt-1 pt-2.5 border-t border-emerald-200/80 flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-emerald-950 font-medium">
                Connect with <strong className="font-bold text-emerald-900">{lastRegisteredMember.fullName}</strong> ({lastRegisteredMember.phone}):
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <a
                  href={formatNativeCall(lastRegisteredMember.phone)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  title="Open native dialler"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>1. CALL</span>
                </a>

                <a
                  href={formatNativeSms(lastRegisteredMember.phone)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  title="Open SMS messaging app"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>2. SMS</span>
                </a>

                {(() => {
                  const wa = formatGhanaianWhatsApp(lastRegisteredMember.whatsappPhone || lastRegisteredMember.phone);
                  return wa.isValid ? (
                    <a
                      href={wa.waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      title="Open WhatsApp chat"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>3. WHATSAPP</span>
                    </a>
                  ) : null;
                })()}

                <button
                  type="button"
                  onClick={() => setPhoneModalData({
                    isOpen: true,
                    phone: lastRegisteredMember.phone,
                    name: lastRegisteredMember.fullName,
                    code: lastRegisteredMember.memberCode,
                    department: lastRegisteredMember.department,
                  })}
                  className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Options Menu
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
            1. Personal Identification
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Name (Surname First or Standard) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kwesi Annan Darko"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as Gender)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Age Category *</label>
              <select
                value={ageCategory}
                onChange={e => setAgeCategory(e.target.value as AgeCategory)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white font-medium"
              >
                <option value="Adult">Adult</option>
                <option value="Child">Child</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Separated from gender (a child can be Male or Female)
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Marital Status *</label>
              <select
                value={maritalStatus}
                onChange={e => setMaritalStatus(e.target.value as MaritalStatus)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Occupation / Profession</label>
              <input
                type="text"
                placeholder="e.g. Trader, Teacher, Artisan"
                value={occupation}
                onChange={e => setOccupation(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hometown / Region of Origin</label>
              <input
                type="text"
                placeholder="e.g. Saltpond, Mankessim, Cape Coast"
                value={hometownOrRegion}
                onChange={e => setHometownOrRegion(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact & Location Details */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
            2. Contact & Residential Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Primary Phone (Ghanaian Mobile) *
              </label>
              <input
                type="tel"
                required
                placeholder="024 XXX XXXX or 020 XXX XXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                WhatsApp Phone Number
              </label>
              <input
                type="tel"
                placeholder="024 XXX XXXX"
                value={whatsappPhone}
                onChange={e => setWhatsappPhone(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="member@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Interactive Phone Testing & Verification Bar */}
            {phone && (
              <div className="sm:col-span-2 lg:col-span-3 p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs animate-fadeIn">
                <div className="flex items-center gap-1.5 text-blue-950 font-medium">
                  <Phone className="w-3.5 h-3.5 text-blue-700" />
                  <span>Interactive Telephone: <strong className="font-mono">{phone}</strong></span>
                  {(() => {
                    const wa = formatGhanaianWhatsApp(whatsappPhone || phone);
                    return wa.isValid ? (
                      <span className="text-[11px] text-emerald-800 font-mono font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                        WhatsApp: {wa.displayFormatted}
                      </span>
                    ) : null;
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPhoneModalData({
                      isOpen: true,
                      phone: phone,
                      name: fullName || 'New Registering Member',
                      code: memberCode,
                      department,
                    })}
                    className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <span>Test 1. CALL · 2. SMS · 3. WHATSAPP</span>
                  </button>
                </div>
              </div>
            )}

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">
                Residential Address & Nearby Landmark in Mankessim *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mankessim Market Road, Near Total Filling Station / House No. MK-42"
                value={residentialAddress}
                onChange={e => setResidentialAddress(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Church Ministry & Spiritual Details */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
            3. Ministry Department & Spiritual Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Church Department / Unit *</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value as Department)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              >
                {branchSettings.departments.map((dept, i) => (
                  <option key={i} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Water Baptism Status *</label>
              <select
                value={baptismStatus}
                onChange={e => setBaptismStatus(e.target.value as BaptismStatus)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              >
                <option value="Baptized (Immersion)">Baptized (Immersion)</option>
                <option value="Not Baptized">Not Baptized</option>
                <option value="Scheduled">Scheduled for Next Baptism</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date Joined Church</label>
              <input
                type="date"
                value={dateJoined}
                onChange={e => setDateJoined(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
            4. Emergency Contact / Next of Kin
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mrs. Rebecca Darko"
                value={emergencyContactName}
                onChange={e => setEmergencyContactName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emergency Phone *</label>
              <input
                type="tel"
                required
                placeholder="024 XXX XXXX"
                value={emergencyContactPhone}
                onChange={e => setEmergencyContactPhone(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
              <input
                type="text"
                placeholder="e.g. Spouse, Parent, Sibling"
                value={emergencyContactRelation}
                onChange={e => setEmergencyContactRelation(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pastoral Remarks / Notes</label>
            <textarea
              rows={2}
              placeholder="Any spiritual or welfare notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Registering Member...' : 'Register Member into Directory'}</span>
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
