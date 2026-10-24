/**
 * House of Power Ministry International Church
 * Mankessim, Central Region, Ghana
 * Data Persistence and Validation Service
 */

import { Member, AttendanceRecord, FirstTimer, ChurchBranchSettings } from '../types/church';

const MEMBERS_KEY = 'hop_church_members_db';
const ATTENDANCE_KEY = 'hop_church_attendance_db';
const SETTINGS_KEY = 'hop_church_branch_settings';

export const DEFAULT_CHURCH_SETTINGS: ChurchBranchSettings = {
  churchName: 'House of Power Ministry International Church',
  branchName: 'Mankessim Central Branch',
  location: 'Mankessim, Central Region, Ghana',
  motto: 'Heaven Oo!!! Ɛho ɛna Yɛpɛ',
  spiritualLeader: 'Prophet Francis Kwarteng (General Overseer)',
  pastorInCharge: 'Rev. Emmanuel Quayson (Resident Pastor)',
  contactPhones: ['+233 24 123 4567', '+233 20 987 6543'],
  contactEmail: 'mankessim@houseofpower.org',
  postalAddress: 'P.O. Box MK 204, Mankessim, Mfantseman District, Ghana',
  servicesSchedule: [
    { day: 'Sunday', title: '1st Service (Breakthrough Service)', time: '06:30 AM - 09:30 AM' },
    { day: 'Sunday', title: '2nd Service (Power & Deliverance)', time: '10:00 AM - 01:00 PM' },
    { day: 'Wednesday', title: 'Midweek Prophetic & Miracle Service', time: '05:30 PM - 08:00 PM' },
    { day: 'Friday', title: 'All-Night Prayer & Deliverance Vigil', time: '10:30 PM - 04:00 AM' },
  ],
  departments: [
    'Choir / Praise & Worship',
    'Ushering & Protocol',
    'Evangelism & Outreach',
    'Prayer Force & Intercession',
    'Media & Technical',
    'Sunday School / Children Ministry',
    'Youth Ministry',
    "Men's Ministry",
    "Women's Ministry",
    'Welfare Committee',
    'None / General Congregation',
  ],
};

