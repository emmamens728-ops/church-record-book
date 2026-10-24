/**
 * House of Power Ministry International Church
 * Official Image Asset Management System
 * 
 * Strict compliance with user rules:
 * - IMAGE 1: Circular blue-and-gold HOP emblem with dove and church name (Primary Logo)
 * - IMAGE 2: Circular portrait image of Prophet Francis Kwarteng (Spiritual Leader)
 * - IMAGE 3: HOP church logo on blue background (Church Banner)
 * - IMAGE 4: Large HOP emblem containing church motto (Motto Emblem)
 * - Preserves proportions, avoids distortions, and allows in-browser loading of original files
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ImageAssets {
  primaryLogo: string;       // IMAGE 1 (images (3).jpeg)
  prophetPortrait: string;   // IMAGE 2 (images (1).jpeg)
  blueBanner: string;        // IMAGE 3 (images.jpeg)
  mottoEmblem: string;       // IMAGE 4 (images (2).jpeg)
}

interface ImageStatus {
  primaryLogo: boolean;
  prophetPortrait: boolean;
  blueBanner: boolean;
  mottoEmblem: boolean;
}

interface ImageAssetsContextType {
  images: ImageAssets;
  imageLoadedStatus: ImageStatus;
  isSavingPermanent: boolean;
  permanentSaveMessage: string | null;
  setImageLoaded: (key: keyof ImageAssets, loaded: boolean) => void;
  updateImageCustomUrl: (key: keyof ImageAssets, dataUrl: string) => Promise<boolean>;
  saveLogoPermanentlyToServer: (customDataUrl?: string) => Promise<{ success: boolean; message: string }>;
  resetToDefaultPaths: () => void;
}

// Default paths pointing to verified transparent assets
const DEFAULT_IMAGE_PATHS: ImageAssets = {
  primaryLogo: '/images/hop_logo_transparent.png',
  prophetPortrait: '/images/images (1).jpeg',
  blueBanner: '/images/images.jpeg',
  mottoEmblem: '/images/images (2).jpeg',
};

const STORAGE_KEY = 'hop_church_custom_images';

const ImageAssetsContext = createContext<ImageAssetsContextType | undefined>(undefined);

export const ImageAssetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<ImageAssets>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Preserve user's uploaded logo permanently if they uploaded one
        if (parsed.primaryLogo && (parsed.primaryLogo.startsWith('data:') || parsed.primaryLogo.startsWith('blob:'))) {
          // Keep the uploaded logo
        } else {
          parsed.primaryLogo = '/images/hop_logo_transparent.png';
        }
        return { ...DEFAULT_IMAGE_PATHS, ...parsed };
      }
    } catch {
      // fallback to default
    }
    return DEFAULT_IMAGE_PATHS;
  });

  const [imageLoadedStatus, setImageLoadedStatus] = useState<ImageStatus>({
    primaryLogo: false,
    prophetPortrait: false,
    blueBanner: false,
    mottoEmblem: false,
  });

  const [isSavingPermanent, setIsSavingPermanent] = useState<boolean>(false);
  const [permanentSaveMessage, setPermanentSaveMessage] = useState<string | null>(null);

  const setImageLoaded = (key: keyof ImageAssets, loaded: boolean) => {
    setImageLoadedStatus(prev => ({ ...prev, [key]: loaded }));
  };

  const saveLogoPermanentlyToServer = async (customDataUrl?: string): Promise<{ success: boolean; message: string }> => {
    const targetUrl = customDataUrl || images.primaryLogo;
    if (!targetUrl || !targetUrl.startsWith('data:')) {
      return { success: false, message: 'Current logo is already the official server standard.' };
    }

    setIsSavingPermanent(true);
    setPermanentSaveMessage('Writing logo permanently to church server...');
    try {
      const res = await fetch('/api/church/save-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl: targetUrl }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPermanentSaveMessage('✅ Church logo permanently saved to server filesystem & browser storage.');
        return { success: true, message: data.message };
      } else {
        const errorMsg = data.error || 'Server could not save logo.';
        setPermanentSaveMessage(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err: any) {
      const netError = 'Network error saving logo to server.';
      setPermanentSaveMessage(netError);
      return { success: false, message: err.message || netError };
    } finally {
      setIsSavingPermanent(false);
    }
  };

  const updateImageCustomUrl = async (key: keyof ImageAssets, dataUrl: string): Promise<boolean> => {
    setImages(prev => {
      const updated = { ...prev, [key]: dataUrl };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save image in localStorage', err);
      }
      return updated;
    });
    setImageLoadedStatus(prev => ({ ...prev, [key]: true }));

    // When primaryLogo is uploaded, automatically save it permanently to the server disk
    if (key === 'primaryLogo' && dataUrl.startsWith('data:')) {
      await saveLogoPermanentlyToServer(dataUrl);
    }
    return true;
  };

  // On mount: if localStorage has an uploaded custom logo, ensure it is permanently written to server
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.primaryLogo && parsed.primaryLogo.startsWith('data:')) {
          saveLogoPermanentlyToServer(parsed.primaryLogo);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const resetToDefaultPaths = () => {
    localStorage.removeItem(STORAGE_KEY);
    setImages(DEFAULT_IMAGE_PATHS);
    setImageLoadedStatus({
      primaryLogo: false,
      prophetPortrait: false,
      blueBanner: false,
      mottoEmblem: false,
    });
    setPermanentSaveMessage(null);
  };

  return (
    <ImageAssetsContext.Provider
      value={{
        images,
        imageLoadedStatus,
        isSavingPermanent,
        permanentSaveMessage,
        setImageLoaded,
        updateImageCustomUrl,
        saveLogoPermanentlyToServer,
        resetToDefaultPaths,
      }}
    >
      {children}
    </ImageAssetsContext.Provider>
  );
};

export const useImageAssets = (): ImageAssetsContextType => {
  const context = useContext(ImageAssetsContext);
  if (!context) {
    throw new Error('useImageAssets must be used within an ImageAssetsProvider');
  }
  return context;
};
