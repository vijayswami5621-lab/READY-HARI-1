import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  aspectRatio?: string;
}

const DEFAULT_FALLBACK_IMAGE = 'https://i.ibb.co/qMG2MS27/logo.png';

export default function SmartImage({
  src,
  alt,
  className = '',
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  ...props
}: SmartImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState<string>(src || fallbackSrc);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setRetryCount(0);
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (retryCount < 2 && src) {
      // Retry loading after a brief delay
      setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        setCurrentSrc(`${src}${src.includes('?') ? '&' : '?'}retry=${Date.now()}`);
      }, 1000);
    } else if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setLoading(false);
      setError(true);
    }
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  if (error || !currentSrc) {
    return (
      <div
        className={`bg-stone-100 flex flex-col items-center justify-center p-4 text-stone-400 select-none ${className}`}
      >
        <ImageOff className="w-8 h-8 mb-1 text-stone-300" />
        <span className="text-[10px] text-stone-400 font-medium">Hari Pathshala</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-stone-200 animate-pulse flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        {...props}
        src={currentSrc}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
}