// Seed members representing Mankessim community
const SEED_MEMBERS: Member[] = [
  {
    id: 'mem-001',
    memberCode: 'HOP-MKS-001',
    fullName: 'Elder Kwesi Annan Darko',
    gender: 'Male',
    ageCategory: 'Adult',
    ageGroup: 'Adult',
    phone: '0244112233',
    whatsappPhone: '0244112233',
    email: 'k.darko@gmail.com',
    residentialAddress: 'Opposite Mankessim Central Market, Flat 4',
    hometownOrRegion: 'Mankessim, Central Region',
    occupation: 'Merchant / Trader',
    maritalStatus: 'Married',
    department: "Men's Ministry",
    baptismStatus: 'Baptized (Immersion)',
    dateJoined: '2021-02-14',
    status: 'Active',
    emergencyContactName: 'Mrs. Rebecca Darko',
    emergencyContactPhone: '0205556677',
    emergencyContactRelation: 'Spouse',
    notes: 'Church Board Member and Men Ministry Chairman',
    createdAt: '2021-02-14T08:00:00.000Z',
    updatedAt: '2026-10-10T12:00:00.000Z',
  },
  {
    id: 'mem-002',
    memberCode: 'HOP-MKS-002',
    fullName: 'Deaconess Akosua Baidoo',
    gender: 'Female',
    ageCategory: 'Adult',
    ageGroup: 'Adult',
    phone: '0277334455',
    whatsappPhone: '0277334455',
    email: 'akosua.baidoo@yahoo.com',
    residentialAddress: 'Saltpond Junction Road, Near Total Filling Station',
    hometownOrRegion: 'Saltpond, Central Region',
    occupation: 'Teacher',
    maritalStatus: 'Married',
    department: 'Ushering & Protocol',
    baptismStatus: 'Baptized (Immersion)',
    dateJoined: '2022-04-10',
    status: 'Active',
    emergencyContactName: 'Mr. Joseph Baidoo',
    emergencyContactPhone: '0244998877',
    emergencyContactRelation: 'Spouse',
    notes: 'Head of Ushering Department',
    createdAt: '2022-04-10T09:30:00.000Z',
    updatedAt: '2026-09-15T11:20:00.000Z',
  },
  {
    id: 'mem-003',
    memberCode: 'HOP-MKS-003',
    fullName: 'Emmanuel Kwabena Mensah',
    gender: 'Male',
    ageCategory: 'Adult',
    ageGroup: 'Youth',
    phone: '0555123456',
    whatsappPhone: '0555123456',
    email: 'mensah.emmanuel@gmail.com',
    residentialAddress: 'Baifikrom Road, Near Methodist School',
    hometownOrRegion: 'Baifikrom',
    occupation: 'Graphic Designer & IT Specialist',
    maritalStatus: 'Single',
    department: 'Media & Technical',
    baptismStatus: 'Baptized (Immersion)',
    dateJoined: '2023-01-08',
    status: 'Active',
    emergencyContactName: 'Grace Mensah',
    emergencyContactPhone: '0243129876',
    emergencyContactRelation: 'Sister',
    notes: 'Handles audio visual recording & Sunday live projection',
    createdAt: '2023-01-08T10:00:00.000Z',
    updatedAt: '2026-08-20T14:15:00.000Z',
  },
  {
    id: 'mem-004',
    memberCode: 'HOP-MKS-004',
    fullName: 'Sister Grace Mansah Osei',
    gender: 'Female',
    ageCategory: 'Adult',
    ageGroup: 'Adult',
    phone: '0208765432',
    whatsappPhone: '0208765432',
    email: 'graceosei@gmail.com',
    residentialAddress: 'Ajumako Road, Anomabo Bypass',
    hometownOrRegion: 'Anomabo',
    occupation: 'Pharmacist',
    maritalStatus: 'Single',
    department: 'Choir / Praise & Worship',
    baptismStatus: 'Baptized (Immersion)',
    dateJoined: '2023-06-18',
    status: 'Active',
    emergencyContactName: 'Pastor Kofi Osei',
    emergencyContactPhone: '0244111222',
    emergencyContactRelation: 'Father',
    notes: 'Lead vocalist in worship team',
    createdAt: '2023-06-18T07:45:00.000Z',
    updatedAt: '2026-10-01T16:00:00.000Z',
  },
  {
    id: 'mem-005',
    memberCode: 'HOP-MKS-005',
    fullName: 'Brother Francis Ekow Essel',
    gender: 'Male',
    ageCategory: 'Adult',
    ageGroup: 'Youth',
    phone: '0543789012',
    residentialAddress: 'Near Mankessim Roundabout',
    hometownOrRegion: 'Mankessim',
    occupation: 'Driver & Logistics',
    maritalStatus: 'Single',
    department: 'Evangelism & Outreach',
    baptismStatus: 'Baptized (Immersion)',
    dateJoined: '2024-03-03',
    status: 'Active',
    emergencyContactName: 'Sarah Essel',
    emergencyContactPhone: '0501239876',
    emergencyContactRelation: 'Mother',
    notes: 'Active in town evangelism and tract distribution',
    createdAt: '2024-03-03T09:00:00.000Z',
    updatedAt: '2026-05-11T10:00:00.000Z',
  },
  {
    id: 'mem-006',
    memberCode: 'HOP-MKS-006',
    fullName: 'Sister Patricia Aba Arthur',
    gender: 'Female',
    ageCategory: 'Adult',
    ageGroup: 'Adult',
    phone: '0249876543',
    whatsappPhone: '0249876543',
    residentialAddress: 'Estates Road, Behind Police Station',
    hometownOrRegion: 'Cape Coast',
    occupation: 'Caterer',
    maritalStatus: 'Married',
    department: "Women's Ministry",
    baptismStatus: 'Baptized (Immersion)',
    dateJoined: '2022-09-11',
    status: 'Active',
    emergencyContactName: 'Mr. Patrick Arthur',
    emergencyContactPhone: '0207654321',
    emergencyContactRelation: 'Spouse',
    notes: 'Welfare team coordinator',
    createdAt: '2022-09-11T08:30:00.000Z',
    updatedAt: '2026-09-28T09:15:00.000Z',
  },
  {
    id: 'mem-007',
    memberCode: 'HOP-MKS-007',
    fullName: 'Master Samuel Nana Yaw Darko',
    gender: 'Male',
    ageCategory: 'Child',
    ageGroup: 'Child',
    phone: '0244112233',
    residentialAddress: 'Opposite Mankessim Central Market, Flat 4',
    maritalStatus: 'Single',
    department: 'Sunday School / Children Ministry',
    baptismStatus: 'Not Baptized',
    dateJoined: '2023-05-07',
    status: 'Active',
    emergencyContactName: 'Elder Kwesi Annan Darko',
    emergencyContactPhone: '0244112233',
    emergencyContactRelation: 'Father',
    notes: 'Child of Elder Kwesi Darko',
    createdAt: '2023-05-07T08:00:00.000Z',
    updatedAt: '2026-01-10T12:00:00.000Z',
  },
];

