import React, { useState } from 'react';
import { ChurchImage } from '../common/ChurchImage';
import { NavBarControls } from '../common/NavBarControls';
import { Shield, Lock, User, ArrowLeft, AlertCircle, KeyRound, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NATURE_ASSETS, LION_BACKGROUND } from '../../constants/natureThemes';

interface AdminLoginProps {
  onSuccess: () => void;
  onGoToCreateAdmin: () => void;
  onBackToHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onSuccess,
  onGoToCreateAdmin,
  onBackToHome,
}) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your administrator username or email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your administrator password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(identifier, password);
      if (result.success) {
        onSuccess();
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
        setIsLoading(false);
      }
    } catch {
      setErrorMessage('An unexpected authentication error occurred.');
      setIsLoading(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setIdentifier('admin@houseofpower.org');
    setPassword('HopAdmin2026!');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-800">

      {/* Navigation Bar & Create Admin Account button */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4 flex items-center justify-between">
        <NavBarControls variant="dark" showHome={true} />

        <button
          type="button"
          onClick={onGoToCreateAdmin}
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors bg-blue-950/80 border border-amber-400/50 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>CREATE ADMIN ACCOUNT</span>
        </button>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Church Logo & Title - Rendered directly without shapes, circular frames, or backgrounds */}
        <div className="text-center mb-6">
          <div className="max-w-[220px] max-h-28 mx-auto mb-3 flex items-center justify-center bg-transparent">
            <ChurchImage
              imageKey="primaryLogo"
              alt="House of Power Ministry International Church Logo"
              className="max-h-24 w-auto object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]"
              priority={true}
            />
          </div>

          <h2 className="text-2xl font-serif font-black text-white tracking-tight uppercase drop-shadow-md">
            ADMIN LOGIN
          </h2>
          <p className="text-xs text-amber-300 font-serif font-semibold mt-0.5">
            House of Power Ministry International • Mankessim, Ghana
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border-2 border-amber-400/40 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {errorMessage && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Administrator Username or Email
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@houseofpower.org"
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Administrator Password
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
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
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-70 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>LOG IN</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Access Credentials helper for review / initial setup */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-600">
                Initial Setup Credentials:
              </span>
              <button
                type="button"
                onClick={handleFillDemoCredentials}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700 space-y-1">
              <div>Email: <strong className="text-blue-950 font-bold">admin@houseofpower.org</strong></div>
              <div>Password: <strong className="text-blue-950 font-bold">HopAdmin2026!</strong></div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center">
              <button
                type="button"
                onClick={onGoToCreateAdmin}
                className="text-xs font-bold text-blue-900 hover:text-blue-950 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-amber-600" />
                <span>Need an account? CREATE ADMIN ACCOUNT</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
