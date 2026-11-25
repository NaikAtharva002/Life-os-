import React, { useState } from 'react';
import { PHOTO_ASSETS, type PhotoAssetKey } from '../../utils/photoAssets';
import { Skeleton } from './Skeleton';

export interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  alt: string;
  aspectRatio?: string;
  borderRadius?: string;
  scrim?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = '/images/dashboard/dashboard-workspace.jpg',
  alt,
  aspectRatio,
  borderRadius = 'var(--radius-md)',
  scrim = false,
  className = '',
  style,
  loading = 'lazy',
  ...props
}) => {
  // Check if src is a known photoAssetKey
  const resolvedSrc = (PHOTO_ASSETS as any)[src]?.path || src;
  const [currentSrc, setCurrentSrc] = useState<string>(resolvedSrc);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleError = () => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: aspectRatio || undefined,
        borderRadius,
        overflow: 'hidden',
        background: 'var(--bg-elevated)',
        ...style,
      }}
      className={`image-fallback-container ${className}`.trim()}
    >
      {/* Background Skeleton while loading */}
      {!isLoaded && (
        <Skeleton
          width="100%"
          height="100%"
          borderRadius={borderRadius}
          style={{ position: 'absolute', inset: 0 }}
        />
      )}

      {/* Image Element */}
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        {...props}
      />

      {/* Optional Editorial Scrim for text readability */}
      {scrim && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(9, 9, 11, 0.1) 0%, rgba(9, 9, 11, 0.65) 60%, rgba(9, 9, 11, 0.92) 100%)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

export default ImageWithFallback;
