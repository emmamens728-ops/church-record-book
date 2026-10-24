import React, { useEffect, useState, useRef } from 'react';
import { ChurchImage } from './ChurchImage';
import { FastForward, Sparkles } from 'lucide-react';
import { NATURE_ASSETS, LION_BACKGROUND } from '../../constants/natureThemes';

interface SplashScreenProps {
  durationSeconds?: number;
  message?: string;
  subtext?: string;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  durationSeconds = 20,
  message = 'Loading...',
  subtext = 'House of Power Ministry International Church • Mankessim, Ghana',
  onFinish,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(durationSeconds);
  const finishedRef = useRef(false);

  useEffect(() => {
    finishedRef.current = false;
    setSecondsRemaining(durationSeconds);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!finishedRef.current) {
            finishedRef.current = true;
            setTimeout(() => {
              onFinish();
            }, 50);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [durationSeconds, onFinish]);

  const handleSkip = () => {
    if (!finishedRef.current) {
      finishedRef.current = true;
      onFinish();
    }
  };

  const progressPercent = ((durationSeconds - secondsRemaining) / durationSeconds) * 100;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden relative"
    >

      {/* Top branding header */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between text-xs pt-2">
        <div className="flex items-center gap-1.5 text-amber-300 font-serif font-bold text-[11px] tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Official Portal Access</span>
        </div>
        <button
          onClick={handleSkip}
          className="flex items-center gap-1 text-[11px] font-semibold text-amber-200 hover:text-white bg-blue-900/80 hover:bg-blue-800 border border-amber-400/50 px-3 py-1 rounded-full transition-all shadow-md cursor-pointer"
          title="Skip loading wait (Review mode)"
        >
          <FastForward className="w-3.5 h-3.5 text-amber-400" />
          <span>Skip ({secondsRemaining}s)</span>
        </button>
      </div>

      {/* Center Church Logo & Primary Loading Text */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto w-full max-w-md text-center">
        {/* Original Logo Displayed Directly - Pure transparent display, NO box shadow on container */}
        <div className="w-auto max-w-[280px] sm:max-w-[340px] max-h-56 sm:max-h-64 mb-6 flex items-center justify-center bg-transparent">
          <ChurchImage
            imageKey="primaryLogo"
            alt="House of Power Ministry International Church Logo"
            className="w-auto h-auto max-w-full max-h-56 sm:max-h-64 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
            showFallbackUploadPrompt={true}
            priority={true}
          />
        </div>

        {/* Loading text as explicitly requested: "Loading..." */}
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-wider mb-2 uppercase drop-shadow-md">
          {message}
        </h1>

        <p className="text-xs sm:text-sm text-blue-100 max-w-xs font-medium leading-relaxed drop-shadow-xs">
          {subtext}
        </p>

        {/* 20-second smooth gold/blue progress bar */}
        <div className="w-full max-w-xs mt-7">
          <div className="h-2 w-full bg-blue-950/80 rounded-full overflow-hidden border border-amber-400/40 p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 transition-all duration-1000 ease-linear rounded-full shadow-xs"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-blue-200 mt-2 font-medium">
            <span className="font-serif italic text-amber-300">Mankessim, Ghana</span>
            <span className="font-mono text-amber-300 font-bold">{secondsRemaining}s</span>
          </div>
        </div>
      </div>

      {/* Footer Church Motto */}
      <div className="relative z-10 w-full max-w-md text-center pb-2">
        <p className="text-xs font-serif text-amber-300 font-bold tracking-widest uppercase drop-shadow-xs">
          “Heaven Oo!!! Ɛho ɛna Yɛpɛ”
        </p>
        <p className="text-[10px] text-blue-200 mt-0.5">
          House of Power Ministry International • Central Region, Ghana
        </p>
      </div>
    </div>
  );
};
