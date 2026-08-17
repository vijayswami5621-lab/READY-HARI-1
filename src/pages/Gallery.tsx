/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Download, Share2, Heart, Copy, ArrowLeft, ArrowRight, 
  X, Info, Check, Filter, Layers, RefreshCw, ZoomIn, Eye
} from 'lucide-react';
import { db, GalleryItem } from '../lib/db';
import SEO from '../components/SEO';
import ImageWithFallback from '../components/ImageWithFallback';

export default function Gallery() {
  // State
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('hari_pathshala_gallery_favorites') || '[]');
    } catch {
      return [];
    }
  });

  // UI / Fullscreen Viewer
  const [selectedItemIdx, setSelectedItemIdx] = useState<number | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  
  // Load limits (Pagination / Infinite scroll)
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Touch swipe support in lightbox
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Subscribe to real-time changes in the database
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = db.subscribeToGallery((data) => {
      setItems(data || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter items by category & flags
  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredItems(items);
    } else if (activeCategory === 'Favorites') {
      setFilteredItems(items.filter((item) => favorites.includes(item.id)));
    } else if (activeCategory === 'Festivals') {
      setFilteredItems(items.filter((item) => item.isFestival === true || (item.category || '').toLowerCase().includes('fest')));
    } else if (activeCategory === 'Events') {
      setFilteredItems(items.filter((item) => item.isEvent === true || (item.category || '').toLowerCase().includes('event')));
    } else if (activeCategory === 'Wallpapers') {
      setFilteredItems(items.filter((item) => item.isWallpaper === true || (item.category || '').toLowerCase().includes('wall')));
    } else {
      setFilteredItems(items.filter((item) => (item.category || '').toLowerCase() === activeCategory.toLowerCase()));
    }
    setVisibleCount(12); // Reset visible count on filter change
  }, [items, activeCategory, favorites]);

  // Handle toast notifications
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter((favId) => favId !== id);
      triggerToast('Removed from favorites.');
    } else {
      updated = [...favorites, id];
      triggerToast('Saved to favorites! ❤️');
    }
    setFavorites(updated);
    try {
      localStorage.setItem('hari_pathshala_gallery_favorites', JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not save favorites to localStorage:', err);
    }
  };

  const copyDirectLink = (url: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      triggerToast('Copied direct link to clipboard! 📋');
    } else {
      triggerToast('Direct link copied!');
    }
  };

  const shareImage = async (item: GalleryItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    const shareData = {
      title: item.title,
      text: `Divine spiritual image of ${item.title} on Hari Pathshala!`,
      url: item.url || item.imageUrl || item.image
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        triggerToast('Shared successfully!');
      } catch (err) {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shareData.url);
          triggerToast('Link copied to share! 🔗');
        }
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareData.url);
      triggerToast('Link copied to share! 🔗');
    }
  };

  const handleDownload = (item: GalleryItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    const targetUrl = item.url || item.imageUrl || item.image;
    triggerToast('Opening high-res image...');
    setTimeout(() => {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }, 200);
  };

  // Fullscreen Viewer Carousel handlers
  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedItemIdx === null || filteredItems.length === 0) return;
    setSelectedItemIdx((prev) => (prev !== null ? (prev + 1) % filteredItems.length : 0));
  }, [selectedItemIdx, filteredItems.length]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedItemIdx === null || filteredItems.length === 0) return;
    setSelectedItemIdx((prev) => (prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
  }, [selectedItemIdx, filteredItems.length]);

  // Keyboard navigation inside lightbox
  useEffect(() => {
    if (selectedItemIdx === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedItemIdx(null);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemIdx, handleNext, handlePrev]);

  // Swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > 50) {
      handleNext();
    } else if (distance < -50) {
      handlePrev();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Extract dynamic categories from real Firestore items
  const dynamicCategories = useMemo(() => {
    const baseCats = ['All', 'Festivals', 'Events', 'Wallpapers'];
    const otherCats = Array.from(new Set(items.map((i) => i.category || 'General'))).filter(
      (c) => !baseCats.map(b => b.toLowerCase()).includes(c.toLowerCase())
    );
    return [...baseCats, ...otherCats, 'Favorites'];
  }, [items]);

  const gallerySchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Spiritual Gallery & Wallpapers | Hari Pathshala",
    "description": "Browse and download high-resolution spiritual wallpapers, temple visual arts, and festivals of Sanatana Dharma.",
    "url": "https://haripathshala.online/gallery"
  });

  return (
    <div className="min-h-screen bg-stone-50 pb-20 md:pb-16 flex flex-col">
      <SEO 
        title="Spiritual Gallery & Wallpapers | Hari Pathshala"
        description="Browse premium, high-resolution spiritual wallpapers, temple visual arts, and festivals of Sanatana Dharma. Download wallpapers and share."
        url="/gallery"
        schema={gallerySchema}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white font-bold px-4 py-2.5 rounded-full text-xs shadow-2xl z-50 flex items-center gap-2 tracking-wide border border-stone-700 pointer-events-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO HEADER */}
      <section className="bg-stone-900 text-white py-10 sm:py-14 px-4 text-center relative overflow-hidden border-b-4 border-orange-500">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/mandala-pattern.png')]" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/10 text-orange-300 px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-widest border border-white/20 mb-3 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Divine Visuals & Wallpapers</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
            Spiritual Gallery
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto font-medium">
            भगवान श्री सीताराम, श्री कृष्ण, हनुमान जी, देवाधिदेव महादेव एवं सनातन धर्म के उच्च-गुणवत्ता वाले दिव्य चित्र व वॉलपेपर्स।
          </p>
        </div>
      </section>

      {/* 2. MAIN CONTAINER */}
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 mt-6 flex-grow">
        
        {/* Categories Horizontal Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none">
          <div className="flex items-center gap-2 shrink-0 pr-4">
            <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 hidden sm:block mr-1" />
            {dynamicCategories.map((category) => {
              const isSelected = activeCategory.toLowerCase() === category.toLowerCase();
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shrink-0 border transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm shadow-orange-600/10'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  {category === 'Favorites' ? `❤️ Saved (${favorites.length})` : category}
                </button>
              );
            })}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div 
                key={`gallery-skeleton-${idx}`}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs animate-pulse"
              >
                <div className="aspect-[4/3] bg-stone-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3.5 bg-stone-200 rounded-md w-3/4" />
                  <div className="h-2.5 bg-stone-200 rounded-md w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* ERROR STATE */
          <div className="text-center py-12 bg-white border border-stone-200 rounded-2xl p-6 max-w-md mx-auto shadow-xs my-6">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-200">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-stone-800 font-bold text-base font-serif">Unable to load content</h3>
            <p className="text-stone-500 text-xs mt-1 mb-4">Something went wrong while connecting to the spiritual gallery database.</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                const unsub = db.subscribeToGallery((data) => {
                  setItems(data || []);
                  setLoading(false);
                });
                return () => unsub();
              }}
              className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-14 bg-white border border-stone-200 rounded-2xl p-6 max-w-sm mx-auto shadow-xs my-6">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-orange-100 shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-stone-900 font-serif font-bold text-lg mb-1">
              {activeCategory === 'Favorites' ? 'No Saved Wallpapers' : 'Gallery Coming Soon'}
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed max-w-xs mx-auto">
              {activeCategory === 'Favorites'
                ? 'You have not favorited any wallpapers yet. Tap the heart icon on any image to save it here.'
                : 'दिव्य गैलरी शीघ्र आ रही है — यहाँ भगवान श्री राम, श्री कृष्ण, हनुमान जी एवं सनातन धर्म के उच्च-गुणवत्ता वाले वॉलपेपर्स उपलब्ध होंगे।'}
            </p>
            {activeCategory !== 'All' && (
              <button
                onClick={() => setActiveCategory('All')}
                className="mt-4 inline-flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-4 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                <span>View All Wallpapers</span>
              </button>
            )}
          </div>
        ) : (
          /* GALLERY GRID: 2 columns on mobile, 3 on lg, 4 on xl */
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {filteredItems.slice(0, visibleCount).map((item, idx) => (
                <motion.div
                  key={item.id}
                  layoutId={`gal-card-${item.id}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer relative flex flex-col"
                  onClick={() => setSelectedItemIdx(idx)}
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-stone-100">
                    <ImageWithFallback 
                      src={item.url || item.imageUrl || item.image} 
                      alt={item.title} 
                      priority={idx < 4}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Hover Overlay Controls */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-2.5 sm:p-3.5 text-white z-10">
                      <div className="space-y-0.5 min-w-0 pr-1">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-orange-400">{item.category}</p>
                        <h4 className="text-[11px] sm:text-xs font-bold truncate max-w-[120px]">{item.title}</h4>
                      </div>
                      
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={(e) => toggleFavorite(item.id, e)}
                          className={`p-1.5 rounded-lg backdrop-blur-md transition-colors cursor-pointer min-w-[30px] min-h-[30px] flex items-center justify-center ${
                            favorites.includes(item.id) 
                              ? 'bg-red-500 text-white' 
                              : 'bg-black/50 hover:bg-black/70 text-white'
                          }`}
                          title="Save to favorites"
                        >
                          <Heart className={`w-3 h-3 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => shareImage(item, e)}
                          className="p-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-colors cursor-pointer min-w-[30px] min-h-[30px] flex items-center justify-center"
                          title="Share wallpaper"
                        >
                          <Share2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Details */}
                  <div className="p-2.5 sm:p-3 flex items-center justify-between border-t border-stone-100 mt-auto">
                    <div className="min-w-0 pr-2">
                      <h4 className="font-bold text-stone-900 text-[11px] sm:text-xs truncate">{item.title}</h4>
                      <p className="text-[10px] text-stone-500 truncate">{item.category || 'Wallpaper'}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItemIdx(idx);
                      }}
                      className="text-stone-400 hover:text-orange-600 p-1 transition-colors shrink-0"
                      title="View wallpaper"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Load More Button */}
            {visibleCount < filteredItems.length && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="inline-flex items-center gap-2 bg-white hover:bg-stone-100 text-stone-800 font-bold px-6 py-2.5 rounded-xl border border-stone-300 text-xs shadow-xs transition-all cursor-pointer"
                >
                  <span>Load More Wallpapers ({filteredItems.length - visibleCount} remaining)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. LIGHTBOX FULLSCREEN PREVIEW MODAL */}
      <AnimatePresence>
        {selectedItemIdx !== null && filteredItems[selectedItemIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-xl flex flex-col justify-between p-3 sm:p-6"
            onClick={() => setSelectedItemIdx(null)}
          >
            {/* Modal Top Bar */}
            <div 
              className="flex items-center justify-between z-20" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 sm:gap-3 text-white">
                <span className="text-xs sm:text-sm font-bold bg-white/10 px-3 py-1 rounded-full border border-white/10">
                  {selectedItemIdx + 1} / {filteredItems.length}
                </span>
                <span className="text-stone-400 text-xs hidden sm:inline-block">
                  {filteredItems[selectedItemIdx].category}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => toggleFavorite(filteredItems[selectedItemIdx].id, e)}
                  className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                    favorites.includes(filteredItems[selectedItemIdx].id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Toggle Favorite"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(filteredItems[selectedItemIdx].id) ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={(e) => shareImage(filteredItems[selectedItemIdx], e)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Share Wallpaper"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => copyDirectLink(filteredItems[selectedItemIdx].url || filteredItems[selectedItemIdx].imageUrl || filteredItems[selectedItemIdx].image, e)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Copy Direct Link"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => handleDownload(filteredItems[selectedItemIdx], e)}
                  className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-full text-xs shadow-md transition-all cursor-pointer"
                  title="Download in Full HD"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>

                <button
                  onClick={() => setSelectedItemIdx(null)}
                  className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer ml-2"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Carousel Core */}
            <div 
              className="relative flex-grow flex items-center justify-center my-3 touch-none select-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous Button */}
              <button
                onClick={handlePrev}
                className="absolute left-1 sm:left-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-900/60 hover:bg-orange-600 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg active:scale-95"
                title="Previous Image (Left Arrow)"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Central Main Image Container */}
              <motion.div
                key={filteredItems[selectedItemIdx].id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="relative max-h-[75vh] max-w-full flex items-center justify-center p-2"
              >
                <img
                  src={filteredItems[selectedItemIdx].url || filteredItems[selectedItemIdx].imageUrl || filteredItems[selectedItemIdx].image}
                  alt={filteredItems[selectedItemIdx].title}
                  className="max-h-[70vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/10"
                  referrerPolicy="no-referrer"
                  loading="eager"
                />
              </motion.div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="absolute right-1 sm:right-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-900/60 hover:bg-orange-600 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg active:scale-95"
                title="Next Image (Right Arrow)"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Bottom Caption Bar */}
            <div 
              className="bg-stone-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 max-w-xl mx-auto w-full text-center z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-serif font-bold text-sm sm:text-base text-white truncate">
                {filteredItems[selectedItemIdx].title}
              </h3>
              {filteredItems[selectedItemIdx].description && (
                <p className="text-stone-300 text-xs mt-1 leading-relaxed">
                  {filteredItems[selectedItemIdx].description}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
