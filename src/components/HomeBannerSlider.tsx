import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, HomeBanner } from '../lib/db';
import { normalizeUrl } from '../lib/urlUtils';

const DEFAULT_BANNER_FALLBACK = 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1200';

export default function HomeBannerSlider() {
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1); // 1 = right, -1 = left
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const filterAndSortBanners = (list: HomeBanner[]): HomeBanner[] => {
    if (!list || list.length === 0) return [];
    const now = new Date();
    
    const valid = list.filter((b) => {
      const isAct = b.isActive !== undefined ? Boolean(b.isActive) : (b.active !== false);
      if (!isAct) return false;

      if (b.startDate) {
        const start = new Date(b.startDate);
        if (!isNaN(start.getTime()) && now < start) return false;
      }
      if (b.endDate) {
        const end = new Date(b.endDate);
        if (!isNaN(end.getTime()) && now > end) return false;
      }
      return true;
    });

    return valid.sort((a, b) => {
      const orderA = a.displayOrder !== undefined ? Number(a.displayOrder) : (a.order !== undefined ? Number(a.order) : 1);
      const orderB = b.displayOrder !== undefined ? Number(b.displayOrder) : (b.order !== undefined ? Number(b.order) : 1);
      return orderA - orderB;
    });
  };

  useEffect(() => {
    // Initial Load
    const initial = db.getHomeBanners();
    setBanners(filterAndSortBanners(initial));

    // Subscribe to Firestore changes
    const unsub = db.subscribeToHomeBanners((updatedBanners) => {
      setBanners(filterAndSortBanners(updatedBanners));
    });

    return () => unsub();
  }, []);

  // Auto sliding timer
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [banners.length, isPaused]);

  if (!banners || banners.length === 0) {
    return null;
  }

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentBanner = banners[currentIndex] || banners[0];
  const desktopImg = normalizeUrl(currentBanner.desktopImageUrl || currentBanner.imageUrl) || DEFAULT_BANNER_FALLBACK;
  const mobileImg = normalizeUrl(currentBanner.mobileImageUrl || currentBanner.imageUrl || desktopImg) || DEFAULT_BANNER_FALLBACK;
  const btnLink = normalizeUrl(currentBanner.buttonUrl || currentBanner.buttonLink) || '/';

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <section 
      className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 pb-6 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-[220px] sm:h-[320px] md:h-[400px] lg:h-[440px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-orange-200/80 bg-stone-900">
        
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentBanner.id || currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Responsive Banner Image (ONLY Image, no text overlays or buttons) */}
            {btnLink && btnLink !== '/' ? (
              <Link
                to={btnLink.startsWith('http') ? { pathname: btnLink } : btnLink}
                target={btnLink.startsWith('http') ? '_blank' : '_self'}
                className="w-full h-full block cursor-pointer"
              >
                <picture className="w-full h-full block">
                  <source media="(min-width: 640px)" srcSet={desktopImg} />
                  <img
                    src={mobileImg}
                    alt="Hari Pathshala Banner"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading={currentIndex === 0 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_BANNER_FALLBACK;
                    }}
                  />
                </picture>
              </Link>
            ) : (
              <picture className="w-full h-full block">
                <source media="(min-width: 640px)" srcSet={desktopImg} />
                <img
                  src={mobileImg}
                  alt="Hari Pathshala Banner"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading={currentIndex === 0 ? 'eager' : 'lazy'}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_BANNER_FALLBACK;
                  }}
                />
              </picture>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls (Visible on hover / mobile arrows) */}
        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-stone-900/60 hover:bg-orange-600 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-md active:scale-95 cursor-pointer z-10"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-stone-900/60 hover:bg-orange-600 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-md active:scale-95 cursor-pointer z-10"
              aria-label="Next banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-6 z-10 flex items-center gap-1.5 sm:gap-2 bg-stone-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    idx === currentIndex
                      ? 'w-6 h-2 bg-orange-500'
                      : 'w-2 h-2 bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </section>
  );
}
