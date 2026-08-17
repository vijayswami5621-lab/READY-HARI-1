/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Search, Bookmark, Share2, Check, ArrowRight, Sparkles, X, RefreshCw
} from 'lucide-react';
import { 
  db, Stuti, getStutiBookmarks, subscribeToBookmarks, toggleStutiBookmark 
} from '../lib/db';
import SEO from '../components/SEO';

export default function Stutis() {
  const navigate = useNavigate();
  const [stutis, setStutis] = useState<Stuti[]>(db.getStutis());
  const [isLoading, setIsLoading] = useState(stutis.length === 0);
  const [search, setSearch] = useState('');
  const [selectedDeity, setSelectedDeity] = useState('All');
  const [bookmarks, setBookmarks] = useState<string[]>(getStutiBookmarks());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial immediate cache sync
    const initialList = db.getStutis();
    if (initialList && initialList.length > 0) {
      setStutis(initialList);
      setIsLoading(false);
    }

    // 2. Subscribe to realtime database of stutis
    const unsubStutis = db.subscribe('stutis', (data) => {
      if (Array.isArray(data) && data.length > 0) {
        setStutis(data);
      }
      setIsLoading(false);
    });

    const unsubBookmarks = subscribeToBookmarks((updatedBookmarks) => {
      setBookmarks(updatedBookmarks);
    });

    return () => {
      unsubStutis();
      unsubBookmarks();
    };
  }, []);

  const deities = ['All', ...Array.from(new Set(stutis.map(s => s.deity || 'General').filter(Boolean)))];

  const filteredStutis = stutis.filter(stuti => {
    if (!stuti) return false;
    const searchLower = (search || '').trim().toLowerCase();
    if (!searchLower) {
      return selectedDeity === 'All' || (stuti.deity || 'General') === selectedDeity;
    }
    const titleMatch = (stuti.title || '').toLowerCase().includes(searchLower);
    const hindiTitleMatch = (stuti.hindiTitle || '').includes(searchLower);
    const deityMatch = (stuti.deity || '').toLowerCase().includes(searchLower);
    const sanskritMatch = (stuti.sanskrit || '').includes(search);
    const meaningMatch = (stuti.hindiMeaning || '').includes(search);
    
    const matchesSearch = titleMatch || hindiTitleMatch || deityMatch || sanskritMatch || meaningMatch;
    const matchesDeity = selectedDeity === 'All' || (stuti.deity || 'General') === selectedDeity;
    return matchesSearch && matchesDeity;
  });

  const handleShare = (e: React.MouseEvent, stuti: Stuti) => {
    e.stopPropagation();
    e.preventDefault();
    const targetId = stuti.slug || stuti.id;
    const url = `${window.location.origin}/stutis/${targetId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(stuti.id);
        setTimeout(() => setCopiedId(null), 2000);
      }).catch(() => {});
    }
  };

  const handleBookmarkToggle = (e: React.MouseEvent, stutiId: string) => {
    e.stopPropagation();
    e.preventDefault();
    toggleStutiBookmark(stutiId);
  };

  const handleCardClick = (stuti: Stuti) => {
    const targetId = stuti.slug || stuti.id;
    if (!targetId) return;
    navigate(`/stutis/${targetId}`);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-stone-50 pb-28 md:pb-16">
      <SEO 
        title="Spiritual Stutis & Prayers | Hari Pathshala"
        description="हरि पाठशाला स्तुति संग्रह। सनातन धर्म के विभिन्न देवी-देवताओं के दिव्य स्तोत्र, चालीसा और स्तुतियाँ - संस्कृत श्लोक, हिंदी अर्थ एवं महात्म्य सहित।"
        url="/stutis"
      />

      {/* Header Banner */}
      <div className="bg-amber-950 text-white py-12 md:py-20 text-center px-4 relative overflow-hidden border-b-4 border-amber-500">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/mandala-pattern.png')]"></div>
        <div className="relative z-10 w-full max-w-5xl mx-auto px-2">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <BookOpen className="mx-auto text-amber-400 mb-3 w-10 h-10 md:w-12 md:h-12" />
            <h1 className="font-serif text-[clamp(2rem,5vw,3.75rem)] leading-tight font-bold mb-3 text-white drop-shadow-lg">
              Devotional Stutis
            </h1>
            <p className="text-[clamp(1.05rem,3.5vw,1.3rem)] text-amber-300 font-hindi tracking-widest drop-shadow-md mb-3 font-semibold">
              दिव्य स्तोत्र एवं स्तुति संग्रह
            </p>
            <p className="text-xs sm:text-sm md:text-base text-stone-300 font-light max-w-2xl mx-auto leading-relaxed px-4">
              Immerse yourself in sacred chants, chalisa hymnals, and protective mantras dedicated to the divine deities of Sanatana Dharma.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main content container */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Search & Filter Options */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-6">
          
          {/* Search bar */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search stuti, deity, shloka..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-stone-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800 transition-all text-sm"
            />
            {search && (
              <button 
                onClick={() => setSearch('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Bookmarks Counter / Filter summary */}
          <div className="flex items-center gap-2 self-start sm:self-auto text-stone-500 text-xs sm:text-sm">
            <span className="flex items-center gap-1.5 bg-amber-50 text-amber-900 px-3 py-1.5 rounded-full border border-amber-200/70 font-semibold">
              <Bookmark className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
              <span>{bookmarks.length} Bookmarked</span>
            </span>
          </div>
        </div>

        {/* Deity Filter row */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0">
          {deities.map((deity) => (
            <button
              key={deity}
              onClick={() => setSelectedDeity(deity)}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                selectedDeity === deity
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-amber-500 hover:text-amber-600'
              }`}
            >
              {deity === 'All' ? 'All Deities (सभी)' : deity}
            </button>
          ))}
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white p-6 rounded-2xl border border-stone-200/70 shadow-xs animate-pulse">
                <div className="h-5 w-24 bg-stone-200 rounded-full mb-4"></div>
                <div className="h-6 w-3/4 bg-stone-200 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-stone-100 rounded mb-4"></div>
                <div className="h-16 bg-stone-100 rounded-xl mb-4"></div>
                <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                  <div className="h-4 w-32 bg-stone-100 rounded"></div>
                  <div className="h-8 w-24 bg-amber-100 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredStutis.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-stone-200 rounded-3xl px-4">
            <BookOpen className="mx-auto text-stone-300 w-14 h-14 mb-3" />
            <h3 className="font-serif text-lg font-bold text-stone-800 mb-1">No Stutis Found</h3>
            <p className="text-stone-500 text-xs sm:text-sm max-w-sm mx-auto mb-4">
              Try typing a different name or select 'All Deities' above to browse all devotional hymns.
            </p>
            {search && (
              <button 
                onClick={() => { setSearch(''); setSelectedDeity('All'); }}
                className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredStutis.map((stuti) => {
                const isBookmarked = bookmarks.includes(stuti.id);
                const previewSnippet = (stuti.sanskrit || stuti.hindiMeaning || '')
                  .split('\n')
                  .map(line => line.trim())
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('\n');

                return (
                  <motion.div
                    key={stuti.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    onClick={() => handleCardClick(stuti)}
                    className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md hover:border-amber-300 flex flex-col justify-between transition-all cursor-pointer group active:scale-[0.99]"
                  >
                    
                    {/* Upper Row: Deity Tag & Action Buttons */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full">
                        {stuti.deity || 'General'}
                      </span>
                      
                      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={(e) => handleBookmarkToggle(e, stuti.id)}
                          className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-amber-600 transition-colors cursor-pointer"
                          title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                          aria-label="Bookmark"
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </button>
                        <button 
                          onClick={(e) => handleShare(e, stuti)}
                          className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-amber-600 transition-colors cursor-pointer relative"
                          title="Share Link"
                          aria-label="Share"
                        >
                          {copiedId === stuti.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Stuti Header Block */}
                    <div className="mb-4">
                      <h3 className="font-serif font-bold text-stone-900 text-lg sm:text-xl mb-1 group-hover:text-amber-700 transition-colors">
                        {stuti.title || 'Devotional Stuti'}
                      </h3>
                      {stuti.hindiTitle && (
                        <p className="font-hindi text-stone-600 text-sm sm:text-base mb-2.5 font-medium leading-normal">
                          {stuti.hindiTitle}
                        </p>
                      )}
                      
                      {/* Truncated Sanskrit / Hindi Preview snippet */}
                      <div className="text-stone-600 font-hindi text-xs sm:text-sm bg-stone-50/80 p-3 rounded-xl border border-stone-100 italic leading-relaxed whitespace-pre-line">
                        {previewSnippet || 'पवित्र संस्कृत श्लोक, हिंदी अनुवाद एवं महात्म्य...'}
                      </div>
                    </div>

                    {/* Footer Row: Details link */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Sanskrit + Hindi Meaning</span>
                      </span>

                      <Link 
                        to={`/stutis/${stuti.slug || stuti.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs px-3.5 py-2 rounded-xl border border-amber-200 transition-colors"
                      >
                        <span>Read Verses</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
