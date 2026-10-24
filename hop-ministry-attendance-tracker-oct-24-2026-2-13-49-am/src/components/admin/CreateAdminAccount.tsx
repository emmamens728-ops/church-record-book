import React, { useState } from 'react';
import { ChurchImage } from '../common/ChurchImage';
import { NavBarControls } from '../common/NavBarControls';
import { Shield, Lock, User, Mail, ArrowLeft, AlertCircle, CheckCircle2, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NATURE_ASSETS, LION_BACKGROUND } from '../../constants/natureThemes';

interface CreateAdminAccountProps {
  onSuccess: () => void;
  onGoToLogin: () => void;
  onBackToHome: () => void;
}

export const CreateAdminAccount: React.FC<CreateAdminAccountProps> = ({
  onSuccess,
  onGoToLogin,
  onBackToHome,
}) => {
  const { createAdminAccount } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'Church Clerk' | 'Ushering Head' | 'Pastor' | 'Super Administrator'>('Church Clerk');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("Please enter the administrator's full name.");
      return;
    }

    if (!username.trim() || username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter an official administrator email address.');
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password and confirmation password do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await createAdminAccount({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        role,
      });

      if (result.success) {
        setSuccessMessage('Administrator account created successfully! You can now log in.');
        setFullName('');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        // after brief moment, redirect to login
        setTimeout(() => {
          onSuccess();
        }, 1800);
      } else {
        setErrorMessage(result.error || 'Failed to create administrator account.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during account creation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-10 sm:px-6 lg:px-8 text-slate-800">

      {/* Navigation options */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4 mb-3 flex items-center justify-between">
        <NavBarControls variant="dark" showHome={true} />

        <button
          type="button"
          onClick={onGoToLogin}
          className="text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors bg-blue-950/80 px-3 py-1.5 rounded-lg border border-amber-400/50 cursor-pointer shadow-xs"
        >
          Already have an account? Sign in
        </button>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Church Logo - Rendered directly without shapes, circular frames, or backgrounds */}
        <div className="text-center mb-5">
          <div className="max-w-[200px] max-h-28 mx-auto mb-3 flex items-center justify-center bg-transparent">
            <ChurchImage
              imageKey="primaryLogo"
              alt="House of Power Ministry International Logo"
              className="max-h-24 w-auto object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]"
              priority={true}
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight uppercase drop-shadow-md">
            CREATE ADMIN ACCOUNT
          </h2>
          <p className="text-xs text-amber-300 font-serif font-semibold mt-0.5">
            House of Power Ministry International • Mankessim, Ghana
          </p>
        </div>

        {/* Account Creation Card */}
        <div className="bg-white/95 backdrop-blur-md py-7 px-6 shadow-2xl rounded-2xl border-2 border-amber-400/40 sm:px-8 space-y-4">
          {errorMessage && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              role="alert"
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Administrator Full Name *
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Deaconess Mary Mensah"
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Username *
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. mmensah"
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Administrative Duty *
                </label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                >
                  <option value="Church Clerk">Church Clerk</option>
                  <option value="Ushering Head">Ushering Head</option>
                  <option value="Pastor">Pastor</option>
                  <option value="Super Administrator">Super Administrator</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Official Email Address *
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@houseofpower.org"
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Password (Min 8 characters) *
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Confirm Password *
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-70 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Secure Administrator Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-amber-400" />
                    <span>Create Administrator Account</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-3 border-t border-slate-200 text-center">
            <p className="text-[11px] text-slate-500">
              Passcodes are never stored in plain text. Hashed with SHA-256 and unique 128-bit cryptographic salts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
