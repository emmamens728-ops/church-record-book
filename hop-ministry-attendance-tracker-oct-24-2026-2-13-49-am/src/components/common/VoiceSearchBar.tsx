import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Search, X, Volume2, Globe, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

interface VoiceSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (term: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  autoFocus?: boolean;
}

export const VoiceSearchBar: React.FC<VoiceSearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search member name... 🎤 🔍',
  className = '',
  id = 'member-voice-search',
  autoFocus = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'info' | 'success' | 'error' | 'listening'>('info');
  const [showRetry, setShowRetry] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<string>('en-GH');
  const [isSupported, setIsSupported] = useState(true);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const recognitionRef = useRef<any>(null);
  const isStartingRef = useRef<boolean>(false);
  const isUserAbortRef = useRef<boolean>(false);
  const feedbackTimeoutRef = useRef<any>(null);
  const lastExecutedSearchRef = useRef<string>('');
  const isUnmountedRef = useRef<boolean>(false);

  // Helper to check if browser supports Web Speech API
  const getSpeechRecognitionClass = (): any => {
    if (typeof window === 'undefined') return null;
    return (
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition ||
      null
    );
  };

  // Helper to check if running in secure context
  const checkSecureContext = (): boolean => {
    if (typeof window === 'undefined') return true;
    if (window.isSecureContext) return true;
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || window.location.protocol === 'https:';
  };

  // Check browser support for Web Speech API on mount
  useEffect(() => {
    isUnmountedRef.current = false;
    const SpeechRecognition = getSpeechRecognitionClass();
    if (!SpeechRecognition) {
      setIsSupported(false);
    }

    return () => {
      isUnmountedRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort errors
        }
        recognitionRef.current = null;
      }
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const setFeedback = useCallback(
    (
      msg: string | null,
      type: 'info' | 'success' | 'error' | 'listening' = 'info',
      autoDismissMs: number = 5000,
      canRetry: boolean = false
    ) => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = null;
      }
      setSpeechFeedback(msg);
      setFeedbackType(type);
      setShowRetry(canRetry);

      if (msg && autoDismissMs > 0 && type !== 'listening' && !canRetry) {
        feedbackTimeoutRef.current = setTimeout(() => {
          if (!isUnmountedRef.current) {
            setSpeechFeedback(null);
            setShowRetry(false);
          }
        }, autoDismissMs);
      }
    },
    []
  );

  // Execute search callback safely and prevent duplicate queries
  const executeSearch = useCallback(
    (rawQuery: string) => {
      // Strip trailing punctuation often added by speech recognizers (e.g., "Kwame Mensah." -> "Kwame Mensah")
      const cleanedQuery = rawQuery.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim();
      if (!cleanedQuery) return;

      if (lastExecutedSearchRef.current === cleanedQuery) {
        return;
      }

      lastExecutedSearchRef.current = cleanedQuery;
      onChange(cleanedQuery);
      if (onSearch) {
        onSearch(cleanedQuery);
      }
    },
    [onChange, onSearch]
  );

  // Android Chrome Microphone Permission Resolver
  // Triggered on user tap: Checks permission state and prompts user via getUserMedia if needed
  const ensureMicrophonePermission = async (): Promise<boolean> => {
    // 1. Check secure context
    if (!checkSecureContext()) {
      setFeedback(
        'Voice search requires a secure HTTPS connection. Open the published HTTPS website and try again.',
        'error',
        8000,
        false
      );
      return false;
    }

    // 2. Check Permissions API if supported
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permissionStatus.state === 'denied') {
          setFeedback(
            'Microphone access is blocked. Allow microphone access for this website in Chrome site settings, then return here and tap the microphone again.',
            'error',
            0,
            true
          );
          return false;
        }
        if (permissionStatus.state === 'granted') {
          return true;
        }
      } catch {
        // Permissions query not supported or threw (e.g. in some iframe environments) - proceed to getUserMedia check
      }
    }

    // 3. For 'prompt' or unknown states on Android Chrome, trigger Chrome's native microphone prompt
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Cleanly stop and release all audio tracks immediately so Web Speech API has exclusive access
        stream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {
            // ignore
          }
        });
        return true;
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setFeedback(
            'Microphone access is blocked. Allow microphone access for this website in Chrome site settings, then return here and tap the microphone again.',
            'error',
            0,
            true
          );
          return false;
        }
        // Device without mic or hardware busy
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setFeedback(
            'No microphone device was detected. Keyboard typing is available.',
            'error',
            6000,
            false
          );
          return false;
        }
      }
    }

    // Fall back to SpeechRecognition direct attempt
    return true;
  };

  const startVoiceSearch = async () => {
    // Prevent overlapping simultaneous sessions
    if (isListening || isStartingRef.current) {
      return;
    }

    const SpeechRecognition = getSpeechRecognitionClass();

    if (!SpeechRecognition) {
      setFeedback(
        'Voice search is not supported in this browser. Please use the text search box.',
        'error',
        6000,
        false
      );
      return;
    }

    isStartingRef.current = true;
    isUserAbortRef.current = false;

    // Verify / request permission through the user tap action
    const hasPermission = await ensureMicrophonePermission();
    if (!hasPermission) {
      isStartingRef.current = false;
      return;
    }

    try {
      // Abort any existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = selectedLang;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        isStartingRef.current = false;
        setIsListening(true);
        setFeedback("Listening... Speak a member's name clearly (e.g. Kwame Mensah)", 'listening', 0);
      };

      recognition.onaudiostart = () => {
        setFeedback('Listening... Microphone active. Speak name now.', 'listening', 0);
      };

      recognition.onspeechstart = () => {
        setFeedback('Hearing speech... Converting to text...', 'listening', 0);
      };

      recognition.onresult = (event: any) => {
        if (!event.results || event.results.length === 0) return;

        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const candidateText = (finalTranscript || interimTranscript).trim();

        // Update search input in real time
        if (candidateText) {
          onChange(candidateText);
        }

        // Final recognition result executes search
        if (finalTranscript || (event.results[0] && event.results[0].isFinal)) {
          const spokenText = (finalTranscript || event.results[0][0].transcript).trim();
          executeSearch(spokenText);
          setFeedback(`Recognised: "${spokenText}" — Searching member records...`, 'success', 3500);
        }
      };

      recognition.onerror = (event: any) => {
        isStartingRef.current = false;
        setIsListening(false);

        if (isUserAbortRef.current) {
          return;
        }

        const errorCode = event.error;

        if (errorCode === 'not-allowed' || errorCode === 'permission-denied') {
          setFeedback(
            'Microphone access is blocked. Allow microphone access for this website in Chrome site settings, then return here and tap the microphone again.',
            'error',
            0,
            true
          );
        } else if (errorCode === 'no-speech') {
          setFeedback(
            "No speech detected. Please try again or search by typing the member's name.",
            'info',
            4500,
            true
          );
        } else if (errorCode === 'network') {
          setFeedback(
            'Voice search network connection issue. Please check your internet connection or search by typing.',
            'error',
            5000,
            true
          );
        } else if (errorCode === 'audio-capture') {
          setFeedback(
            'No microphone device was detected. Keyboard typing is available.',
            'error',
            5000,
            false
          );
        } else if (errorCode === 'aborted') {
          // Handled quietly
        } else {
          setFeedback(
            'Voice search could not start. Please try again.',
            'error',
            4500,
            true
          );
        }
      };

      recognition.onend = () => {
        isStartingRef.current = false;
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      isStartingRef.current = false;
      setIsListening(false);
      console.warn('Speech recognition start error:', err);
      if (err.name === 'NotAllowedError') {
        setFeedback(
          'Microphone access is blocked. Allow microphone access for this website in Chrome site settings, then return here and tap the microphone again.',
          'error',
          0,
          true
        );
      } else {
        setFeedback('Voice search could not start. Please try again.', 'error', 4500, true);
      }
    }
  };

  const stopVoiceSearch = () => {
    isUserAbortRef.current = true;
    isStartingRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setSpeechFeedback(null);
  };

  const handleClear = () => {
    lastExecutedSearchRef.current = '';
    onChange('');
    if (onSearch) {
      onSearch('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch(value);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Search Input Box with Integrated Action Controls */}
      <div className="relative flex items-center w-full">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            // Reset last search ref if user types manually
            if (e.target.value !== lastExecutedSearchRef.current) {
              lastExecutedSearchRef.current = '';
            }
          }}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={
            isListening
              ? 'Listening... Speak member name now...'
              : placeholder
          }
          className={`w-full pl-3.5 pr-24 py-2.5 sm:py-3 bg-white border rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-xs ${
            isListening
              ? 'border-red-500 ring-2 ring-red-400/50 bg-red-50/20'
              : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30'
          }`}
        />

        {/* Right Action Cluster: Clear button, Voice Mic button, and Search trigger */}
        <div className="absolute right-1.5 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
              title="Clear search"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Voice Search Microphone Button */}
          <button
            type="button"
            onClick={isListening ? stopVoiceSearch : startVoiceSearch}
            className={`relative p-2 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
              isListening
                ? 'bg-red-600 text-white shadow-lg ring-4 ring-red-400/50'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300/80 shadow-2xs hover:scale-105 active:scale-95'
            }`}
            title={
              isListening
                ? 'Listening... Tap to stop voice search'
                : isSupported
                ? `Voice search (${selectedLang}) - Tap and speak a member's name`
                : 'Speech recognition not supported in this browser. Keyboard search active.'
            }
            aria-label={isListening ? 'Stop listening' : 'Start voice search'}
          >
            {isListening ? (
              <>
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </span>
                <MicOff className="w-4 h-4 text-white" />
              </>
            ) : (
              <Mic className="w-4 h-4 text-amber-950" />
            )}
          </button>

          {/* Execute Search Button */}
          <button
            type="button"
            onClick={() => executeSearch(value)}
            className="p-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg shadow-2xs transition-colors flex items-center justify-center cursor-pointer"
            title="Search member records"
            aria-label="Submit search"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Prominent "Listening..." Dynamic Banner */}
      {isListening && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <span className="font-bold text-red-700 tracking-wide">Listening...</span>
            <span className="text-slate-600 hidden sm:inline">Speak member's name clearly</span>

            {/* Animated Audio Equalizer Bars */}
            <div className="flex items-center gap-0.5 h-3 ml-1" aria-hidden="true">
              <span className="w-0.5 bg-red-500 rounded-full animate-pulse h-2"></span>
              <span className="w-0.5 bg-red-600 rounded-full animate-bounce h-3.5"></span>
              <span className="w-0.5 bg-red-500 rounded-full animate-pulse h-2"></span>
              <span className="w-0.5 bg-red-600 rounded-full animate-bounce h-3"></span>
            </div>
          </div>

          <button
            type="button"
            onClick={stopVoiceSearch}
            className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] rounded-md transition-colors cursor-pointer"
          >
            Stop
          </button>
        </div>
      )}

      {/* Status / Feedback Bar with Retry & Dismiss options */}
      {speechFeedback && !isListening && (
        <div
          role="status"
          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs animate-fadeIn ${
            feedbackType === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : feedbackType === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-blue-50 border border-blue-200 text-blue-950'
          }`}
        >
          <div className="flex items-start gap-1.5 min-w-0 flex-1">
            {feedbackType === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : feedbackType === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Volume2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            )}
            <span className="font-medium text-[11px] sm:text-xs leading-relaxed">{speechFeedback}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {showRetry && (
              <button
                type="button"
                onClick={startVoiceSearch}
                className="inline-flex items-center gap-1 px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
                title="Tap to retry voice search"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setShowLanguagePicker(!showLanguagePicker)}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-slate-200/50 cursor-pointer"
              title="Change recognition dialect"
            >
              <Globe className="w-3 h-3" />
              <span>{selectedLang.replace('en-', '')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSpeechFeedback(null);
                setShowRetry(false);
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              title="Dismiss message"
              aria-label="Dismiss feedback"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Language Dialect Selection Drawer */}
      {showLanguagePicker && (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 animate-fadeIn shadow-xs">
          <div className="flex items-center justify-between text-slate-700 font-semibold text-[11px]">
            <span>Speech Recognition Accent & Dialect:</span>
            <button
              type="button"
              onClick={() => setShowLanguagePicker(false)}
              className="text-slate-400 hover:text-slate-600 text-xs p-1"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setSelectedLang('en-GH');
                setShowLanguagePicker(false);
              }}
              className={`p-1.5 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                selectedLang === 'en-GH'
                  ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              🇬🇭 Ghana English
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedLang('en-US');
                setShowLanguagePicker(false);
              }}
              className={`p-1.5 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                selectedLang === 'en-US'
                  ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              🇺🇸 US English
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedLang('en-GB');
                setShowLanguagePicker(false);
              }}
              className={`p-1.5 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                selectedLang === 'en-GB'
                  ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              🇬🇧 UK English
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedLang('ak-GH');
                setShowLanguagePicker(false);
              }}
              className={`p-1.5 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                selectedLang === 'ak-GH'
                  ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              🇬🇭 Akan / Twi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
