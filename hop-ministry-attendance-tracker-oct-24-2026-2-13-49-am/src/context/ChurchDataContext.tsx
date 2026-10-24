/**
 * House of Power Ministry International Church
 * Church Data Context: State & CRUD operations for members, attendance, and branch settings
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Member, AttendanceRecord, ChurchBranchSettings } from '../types/church';
import { StorageService } from '../services/storage';

interface ChurchDataContextType {
  members: Member[];
  attendanceRecords: AttendanceRecord[];
  branchSettings: ChurchBranchSettings;
  isLoading: boolean;
  refreshData: () => void;
  // Member operations
  addMember: (data: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Member>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<Member | null>;
  deleteMember: (id: string) => Promise<boolean>;
  // Attendance operations
  addAttendanceRecord: (data: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<AttendanceRecord>;
  updateAttendanceRecord: (id: string, updates: Partial<AttendanceRecord>) => Promise<AttendanceRecord | null>;
  deleteAttendanceRecord: (id: string) => Promise<boolean>;
  // Settings & Backup
  updateBranchSettings: (settings: ChurchBranchSettings) => void;
  exportBackup: () => string;
  restoreBackup: (jsonString: string) => { success: boolean; message: string; count?: { members: number; attendance: number } };
  resetDemoData: () => void;
  resetOperationalRecords: (confirmed: boolean) => Promise<{ success: boolean; backupSnapshotJson: string; message: string }>;
}

const ChurchDataContext = createContext<ChurchDataContextType | undefined>(undefined);

export const ChurchDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [branchSettings, setBranchSettings] = useState<ChurchBranchSettings>(StorageService.getBranchSettings());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshData = useCallback(() => {
    setIsLoading(true);
    try {
      const loadedMembers = StorageService.getMembers();
      const loadedAttendance = StorageService.getAttendanceRecords();
      const loadedSettings = StorageService.getBranchSettings();
      setMembers(loadedMembers);
      setAttendanceRecords(loadedAttendance);
      setBranchSettings(loadedSettings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();

    // Async sync with server files on mount
    fetch('/api/church/members')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data?.members)) {
          const local = StorageService.getMembers();
          if (data.members.length > 0 && local.length === 0) {
            StorageService.saveMembers(data.members);
            setMembers(data.members);
          }
        }
      })
      .catch(() => {});

    fetch('/api/church/attendance')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data?.records)) {
          const local = StorageService.getAttendanceRecords();
          if (data.records.length > 0 && local.length === 0) {
            StorageService.saveAttendanceRecords(data.records);
            setAttendanceRecords(data.records);
          }
        }
      })
      .catch(() => {});
  }, [refreshData]);

  const addMember = async (data: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<Member> => {
    const created = StorageService.addMember(data);
    refreshData();
    return created;
  };

  const updateMember = async (id: string, updates: Partial<Member>): Promise<Member | null> => {
    const updated = StorageService.updateMember(id, updates);
    refreshData();
    return updated;
  };

  const deleteMember = async (id: string): Promise<boolean> => {
    const success = StorageService.deleteMember(id);
    if (success) {
      refreshData();
    }
    return success;
  };

  const addAttendanceRecord = async (data: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AttendanceRecord> => {
    const created = StorageService.addAttendanceRecord(data);
    refreshData();
    return created;
  };

  const updateAttendanceRecord = async (id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | null> => {
    const updated = StorageService.updateAttendanceRecord(id, updates);
    refreshData();
    return updated;
  };

  const deleteAttendanceRecord = async (id: string): Promise<boolean> => {
    const success = StorageService.deleteAttendanceRecord(id);
    if (success) {
      refreshData();
    }
    return success;
  };

  const updateBranchSettings = (settings: ChurchBranchSettings) => {
    StorageService.saveBranchSettings(settings);
    setBranchSettings(settings);
  };

  const exportBackup = (): string => {
    return StorageService.exportDatabaseBackup();
  };

  const restoreBackup = (jsonString: string) => {
    const result = StorageService.importDatabaseBackup(jsonString);
    if (result.success) {
      refreshData();
    }
    return result;
  };

  const resetDemoData = () => {
    StorageService.resetToSeedData();
    refreshData();
  };

  const resetOperationalRecords = async (confirmed: boolean): Promise<{
    success: boolean;
    backupSnapshotJson: string;
    message: string;
  }> => {
    const result = await StorageService.resetChurchOperationalRecords(confirmed);
    setMembers([]);
    setAttendanceRecords([]);
    refreshData();
    return result;
  };

  return (
    <ChurchDataContext.Provider
      value={{
        members,
        attendanceRecords,
        branchSettings,
        isLoading,
        refreshData,
        addMember,
        updateMember,
        deleteMember,
        addAttendanceRecord,
        updateAttendanceRecord,
        deleteAttendanceRecord,
        updateBranchSettings,
        exportBackup,
        restoreBackup,
        resetDemoData,
        resetOperationalRecords,
      }}
    >
      {children}
    </ChurchDataContext.Provider>
  );
};

export const useChurchData = (): ChurchDataContextType => {
  const context = useContext(ChurchDataContext);
  if (!context) {
    throw new Error('useChurchData must be used within a ChurchDataProvider');
  }
  return context;
};
