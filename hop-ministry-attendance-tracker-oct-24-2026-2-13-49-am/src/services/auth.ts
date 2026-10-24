/**
 * House of Power Ministry International Church
 * Authentication & Security Service
 * 
 * Rules:
 * - Passwords are never stored in plain text (uses SHA-256 with cryptographic salt)
 * - Identifies browser-local vs backend database auth
 * - Secure Administrator Account Creation with validation & duplicate detection
 */

import { AdminUser } from '../types/church';

const AUTH_STORAGE_KEY = 'hop_church_admin_users';
const CURRENT_SESSION_KEY = 'hop_church_current_session';

// Helper to hash password with salt using Web Crypto API
export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate random salt
export function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initial default administrative user credentials for initial access:
// Email: admin@houseofpower.org
// Default Initial Password: HopAdmin2026!
// Salt and hash pre-calculated for quick initial load:
const INITIAL_ADMIN: AdminUser = {
  id: 'admin-hop-001',
  username: 'admin',
  email: 'admin@houseofpower.org',
  fullName: 'Rev. Administrator',
  role: 'Super Administrator',
  salt: 'c4b8e3901a8f276495b6a71e42d38c11',
  // SHA-256 of "HopAdmin2026!c4b8e3901a8f276495b6a71e42d38c11"
  passwordHash: 'c4e36582531da0b64be812bbcb89bfa9da137c87c956c3d4205f43a05175b9f9',
  lastLogin: new Date().toISOString(),
};

export class AuthService {
  public static getAdminUsers(): AdminUser[] {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    const defaultList = [INITIAL_ADMIN];
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultList));
    return defaultList;
  }

  public static async authenticate(identifier: string, passwordAttempt: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    const users = this.getAdminUsers();
    const cleanId = identifier.trim().toLowerCase();

    const user = users.find(u => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId);
    if (!user) {
      return { success: false, error: 'Invalid administrator email or username.' };
    }

    const calculatedHash = await hashPasswordWithSalt(passwordAttempt, user.salt);
    if (calculatedHash !== user.passwordHash) {
      return { success: false, error: 'Incorrect administrator password. Please verify credentials.' };
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));

    // Save session
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      token: 'client_session_' + Date.now(),
      loginTime: new Date().toISOString(),
    }));

    return { success: true, user };
  }

  public static async createAdminAccount(params: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    role?: AdminUser['role'];
  }): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    const fullName = params.fullName.trim();
    const username = params.username.trim().toLowerCase();
    const email = params.email.trim().toLowerCase();
    const password = params.password;

    if (!fullName) {
      return { success: false, error: "Please enter the administrator's full name." };
    }

    if (!username || username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long.' };
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid administrator email address.' };
    }

    if (!password || password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    const users = this.getAdminUsers();

    // Check for duplicate username or email
    const exists = users.some(
      u => u.username.toLowerCase() === username || u.email.toLowerCase() === email
    );

    if (exists) {
      return {
        success: false,
        error: 'An administrator account with this username or email already exists.',
      };
    }

    const salt = generateSalt();
    const passwordHash = await hashPasswordWithSalt(password, salt);

    const newAdmin: AdminUser = {
      id: 'admin-' + Date.now(),
      fullName,
      username,
      email,
      role: params.role || 'Church Clerk',
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newAdmin);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));

    return { success: true, user: newAdmin };
  }

  public static getCurrentSession(): AdminUser | null {
    try {
      const session = localStorage.getItem(CURRENT_SESSION_KEY);
      if (session) {
        return JSON.parse(session);
      }
    } catch {
      return null;
    }
    return null;
  }

  public static logout(): void {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  }

  public static async updatePassword(userId: string, currentPass: string, newPass: string): Promise<{ success: boolean; error?: string }> {
    const users = this.getAdminUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'Administrator user not found.' };
    }

    const currentHash = await hashPasswordWithSalt(currentPass, user.salt);
    if (currentHash !== user.passwordHash) {
      return { success: false, error: 'Current password verification failed.' };
    }

    if (newPass.length < 8) {
      return { success: false, error: 'New password must contain at least 8 characters.' };
    }

    const newSalt = generateSalt();
    const newHash = await hashPasswordWithSalt(newPass, newSalt);

    user.salt = newSalt;
    user.passwordHash = newHash;
    user.updatedAt = new Date().toISOString();

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
    return { success: true };
  }
}
