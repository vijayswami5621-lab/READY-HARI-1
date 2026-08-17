import { useState, useEffect } from 'react';
import { normalizeUrl } from '../lib/urlUtils';
import { User } from 'lucide-react';

export const DEFAULT_FOUNDER_OFFICIAL_IMAGE = 'https://i.ibb.co/C3fMqkPN/1afc23d9a35f.png';

interface FounderImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  containerClassName?: string;
  showSkeleton?: boolean;
}

export default function FounderImage({
  src,
  alt = 'Ajay Swami (Amar Das) - Founder Hari Pathshala',
  className = 'w-full h-full object-cover',
  containerClassName = 'relative w-full h-full overflow-hidden',
  showSkeleton = true
}: FounderImageProps) {
  const normalizedSrc = normalizeUrl(src) || DEFAULT_FOUNDER_OFFICIAL_IMAGE;
  const [imageSrc, setImageSrc] = useState<string>(normalizedSrc);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Re-trigger loading skeleton when source changes
  useEffect(() => {
    const validUrl = normalizeUrl(src) || DEFAULT_FOUNDER_OFFICIAL_IMAGE;
    setImageSrc(validUrl);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    if (imageSrc !== DEFAULT_FOUNDER_OFFICIAL_IMAGE) {
      setImageSrc(DEFAULT_FOUNDER_OFFICIAL_IMAGE);
      setHasError(false);
    } else {
      setHasError(true);
    }
  };

  return (
    <div className={containerClassName}>
      {/* Loading Skeleton */}
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100 via-orange-50 to-orange-100 animate-pulse z-10 flex flex-col items-center justify-center p-4">
          <div className="w-12 h-12 rounded-full bg-orange-200/70 mb-2 animate-bounce flex items-center justify-center text-orange-600">
            <User size={24} />
          </div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest font-sans">
            Loading Founder Photo...
          </span>
        </div>
      )}

      {/* Fallback in case both target and default fail */}
      {hasError ? (
        <div className="absolute inset-0 bg-orange-100 flex flex-col items-center justify-center text-orange-800 p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center mb-2">
            <User size={32} className="text-orange-700" />
          </div>
          <p className="font-serif font-bold text-sm">Ajay Swami (Amar Das)</p>
          <p className="text-xs text-orange-600">Founder, Hari Pathshala</p>
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          className={`${className} transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}
