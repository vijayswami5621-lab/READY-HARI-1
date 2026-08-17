/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ImageOff, RefreshCw } from 'lucide-react';
import { normalizeUrl } from '../lib/urlUtils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1609137144813-9118e9863a4b?q=80&w=600&auto=format&fit=crop';

export default function ImageWithFallback({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  alt,
  className = '',
  priority = false,
  ...props
}: ImageWithFallbackProps) {
  const normalizedSrc = normalizeUrl(src);
  const normalizedFallback = normalizeUrl(fallbackSrc) || DEFAULT_FALLBACK;

  const [imgSrc, setImgSrc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [isInView, setIsInView] = useState<boolean>(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy loading observer when priority is false
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    if (!containerRef.current) return;
    
    // If IntersectionObserver is not supported, load directly
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' } // Load well before coming into viewport
    );
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    if (!isInView) return;

    setLoading(true);
    setErrorCount(0);
    setImgSrc(normalizedSrc || normalizedFallback);
  }, [normalizedSrc, normalizedFallback, isInView]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    if (errorCount < 2 && normalizedSrc) {
      // Retry logic with slight timestamp
      setTimeout(() => {
        setErrorCount((prev) => prev + 1);
        const delimiter = normalizedSrc.includes('?') ? '&' : '?';
        setImgSrc(`${normalizedSrc}${delimiter}retry=${Date.now()}`);
      }, 800);
    } else {
      // Fallback
      setImgSrc(normalizedFallback);
      setLoading(false);
    }
  };

  const handleRetryManual = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLoading(true);
    setErrorCount(0);
    const target = normalizedSrc || normalizedFallback;
    const delimiter = target.includes('?') ? '&' : '?';
    setImgSrc(`${target}${delimiter}retry-manual=${Date.now()}`);
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden flex items-center justify-center bg-stone-100 ${className}`}
    >
      {/* Skeleton / Shimmer Loader */}
      {loading && isInView && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 animate-pulse z-10" 
        />
      )}

      {/* Actual Image */}
      {isInView && imgSrc && (
        <img
          src={imgSrc}
          alt={alt || 'Hari Pathshala'}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loading ? 'opacity-0' : 'opacity-100'
          }`}
          referrerPolicy="no-referrer"
          {...props}
        />
      )}

      {/* Error State Overlays when both primary and fallback fail */}
      {errorCount >= 2 && !imgSrc && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 p-4 text-center z-20">
          <ImageOff className="w-6 h-6 text-stone-400 mb-1 shrink-0" />
          <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider mb-1">Image unavailable</p>
          <button 
            onClick={handleRetryManual}
            className="flex items-center gap-1 bg-white hover:bg-stone-50 text-orange-600 border border-stone-200 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            <span>Retry</span>
          </button>
        </div>
      )}
    </div>
  );
}

