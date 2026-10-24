import React, { useState } from 'react';
import { LION_BACKGROUND } from '../../constants/natureThemes';

interface LionBackgroundProps {
  overlayOpacityClass?: string;
  className?: string;
  fixed?: boolean;
}

export const LionBackground: React.FC<LionBackgroundProps> = ({
  overlayOpacityClass = 'from-blue-950/80 via-blue-900/65 to-slate-950/85',
  className = '',
  fixed = true,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(LION_BACKGROUND.localUrl);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleImageError = () => {
    if (imgSrc === LION_BACKGROUND.localUrl && LION_BACKGROUND.onlineUrl !== LION_BACKGROUND.localUrl) {
      setImgSrc(LION_BACKGROUND.onlineUrl);
    } else {
      setHasError(true);
    }
  };

  return (
    <div
      aria-hidden="true"
      className={`${
        fixed ? 'fixed inset-0' : 'absolute inset-0'
      } w-full h-full overflow-hidden pointer-events-none -z-10 ${className}`}
      style={{
        backgroundColor: '#0a1128', // Church deep royal blue base
      }}
    >
      {/* 1. Responsive Majestic Lion in Nature Background Image (cover, center, no-repeat) */}
      {!hasError && (
        <img
          src={imgSrc}
          alt={LION_BACKGROUND.alt}
          onError={handleImageError}
          className="w-full h-full object-cover object-center select-none"
          style={{
            minWidth: '100%',
            minHeight: '100%',
          }}
          loading="eager"
        />
      )}

      {/* 2. Fallback CSS Background with exact background-size: cover, center, no-repeat */}
      {hasError && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${LION_BACKGROUND.onlineUrl})`,
            backgroundColor: '#0a192f',
          }}
        />
      )}

      {/* 3. Subtle Royal Blue / Dark Overlay for Pristine Readability */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${overlayOpacityClass}`}
      />
    </div>
  );
};

// Aliased export for backwards compatibility
export const EagleBackground = LionBackground;