// Seed recent attendance records
const SEED_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-2026-10-18-s1',
    date: '2026-10-18',
    serviceType: 'Sunday 1st Service (Breakthrough Service)',
    startTime: '06:30 AM',
    endTime: '09:30 AM',
    presidingMinister: 'Rev. Emmanuel Quayson',
    preacher: 'Prophet Francis Kwarteng (Broadcast / Overseer Audio)',
    sermonTopic: 'The Season of Supernatural Breakthrough and Divine Rest',
    bibleReference: 'Isaiah 43:18-19, 2 Kings 7:1-2',
    headcounts: {
      men: 84,
      women: 142,
      youth: 78,
      children: 52,
      firstTimers: 12,
      total: 368,
    },
    rollCallMemberIds: ['mem-001', 'mem-002', 'mem-003', 'mem-004', 'mem-005', 'mem-006', 'mem-007'],
    memberAttendanceStatus: {
      'mem-001': 'present',
      'mem-002': 'present',
      'mem-003': 'present',
      'mem-004': 'present',
      'mem-005': 'present',
      'mem-006': 'present',
      'mem-007': 'present',
    },
    firstTimersList: [
      {
        id: 'ft-001',
        fullName: 'Mary Nana Ama Korsah',
        gender: 'Female',
        ageGroup: 'Youth',
        phone: '0559988776',
        residentialArea: 'Mankessim Zongo',
        invitedBy: 'Sister Grace Mansah Osei',
        prayerRequest: 'Healing for mother and spiritual breakthrough',
        followUpStatus: 'Pending',
        assignedCounselor: 'Deaconess Akosua Baidoo',
        dateVisited: '2026-10-18',
      },
      {
        id: 'ft-002',
        fullName: 'Kofi Boakye Mensah',
        gender: 'Male',
        ageGroup: 'Adult',
        phone: '0241234500',
        residentialArea: 'Saltpond Lowcost',
        invitedBy: 'Brother Francis Ekow Essel',
        prayerRequest: 'Employment and business expansion',
        followUpStatus: 'Called',
        assignedCounselor: 'Elder Kwesi Annan Darko',
        dateVisited: '2026-10-18',
      },
    ],
    recordedBy: 'Deaconess Akosua Baidoo (Ushering Head)',
    verifiedBy: 'Rev. Emmanuel Quayson',
    notes: 'High turnout for the second Sunday communion service. Praise was intense.',
    createdAt: '2026-10-18T09:45:00.000Z',
    updatedAt: '2026-10-18T10:10:00.000Z',
  },
  {
    id: 'att-2026-10-11-s1',
    date: '2026-10-11',
    serviceType: 'Sunday 1st Service (Breakthrough Service)',
    startTime: '06:30 AM',
    endTime: '09:25 AM',
    presidingMinister: 'Rev. Emmanuel Quayson',
    preacher: 'Rev. Emmanuel Quayson',
    sermonTopic: 'Walking in Unstoppable Faith',
    bibleReference: 'Hebrews 11:1-6',
    headcounts: {
      men: 79,
      women: 135,
      youth: 72,
      children: 48,
      firstTimers: 9,
      total: 343,
    },
    rollCallMemberIds: ['mem-001', 'mem-002', 'mem-003', 'mem-004', 'mem-006'],
    memberAttendanceStatus: {
      'mem-001': 'present',
      'mem-002': 'present',
      'mem-003': 'present',
      'mem-004': 'present',
      'mem-005': 'absent',
      'mem-006': 'present',
      'mem-007': 'absent',
    },
    firstTimersList: [],
    recordedBy: 'Deaconess Akosua Baidoo',
    verifiedBy: 'Rev. Emmanuel Quayson',
    notes: 'Peaceful and uplifting service. Sound team functioned smoothly.',
    createdAt: '2026-10-11T09:40:00.000Z',
    updatedAt: '2026-10-11T09:40:00.000Z',
  },
  {
    id: 'att-2026-10-04-s1',
    date: '2026-10-04',
    serviceType: 'Sunday 1st Service (Breakthrough Service)',
    startTime: '06:30 AM',
    endTime: '09:40 AM',
    presidingMinister: 'Rev. Emmanuel Quayson',
    preacher: 'Pastor David Gaisie',
    sermonTopic: 'The Power of Praise in Warfare',
    bibleReference: '2 Chronicles 20:15-22',
    headcounts: {
      men: 81,
      women: 139,
      youth: 75,
      children: 50,
      firstTimers: 14,
      total: 359,
    },
    rollCallMemberIds: ['mem-001', 'mem-002', 'mem-003', 'mem-004', 'mem-005', 'mem-006', 'mem-007'],
    memberAttendanceStatus: {
      'mem-001': 'present',
      'mem-002': 'present',
      'mem-003': 'present',
      'mem-004': 'present',
      'mem-005': 'present',
      'mem-006': 'present',
      'mem-007': 'present',
    },
    firstTimersList: [],
    recordedBy: 'Deaconess Akosua Baidoo',
    verifiedBy: 'Rev. Emmanuel Quayson',
    notes: 'Thanksgiving service for the new month of October.',
    createdAt: '2026-10-04T09:50:00.000Z',
    updatedAt: '2026-10-04T09:50:00.000Z',
  },
];

