/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, RotateCw, BookOpen, Calendar, Flame } from 'lucide-react';
import { Quote, PanchangData, EventItem, db } from '../lib/db';
import QuoteCard from './QuoteCard';
import { 
  detectCurrentFestival, 
  getMatchingFestivalQuotes, 
  selectRandomQuote, 
  DetectedFestival 
} from '../lib/festivalService';

export default function HomeQuotesSection() {
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Subscribe to Firestore Realtime Collections with proper cleanup
  useEffect(() => {
    const unsubQuotes = db.subscribeToQuotes((data) => {
      setAllQuotes(data || []);
    });

    const unsubPanchang = db.subscribeToPanchang((data) => {
      setPanchang(data);
    });

    const unsubEvents = db.subscribeToEvents((data) => {
      setEvents(data || []);
    });

    return () => {
      unsubQuotes();
      unsubPanchang();
      unsubEvents();
    };
  }, []);

  // 2. Realtime Auto-Festival Detection
  const currentFestival: DetectedFestival = useMemo(() => {
    return detectCurrentFestival(panchang, events);
  }, [panchang, events]);

  // 3. Priority Quote Matching: Festival -> Category -> Topic -> General
  const { matchedQuotes, isFestivalSpecific } = useMemo(() => {
    return getMatchingFestivalQuotes(allQuotes, currentFestival);
  }, [allQuotes, currentFestival]);

  // 4. Random Selection Helper
  const pickNextQuote = useCallback(() => {
    if (!matchedQuotes || matchedQuotes.length === 0) return;
    setIsRotating(true);
    const nextQuote = selectRandomQuote(matchedQuotes, currentQuote?.id);
    if (nextQuote) {
      setCurrentQuote(nextQuote);
    }
    setTimeout(() => setIsRotating(false), 450);
  }, [matchedQuotes, currentQuote?.id]);

  // 5. Initialize or re-evaluate quote when matchedQuotes pool updates
  useEffect(() => {
    if (matchedQuotes.length > 0) {
      // If currentQuote is no longer in matchedQuotes pool, or on first load:
      if (!currentQuote || !matchedQuotes.some(q => q.id === currentQuote.id)) {
        const initialRandom = selectRandomQuote(matchedQuotes);
        if (initialRandom) {
          setCurrentQuote(initialRandom);
        }
      }
    }
  }, [matchedQuotes]);

  // 6. Optional subtle auto-rotation timer (every 16 seconds if not paused)
  useEffect(() => {
    if (matchedQuotes.length <= 1 || isPaused) {
      if (rotationTimerRef.current) clearInterval(rotationTimerRef.current);
      return;
    }

    rotationTimerRef.current = setInterval(() => {
      pickNextQuote();
    }, 16000);

    return () => {
      if (rotationTimerRef.current) clearInterval(rotationTimerRef.current);
    };
  }, [matchedQuotes.length, isPaused, pickNextQuote]);

  if (!matchedQuotes || matchedQuotes.length === 0 || !currentQuote) {
    return null;
  }

  return (
    <section 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="py-12 sm:py-16 bg-gradient-to-b from-orange-50/70 via-amber-50/40 to-white relative overflow-hidden border-b border-stone-200"
    >
      {/* Subtle Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Top Header: Festival & Suvichar Indicator */}
        <div className="text-center mb-8">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 bg-orange-100/90 text-orange-900 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-200 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
              <span>आज का विशेष सुविचार</span>
            </div>

            {/* Dynamic Festival Tag only shown when actual festival detected */}
            {currentFestival.isFestivalToday && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-1.5 rounded-full text-xs font-black tracking-wide shadow-xs"
              >
                <Flame className="w-3.5 h-3.5 text-yellow-200" />
                <span>{currentFestival.tagline || currentFestival.hindiName}</span>
              </motion.div>
            )}
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 tracking-tight">
            {currentFestival.isFestivalToday ? `${currentFestival.hindiName} विशेष अमृत विचार` : 'दिव्य वाणी एवं अमृत विचार'}
          </h2>
          
          <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1.5 max-w-lg mx-auto">
            {currentFestival.isFestivalToday 
              ? `${currentFestival.deity} की पावन शिक्षाएं एवं आध्यात्मिक प्रेरणा`
              : 'श्रीरामचरितमानस, श्रीमद्भगवद्गीता एवं संत महापुरुषों की अमर शिक्षाएं'
            }
          </p>
        </div>

        {/* Dynamic Animated Quote Display */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <QuoteCard 
                quote={currentQuote} 
                compact 
                festivalName={isFestivalSpecific ? currentFestival.hindiName : undefined}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Interactive Controls: Next Random Quote + View All Quotes */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          
          {/* Next Quote Rotation Button */}
          {matchedQuotes.length > 1 && (
            <button
              onClick={pickNextQuote}
              disabled={isRotating}
              className="inline-flex items-center gap-2 bg-white hover:bg-orange-50 text-orange-950 font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm border border-stone-300 hover:border-orange-300 shadow-sm hover:shadow transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Next Random Quote"
            >
              <RotateCw className={`w-4 h-4 text-orange-600 ${isRotating ? 'animate-spin' : ''}`} />
              <span>अगला सुविचार (Next)</span>
            </button>
          )}

          {/* View All Quotes Link */}
          <Link
            to="/quotes"
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-95"
          >
            <span>सभी सुविचार देखें</span>
            <ArrowRight className="w-4 h-4 text-orange-400" />
          </Link>
        </div>

        {/* Active Pool Info Counter */}
        {matchedQuotes.length > 1 && (
          <p className="text-[11px] text-stone-400 text-center mt-4 font-medium">
            {isFestivalSpecific 
              ? `✨ ${currentFestival.name} के लिए ${matchedQuotes.length} विशेष सुविचार उपलब्ध हैं`
              : `📖 दैनिक अमृत विचार संग्रह`
            }
          </p>
        )}

      </div>
    </section>
  );
}
