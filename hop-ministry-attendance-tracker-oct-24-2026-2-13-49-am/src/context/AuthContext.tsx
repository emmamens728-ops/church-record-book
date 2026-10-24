/**
 * House of Power Ministry International Church
 * Auth Context: Protected flows & Administrator session
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types/church';
import { AuthService } from '../services/auth';

interface AuthContextType {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  createAdminAccount: (params: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    role?: AdminUser['role'];
  }) => Promise<{ success: boolean; user?: AdminUser; error?: string }>;
  logout: () => void;
  // Flow access authorization
  isRecordBookAuthorized: boolean;
  authorizeRecordBookSession: () => void;
  revokeRecordBookSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isRecordBookAuthorized, setIsRecordBookAuthorized] = useState<boolean>(() => {
    return sessionStorage.getItem('hop_recordbook_authorized') === 'true';
  });

  useEffect(() => {
    const session = AuthService.getCurrentSession();
    if (session) {
      setCurrentUser(session);
    }
  }, []);

  const login = async (identifier: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const result = await AuthService.authenticate(identifier, pass);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      // Automatically authorized for record book when logged in as admin
      setIsRecordBookAuthorized(true);
      sessionStorage.setItem('hop_recordbook_authorized', 'true');
      return { success: true };
    }
    return { success: false, error: result.error || 'Authentication failed' };
  };

  const createAdminAccount = async (params: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    role?: AdminUser['role'];
  }) => {
    return await AuthService.createAdminAccount(params);
  };

  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setIsRecordBookAuthorized(false);
    sessionStorage.removeItem('hop_recordbook_authorized');
  };

  const authorizeRecordBookSession = () => {
    setIsRecordBookAuthorized(true);
    sessionStorage.setItem('hop_recordbook_authorized', 'true');
  };

  const revokeRecordBookSession = () => {
    setIsRecordBookAuthorized(false);
    sessionStorage.removeItem('hop_recordbook_authorized');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        createAdminAccount,
        logout,
        isRecordBookAuthorized,
        authorizeRecordBookSession,
        revokeRecordBookSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
