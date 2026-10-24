import React from 'react';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

interface NavBarControlsProps {
  variant?: 'light' | 'dark' | 'transparent';
  showHome?: boolean;
  className?: string;
}

export const NavBarControls: React.FC<NavBarControlsProps> = ({
  variant = 'dark',
  showHome = true,
  className = '',
}) => {
  const { canGoBack, canGoForward, goBack, goForward, goToHome, currentView } = useNavigation();

  // If we are on splash screen, don't show controls
  if (currentView === 'initial_splash') return null;

  const isDark = variant === 'dark';

  const baseBtnStyle = `inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 sm:px-3.5 rounded-xl text-xs font-semibold transition-all duration-150 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400/50`;

  const activeBackStyle = isDark
    ? 'bg-blue-900/80 hover:bg-blue-800 text-amber-300 hover:text-amber-200 border border-amber-400/40 shadow-xs'
    : 'bg-white/90 hover:bg-white text-blue-950 border border-slate-300 shadow-xs hover:border-amber-400';

  const disabledBackStyle = isDark
    ? 'bg-blue-950/40 text-blue-400/40 border border-blue-900/30 cursor-not-allowed opacity-50'
    : 'bg-slate-100/60 text-slate-400 border border-slate-200/50 cursor-not-allowed opacity-50';

  return (
    <div className={`inline-flex items-center gap-1.5 sm:gap-2 ${className}`} role="navigation" aria-label="Page history navigation">
      {/* 1. Backward Navigation Button */}
      <button
        type="button"
        onClick={goBack}
        disabled={!canGoBack}
        className={`${baseBtnStyle} ${canGoBack ? activeBackStyle : disabledBackStyle}`}
        title={canGoBack ? 'Go back to previous page' : 'No previous page in history'}
        aria-label="Go backward"
      >
        <ChevronLeft className="w-4 h-4 text-amber-400 stroke-[2.5]" />
        <span className="font-sans font-bold tracking-wider text-[11px] sm:text-xs">BACK</span>
      </button>

      {/* 2. Forward Navigation Button */}
      <button
        type="button"
        onClick={goForward}
        disabled={!canGoForward}
        className={`${baseBtnStyle} ${canGoForward ? activeBackStyle : disabledBackStyle}`}
        title={canGoForward ? 'Go forward to next page' : 'No forward page in history'}
        aria-label="Go forward"
      >
        <span className="font-sans font-bold tracking-wider text-[11px] sm:text-xs">FORWARD</span>
        <ChevronRight className="w-4 h-4 text-amber-400 stroke-[2.5]" />
      </button>

      {/* 3. Direct Home Button (when not on homepage) */}
      {showHome && currentView !== 'homepage' && (
        <button
          type="button"
          onClick={goToHome}
          className={`${baseBtnStyle} ${
            isDark
              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50'
              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
          }`}
          title="Return to Church Homepage"
          aria-label="Return to Homepage"
        >
          <Home className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Home</span>
        </button>
      )}
    </div>
  );
};
