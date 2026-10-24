/**
 * House of Power Ministry International Church, Mankessim, Ghana
 * Core TypeScript Data Definitions
 */

export type Gender = 'Male' | 'Female' | 'Prefer not to say';

export type AgeCategory = 'Child' | 'Adult';

export type AgeGroup = 'Adult' | 'Youth' | 'Child';

export type MaritalStatus = 'Single' | 'Married' | 'Widowed' | 'Divorced';

export type BaptismStatus = 'Baptized (Immersion)' | 'Not Baptized' | 'Scheduled';

export type Department =
  | 'Choir / Praise & Worship'
  | 'Ushering & Protocol'
  | 'Evangelism & Outreach'
  | 'Prayer Force & Intercession'
  | 'Media & Technical'
  | 'Sunday School / Children Ministry'
  | 'Youth Ministry'
  | "Men's Ministry"
  | "Women's Ministry"
  | 'Welfare Committee'
  | 'None / General Congregation';

export type MemberStatus = 'Active' | 'Inactive' | 'Under Follow-up' | 'Transferred';

export interface Member {
  id: string;
  memberCode: string; // e.g. HOP-MKS-0104
  fullName: string;
  gender: Gender;
  ageCategory: AgeCategory; // Required: Child or Adult
  ageGroup?: AgeGroup;
  dateOfBirth?: string;
  phone: string;
  whatsappPhone?: string;
  email?: string;
  residentialAddress: string;
  hometownOrRegion?: string;
  occupation?: string;
  maritalStatus: MaritalStatus;
  department: Department;
  baptismStatus: BaptismStatus;
  dateJoined: string;
  status: MemberStatus;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ServiceType =
  | 'Sunday 1st Service (Breakthrough Service)'
  | 'Sunday 2nd Service (Power & Deliverance)'
  | 'Wednesday Midweek Prophetic & Miracle Service'
  | 'Friday All-Night Prayer & Deliverance'
  | 'Special Convention / Revivals'
  | 'Youth / Specialized Ministry Service';

export interface FirstTimer {
  id: string;
  fullName: string;
  gender: Gender;
  ageGroup: AgeGroup;
  phone: string;
  residentialArea: string;
  invitedBy?: string;
  prayerRequest?: string;
  followUpStatus: 'Pending' | 'Called' | 'Visited' | 'Integrated into Church' | 'Not Interested';
  assignedCounselor?: string;
  dateVisited: string;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  serviceType: ServiceType;
  startTime: string;
  endTime: string;
  presidingMinister: string;
  preacher: string;
  sermonTopic: string;
  bibleReference: string;
  headcounts: {
    men: number;
    women: number;
    youth: number;
    children: number;
    firstTimers: number;
    total: number;
  };
  rollCallMemberIds: string[]; // IDs of registered members marked present
  memberAttendanceStatus?: Record<string, 'present' | 'absent'>; // Full roll-call status mapping: Present / Absent
  firstTimersList: FirstTimer[];
  recordedBy: string;
  verifiedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChurchBranchSettings {
  churchName: string;
  branchName: string;
  location: string;
  motto: string;
  spiritualLeader: string;
  pastorInCharge: string;
  contactPhones: string[];
  contactEmail: string;
  postalAddress: string;
  servicesSchedule: {
    day: string;
    title: string;
    time: string;
  }[];
  departments: Department[];
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'Super Administrator' | 'Church Clerk' | 'Ushering Head' | 'Pastor';
  lastLogin?: string;
  passwordHash: string;
  salt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StorageStatus {
  mode: 'client_local_storage' | 'external_backend_pending';
  lastSyncedAt?: string;
  recordsCount: {
    members: number;
    attendance: number;
    firstTimers: number;
  };
  storageUsedBytes: number;
}
