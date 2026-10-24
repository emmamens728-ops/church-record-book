import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type AppView =
  | 'initial_splash'
  | 'homepage'
  | 'recordbook_splash'
  | 'recordbook'
  | 'admin_login'
  | 'create_admin'
  | 'admin_splash'
  | 'admin_portal';

interface NavigationContextType {
  currentView: AppView;
  canGoBack: boolean;
  canGoForward: boolean;
  historyIndex: number;
  historyStack: AppView[];
  goBack: () => void;
  goForward: () => void;
  goToHome: () => void;
  navigateTo: (view: AppView, replace?: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// View to hash mapping for browser URL / history bar
const VIEW_TO_HASH: Record<AppView, string> = {
  initial_splash: '',
  homepage: '#home',
  recordbook_splash: '#recordbook-loading',
  recordbook: '#recordbook',
  admin_login: '#admin-login',
  create_admin: '#create-admin',
  admin_splash: '#admin-loading',
  admin_portal: '#admin-portal',
};

const HASH_TO_VIEW: Record<string, AppView> = {
  '': 'homepage',
  '#home': 'homepage',
  '#recordbook': 'recordbook',
  '#admin-login': 'admin_login',
  '#create-admin': 'create_admin',
  '#admin-portal': 'admin_portal',
};

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('initial_splash');
  const [historyStack, setHistoryStack] = useState<AppView[]>(['initial_splash']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const scrollPositionsRef = React.useRef<Record<string, number>>({});

  // Helper to save current view's scroll offset
  const saveCurrentScroll = useCallback((view: AppView) => {
    if (typeof window !== 'undefined') {
      scrollPositionsRef.current[view] = window.scrollY || document.documentElement.scrollTop || 0;
    }
  }, []);

  // Helper to restore saved scroll offset
  const restoreScroll = useCallback((view: AppView) => {
    if (typeof window !== 'undefined') {
      const targetY = scrollPositionsRef.current[view] || 0;
      requestAnimationFrame(() => {
        window.scrollTo({ top: targetY, behavior: 'auto' });
      });
    }
  }, []);

  // Synchronize with browser popstate (Android back button, browser back/forward buttons)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      saveCurrentScroll(currentView);

      if (event.state && event.state.view) {
        const targetView = event.state.view as AppView;
        setCurrentView(targetView);
        restoreScroll(targetView);
        // Find if it exists in history stack to align pointer
        setHistoryStack((prev) => {
          const idx = prev.indexOf(targetView);
          if (idx !== -1) {
            setHistoryIndex(idx);
            return prev;
          }
          return [...prev, targetView];
        });
      } else {
        const hash = window.location.hash;
        if (HASH_TO_VIEW[hash]) {
          const targetView = HASH_TO_VIEW[hash];
          setCurrentView(targetView);
          restoreScroll(targetView);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView, saveCurrentScroll, restoreScroll]);

  const navigateTo = useCallback(
    (view: AppView, replace = false) => {
      saveCurrentScroll(currentView);
      setCurrentView(view);
      restoreScroll(view);

      const hash = VIEW_TO_HASH[view];
      if (hash) {
        if (replace) {
          window.history.replaceState({ view }, '', hash);
        } else {
          window.history.pushState({ view }, '', hash);
        }
      }

      setHistoryStack((prev) => {
        if (replace) {
          const newStack = [...prev];
          newStack[historyIndex] = view;
          return newStack;
        }
        // Truncate any forward history and append new view
        const newStack = prev.slice(0, historyIndex + 1);
        newStack.push(view);
        setHistoryIndex(newStack.length - 1);
        return newStack;
      });
    },
    [currentView, historyIndex, saveCurrentScroll, restoreScroll]
  );

  const goBack = useCallback(() => {
    // If browser history can go back
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const targetView = historyStack[prevIndex];
      // Skip splash views if going back
      if (targetView === 'recordbook_splash' || targetView === 'admin_splash') {
        if (prevIndex > 0) {
          const skipIndex = prevIndex - 1;
          const safeView = historyStack[skipIndex];
          setHistoryIndex(skipIndex);
          setCurrentView(safeView);
          window.history.back();
          return;
        }
      }
      saveCurrentScroll(currentView);
      setHistoryIndex(prevIndex);
      setCurrentView(targetView);
      restoreScroll(targetView);
      window.history.back();
    } else {
      // Default fallback back to homepage if not already there
      if (currentView !== 'homepage') {
        navigateTo('homepage');
      }
    }
  }, [historyIndex, historyStack, currentView, navigateTo, saveCurrentScroll, restoreScroll]);

  const goForward = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      saveCurrentScroll(currentView);
      const nextIndex = historyIndex + 1;
      const targetView = historyStack[nextIndex];
      setHistoryIndex(nextIndex);
      setCurrentView(targetView);
      restoreScroll(targetView);
      window.history.forward();
    }
  }, [historyIndex, historyStack, currentView, saveCurrentScroll, restoreScroll]);

  const goToHome = useCallback(() => {
    navigateTo('homepage');
  }, [navigateTo]);

  // Determine if back is valid (exclude initial splash)
  const canGoBack = historyIndex > 0 && historyStack[historyIndex - 1] !== 'initial_splash';
  const canGoForward = historyIndex < historyStack.length - 1;

  return (
    <NavigationContext.Provider
      value={{
        currentView,
        canGoBack,
        canGoForward,
        historyIndex,
        historyStack,
        goBack,
        goForward,
        goToHome,
        navigateTo,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
