import React, { useState, useEffect } from 'react';
import { useImageAssets, ImageAssets } from '../../context/ImageAssetsContext';
import { Upload, AlertCircle } from 'lucide-react';
import { processLogoTransparency } from '../../utils/imageTransparency';

interface ChurchImageProps {
  imageKey: keyof ImageAssets;
  alt: string;
  className?: string;
  containerClassName?: string;
  showFallbackUploadPrompt?: boolean;
  priority?: boolean;
}

export const ChurchImage: React.FC<ChurchImageProps> = ({
  imageKey,
  alt,
  className = 'w-full h-full object-contain',
  containerClassName = '',
  showFallbackUploadPrompt = false,
  priority = true,
}) => {
  const { images, setImageLoaded, updateImageCustomUrl } = useImageAssets();
  const [loadError, setLoadError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Determine immediate source: verified transparent assets used synchronously
  const getImmediateSrc = (key: keyof ImageAssets, raw: string): string => {
    if (key === 'primaryLogo') {
      if (raw && raw.startsWith('data:') && !raw.includes('white')) return raw;
      return '/images/hop_logo_transparent.png';
    }
    if (key === 'mottoEmblem') {
      if (raw && raw.startsWith('data:')) return raw;
      return '/images/hop_motto_emblem.svg';
    }
    return raw;
  };

  const rawSrc = images[imageKey];
  const [processedSrc, setProcessedSrc] = useState<string>(() => getImmediateSrc(imageKey, rawSrc));

  // Sync state if rawSrc changes (e.g. from user file upload)
  useEffect(() => {
    let isCancelled = false;

    if (imageKey === 'primaryLogo') {
      if (rawSrc && rawSrc.startsWith('data:')) {
        processLogoTransparency(rawSrc).then((transparentUrl) => {
          if (!isCancelled) {
            setProcessedSrc(transparentUrl);
          }
        });
      } else {
        setProcessedSrc('/images/hop_logo_transparent.png');
      }
    } else if (imageKey === 'mottoEmblem') {
      if (rawSrc && rawSrc.startsWith('data:')) {
        processLogoTransparency(rawSrc).then((transparentUrl) => {
          if (!isCancelled) {
            setProcessedSrc(transparentUrl);
          }
        });
      } else {
        setProcessedSrc('/images/hop_motto_emblem.svg');
      }
    } else {
      setProcessedSrc(rawSrc);
    }

    return () => {
      isCancelled = true;
    };
  }, [rawSrc, imageKey]);

  const handleImageLoad = () => {
    setLoadError(false);
    setImageLoaded(imageKey, true);
  };

  const handleImageError = () => {
    // If primary logo failed to load, automatically fall back to the transparent SVG
    if (imageKey === 'primaryLogo' && processedSrc !== '/images/hop_logo_transparent.svg') {
      setProcessedSrc('/images/hop_logo_transparent.svg');
      setLoadError(false);
      return;
    }
    setLoadError(true);
    setImageLoaded(imageKey, false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const rawDataUrl = event.target.result as string;
          // Apply background removal if it's the logo to eliminate unwanted white square
          const finalUrl =
            imageKey === 'primaryLogo' || imageKey === 'mottoEmblem'
              ? await processLogoTransparency(rawDataUrl)
              : rawDataUrl;

          await updateImageCustomUrl(imageKey, finalUrl);
          setProcessedSrc(finalUrl);
          setLoadError(false);
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const labelLookup: Record<keyof ImageAssets, { name: string; filename: string }> = {
    primaryLogo: { name: 'Church Primary Logo', filename: 'hop_logo_transparent.png' },
    prophetPortrait: { name: 'Prophet Francis Kwarteng Portrait', filename: 'images (1).jpeg' },
    blueBanner: { name: 'HOP Blue Background Banner', filename: 'images.jpeg' },
    mottoEmblem: { name: 'HOP Emblem with Motto', filename: 'images (2).jpeg' },
  };

  return (
    <div
      className={`relative flex items-center justify-center bg-transparent ${containerClassName}`}
      style={{
        background: 'transparent',
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        outline: 'none',
      }}
    >
      {!loadError ? (
        <img
          src={processedSrc}
          alt={alt}
          loading={priority || imageKey === 'primaryLogo' ? 'eager' : 'lazy'}
          decoding={imageKey === 'primaryLogo' ? 'sync' : 'async'}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`${className} church-logo-unwrapped select-none`}
          style={{
            objectFit: 'contain',
            background: 'transparent',
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: 'none',
            outline: 'none',
            color: 'transparent', // prevents browser alt-text white box flash while rendering
          }}
        />
      ) : (
        <div
          className="w-full h-full min-h-[90px] p-2.5 flex flex-col items-center justify-center text-center bg-blue-900/10 border border-dashed border-amber-500/30 rounded-lg text-xs"
          style={{ background: 'transparent' }}
        >
          <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 mb-1 shadow-xs">
            <AlertCircle className="w-4 h-4" />
          </div>
          <span className="font-semibold text-white text-[11px] leading-tight px-1">
            {labelLookup[imageKey].name}
          </span>
          <span className="text-[10px] text-blue-200 mt-0.5">
            <code className="bg-blue-950/60 px-1 py-0.5 rounded text-[9px] font-mono text-amber-300">
              {labelLookup[imageKey].filename}
            </code>
          </span>

          {showFallbackUploadPrompt && (
            <label className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-semibold cursor-pointer shadow-xs transition-colors">
              <Upload className="w-3 h-3" />
              <span>{isUploading ? 'Loading...' : 'Select File'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
};