export class StorageService {
  public static getMembers(): Member[] {
    try {
      const data = localStorage.getItem(MEMBERS_KEY);
      if (data) {
        const parsed: Member[] = JSON.parse(data);
        return parsed.map(m => ({
          ...m,
          ageCategory: m.ageCategory || (m.ageGroup === 'Child' ? 'Child' : 'Adult'),
        }));
      }
    } catch (e) {
      console.error('Error reading members from localStorage', e);
    }
    // Return empty array when clean/reset — never re-insert sample data automatically
    return [];
  }

  public static saveMembers(members: Member[]): void {
    const sanitized = members.map(m => ({
      ...m,
      ageCategory: m.ageCategory || (m.ageGroup === 'Child' ? 'Child' : 'Adult'),
    }));
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(sanitized));
  }

  public static addMember(memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Member {
    const members = this.getMembers();
    const id = 'mem-' + Date.now();
    const now = new Date().toISOString();
    const newMember: Member = {
      ...memberData,
      ageCategory: memberData.ageCategory || (memberData.ageGroup === 'Child' ? 'Child' : 'Adult'),
      id,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newMember, ...members];
    this.saveMembers(updated);

    // Persist to server backend asynchronously
    try {
      fetch('/api/church/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member: newMember }),
      }).catch(err => console.warn('Could not sync member with server backend:', err));
    } catch {
      // offline / client-only mode
    }

    return newMember;
  }

  public static updateMember(id: string, updates: Partial<Member>): Member | null {
    const members = this.getMembers();
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return null;

    const updatedMember: Member = {
      ...members[index],
      ...updates,
      ageCategory: updates.ageCategory || members[index].ageCategory || (updates.ageGroup === 'Child' ? 'Child' : 'Adult'),
      updatedAt: new Date().toISOString(),
    };
    members[index] = updatedMember;
    this.saveMembers(members);

    // Persist update to server backend
    try {
      fetch(`/api/church/members/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMember),
      }).catch(err => console.warn('Could not sync member update with server backend:', err));
    } catch {
      // offline / client-only mode
    }

    return updatedMember;
  }

  public static deleteMember(id: string): boolean {
    const members = this.getMembers();
    const filtered = members.filter(m => m.id !== id);
    if (filtered.length === members.length) return false;
    this.saveMembers(filtered);

    // Persist delete to server backend
    try {
      fetch(`/api/church/members/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }).catch(err => console.warn('Could not sync member deletion with server backend:', err));
    } catch {
      // offline / client-only mode
    }

    return true;
  }

  public static getAttendanceRecords(): AttendanceRecord[] {
    try {
      const data = localStorage.getItem(ATTENDANCE_KEY);
      if (data) {
        const parsed: AttendanceRecord[] = JSON.parse(data);
        return parsed.map(rec => {
          if (!rec.memberAttendanceStatus && rec.rollCallMemberIds) {
            const statusMap: Record<string, 'present' | 'absent'> = {};
            rec.rollCallMemberIds.forEach(id => {
              statusMap[id] = 'present';
            });
            return { ...rec, memberAttendanceStatus: statusMap };
          }
          return rec;
        });
      }
    } catch (e) {
      console.error('Error reading attendance from localStorage', e);
    }
    // Return empty array when clean/reset — never re-insert sample data automatically
    return [];
  }

  public static saveAttendanceRecords(records: AttendanceRecord[]): void {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
  }

  public static addAttendanceRecord(recordData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): AttendanceRecord {
    const records = this.getAttendanceRecords();
    const id = 'att-' + recordData.date + '-' + Date.now();
    const now = new Date().toISOString();
    const newRecord: AttendanceRecord = {
      ...recordData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newRecord, ...records];
    this.saveAttendanceRecords(updated);

    // Persist to server backend asynchronously
    try {
      fetch('/api/church/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record: newRecord }),
      }).catch(err => console.warn('Could not sync attendance record with server backend:', err));
    } catch {
      // offline / client-only mode
    }

    return newRecord;
  }

  public static updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): AttendanceRecord | null {
    const records = this.getAttendanceRecords();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;

    const updatedRecord: AttendanceRecord = {
      ...records[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    records[index] = updatedRecord;
    this.saveAttendanceRecords(records);

    // Persist to server backend
    try {
      fetch(`/api/church/attendance/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecord),
      }).catch(err => console.warn('Could not sync attendance update with server backend:', err));
    } catch {
      // offline / client-only mode
    }

    return updatedRecord;
  }

  public static deleteAttendanceRecord(id: string): boolean {
    const records = this.getAttendanceRecords();
    const filtered = records.filter(r => r.id !== id);
    if (filtered.length === records.length) return false;
    this.saveAttendanceRecords(filtered);

    // Persist delete to server backend
    try {
      fetch(`/api/church/attendance/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }).catch(err => console.warn('Could not sync attendance delete with server backend:', err));
    } catch {
      // offline / client-only mode
    }

    return true;
  }

  public static getBranchSettings(): ChurchBranchSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_CHURCH_SETTINGS));
    return DEFAULT_CHURCH_SETTINGS;
  }

  public static saveBranchSettings(settings: ChurchBranchSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  public static exportDatabaseBackup(): string {
    const backup = {
      churchName: 'House of Power Ministry International Church',
      branch: 'Mankessim Central Branch',
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
      members: this.getMembers(),
      attendance: this.getAttendanceRecords(),
      settings: this.getBranchSettings(),
    };
    return JSON.stringify(backup, null, 2);
  }

  public static importDatabaseBackup(jsonString: string): { success: boolean; message: string; count?: { members: number; attendance: number } } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.members || !Array.isArray(data.members) || !data.attendance || !Array.isArray(data.attendance)) {
        return { success: false, message: 'Invalid backup format. Missing members or attendance datasets.' };
      }

      this.saveMembers(data.members);
      this.saveAttendanceRecords(data.attendance);
      if (data.settings) {
        this.saveBranchSettings(data.settings);
      }

      // Sync restore to server
      try {
        fetch('/api/church/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ backup: data }),
        }).catch(err => console.warn('Server restore sync warning:', err));
      } catch {
        // offline
      }

      return {
        success: true,
        message: 'Church database restored successfully.',
        count: {
          members: data.members.length,
          attendance: data.attendance.length,
        },
      };
    } catch (err) {
      return { success: false, message: 'JSON parsing failed: ' + (err instanceof Error ? err.message : String(err)) };
    }
  }

  /**
   * Reset Church Operational Records Afresh
   * Clears member records and attendance history completely.
   * Preserves: App source code, design, logo, lion background, admin accounts, SMS settings, branch settings.
   */
  public static async resetChurchOperationalRecords(confirmed: boolean): Promise<{
    success: boolean;
    backupSnapshotJson: string;
    message: string;
  }> {
    if (!confirmed) {
      throw new Error('Explicit confirmation is required before resetting church records.');
    }

    // 1. Generate full safety backup before clearing
    const backupSnapshotJson = this.exportDatabaseBackup();

    // 2. Clear local storage records
    localStorage.setItem(MEMBERS_KEY, JSON.stringify([]));
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify([]));

    // 3. Clear temporary drafts
    try {
      sessionStorage.removeItem('hop_sunday_attendance_draft');
      sessionStorage.removeItem('hop_member_reg_draft');
    } catch {
      // ignore
    }

    // 4. Send reset command to server to wipe server files as well
    try {
      await fetch('/api/church/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed: true }),
      });
    } catch (err) {
      console.warn('Server reset API warning:', err);
    }

    return {
      success: true,
      backupSnapshotJson,
      message: 'Church operational records successfully cleared and reset to 0.',
    };
  }

  public static resetToSeedData(): void {
    // Only available if administrator specifically requests demo seeding
    localStorage.setItem(MEMBERS_KEY, JSON.stringify([]));
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify([]));
  }
}

