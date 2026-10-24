import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/auth';
import { KeyRound, Shield, User, CheckCircle2, AlertCircle, Lock, Eye, EyeOff, UserPlus, Users } from 'lucide-react';
import { AdminUser } from '../../types/church';

export const AdminAccountSettings: React.FC = () => {
  const { currentUser, createAdminAccount } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New admin creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newConfirmPass, setNewConfirmPass] = useState('');
  const [newRole, setNewRole] = useState<AdminUser['role']>('Church Clerk');
  const [adminList, setAdminList] = useState<AdminUser[]>(() => AuthService.getAdminUsers());

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!currentUser) return;

    if (newPassword.length < 8) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await AuthService.updatePassword(currentUser.id, currentPassword, newPassword);
      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: 'Administrator password successfully updated with cryptographic salt protection!',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setStatusMessage({
          type: 'error',
          text: result.error || 'Failed to update administrator password.',
        });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'An unexpected error occurred during password hashing.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPass !== newConfirmPass) {
      setStatusMessage({ type: 'error', text: 'Password and confirmation password do not match.' });
      return;
    }

    try {
      const res = await createAdminAccount({
        fullName: newFullName,
        username: newUsername,
        email: newEmail,
        password: newPass,
        role: newRole,
      });

      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Administrator account for "${newFullName}" successfully created and saved!`,
        });
        setAdminList(AuthService.getAdminUsers());
        setShowCreateModal(false);
        setNewFullName('');
        setNewUsername('');
        setNewEmail('');
        setNewPass('');
        setNewConfirmPass('');
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to create account.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'An error occurred while creating administrator account.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-blue-950 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-600" />
            <span>Administrator Security & Account Settings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage administrative credentials, cryptographic key security, and active sessions
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
        >
          <UserPlus className="w-4 h-4 text-amber-400" />
          <span>CREATE ADMIN ACCOUNT</span>
        </button>
      </div>

      {statusMessage && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Administrator Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-sm text-blue-950 border-b border-slate-100 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-700" />
            <span>Active Administrator Session</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Officer Name</span>
              <span className="font-bold text-slate-900 text-sm">{currentUser?.fullName || 'Rev. Administrator'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Official Email</span>
              <span className="font-mono text-slate-800">{currentUser?.email || 'admin@houseofpower.org'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Role</span>
              <span className="font-semibold text-blue-900">{currentUser?.role || 'Super Administrator'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Session Logged At</span>
              <span className="font-mono text-slate-600">{currentUser?.lastLogin || 'Current active session'}</span>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-sm text-blue-950 border-b border-slate-100 pb-2 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>Update Administrator Password</span>
          </h3>

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full p-2.5 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                New Password (Minimum 8 Characters) *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter strong new password"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Confirm New Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold shadow-md transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Hashing & Updating...' : 'Update & Hash Password'}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Uses Web Crypto SHA-256 with an isolated 128-bit cryptographic salt.
            </p>
          </form>
        </div>
      </div>

      {/* List of Enrolled Church Administrators */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-serif font-bold text-sm text-blue-950 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-700" />
            <span>Enrolled Church Administrators & Staff ({adminList.length})</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            Salted PBKDF2/SHA-256 Protected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {adminList.map((admin) => (
            <div key={admin.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{admin.fullName}</span>
                <span className="text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-semibold">
                  {admin.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-mono truncate">{admin.email}</p>
              <p className="text-[10px] text-slate-400">Username: <code className="text-slate-700 font-semibold">{admin.username}</code></p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create Admin Account */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-300" />
                <span>CREATE ADMIN ACCOUNT</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-blue-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewAdmin} className="p-5 text-xs space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={e => setNewFullName(e.target.value)}
                  placeholder="e.g. Elder Emmanuel Darko"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    placeholder="edarko"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role *</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Church Clerk">Church Clerk</option>
                    <option value="Ushering Head">Ushering Head</option>
                    <option value="Pastor">Pastor</option>
                    <option value="Super Administrator">Super Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="edarko@houseofpower.org"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password (Min 8 characters) *</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={newConfirmPass}
                  onChange={e => setNewConfirmPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-900 text-white rounded-lg font-bold flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
