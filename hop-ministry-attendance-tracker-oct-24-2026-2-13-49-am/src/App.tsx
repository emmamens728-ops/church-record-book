/**
 * House of Power Ministry International Church, Mankessim, Ghana
 * Official Church Attendance Management Web Application
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChurchDataProvider } from './context/ChurchDataContext';
import { ImageAssetsProvider } from './context/ImageAssetsContext';
import { NavigationProvider, useNavigation, AppView } from './context/NavigationContext';
import { LionBackground } from './components/common/LionBackground';
import { SplashScreen } from './components/common/SplashScreen';
import { HomePage } from './components/homepage/HomePage';
import { AdminLogin } from './components/admin/AdminLogin';
import { CreateAdminAccount } from './components/admin/CreateAdminAccount';
import { AdminLayout } from './components/admin/AdminLayout';
import { RecordBookLayout } from './components/recordbook/RecordBookLayout';
import { SystemArchitectureModal } from './components/common/SystemArchitectureModal';
import { AssetUploadModal } from './components/common/AssetUploadModal';

function MainApp() {
  const { currentView, navigateTo } = useNavigation();
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const { isAuthenticated, authorizeRecordBookSession } = useAuth();

  // Handlers for navigation (instant, seamless navigation without redundant loading locks)
  const handleOpenRecordBookFlow = () => {
    authorizeRecordBookSession();
    navigateTo('recordbook');
  };

  const handleOpenAdminLogin = () => {
    if (isAuthenticated) {
      navigateTo('admin_portal');
    } else {
      navigateTo('admin_login');
    }
  };

  const handleAdminLoginSuccess = () => {
    navigateTo('admin_portal');
  };

  const handleBackToHome = () => {
    navigateTo('homepage');
  };

  return (
    <>
      {/* 
        ONE CONSISTENT MAJESTIC LION BACKGROUND
        Renders the majestic lion in a natural savanna environment across the entire website
        with a subtle royal blue overlay to guarantee readability and brand majesty.
      */}
      <LionBackground fixed={true} />

      {/* 1. Initial Opening Splash Screen (20s duration) */}
      {currentView === 'initial_splash' && (
        <SplashScreen
          durationSeconds={20}
          message="Loading..."
          subtext="House of Power Ministry International Church • Mankessim, Ghana"
          onFinish={() => navigateTo('homepage', true)}
        />
      )}

      {/* 2. Transition Splash for Record Book Entry (20s duration) */}
      {currentView === 'recordbook_splash' && (
        <SplashScreen
          durationSeconds={20}
          message="Loading..."
          subtext="Authorizing & Opening Record Book Registers..."
          onFinish={() => navigateTo('recordbook', true)}
        />
      )}

      {/* 3. Transition Splash for Admin Portal Entry (20s duration) */}
      {currentView === 'admin_splash' && (
        <SplashScreen
          durationSeconds={20}
          message="Loading..."
          subtext="Authenticating Pastoral Administrator Clearance..."
          onFinish={() => navigateTo('admin_portal', true)}
        />
      )}

      {/* 4. Church Homepage (Exact two main buttons: RECORD BOOK & ADMIN) */}
      {currentView === 'homepage' && (
        <HomePage
          onOpenRecordBook={handleOpenRecordBookFlow}
          onOpenAdmin={handleOpenAdminLogin}
          onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
          onOpenAssetModal={() => setIsAssetModalOpen(true)}
        />
      )}

      {/* 5. Administrator Login Page */}
      {currentView === 'admin_login' && (
        <AdminLogin
          onSuccess={handleAdminLoginSuccess}
          onGoToCreateAdmin={() => navigateTo('create_admin')}
          onBackToHome={handleBackToHome}
        />
      )}

      {/* 6. Create Administrator Account Page */}
      {currentView === 'create_admin' && (
        <CreateAdminAccount
          onSuccess={() => navigateTo('admin_login')}
          onGoToLogin={() => navigateTo('admin_login')}
          onBackToHome={handleBackToHome}
        />
      )}

      {/* 7. Protected Record Book Portal */}
      {currentView === 'recordbook' && (
        <RecordBookLayout
          onBackToHome={handleBackToHome}
          onOpenAdmin={handleOpenAdminLogin}
        />
      )}

      {/* 8. Protected Admin Portal */}
      {currentView === 'admin_portal' && (
        <AdminLayout
          onBackToHome={handleBackToHome}
          onOpenRecordBook={handleOpenRecordBookFlow}
        />
      )}

      {/* Global Modals */}
      <SystemArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      <AssetUploadModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <ImageAssetsProvider>
      <AuthProvider>
        <ChurchDataProvider>
          <NavigationProvider>
            <MainApp />
          </NavigationProvider>
        </ChurchDataProvider>
      </AuthProvider>
    </ImageAssetsProvider>
  );
}
