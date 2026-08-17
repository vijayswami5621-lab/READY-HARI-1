/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Bookmark, Share2, Copy, Check, Download, 
  Play, Pause, RotateCcw, AlertCircle, Sparkles, BookOpen, Scroll,
  ChevronRight, RefreshCw, Volume2
} from 'lucide-react';
import { 
  db, Stuti, getStutiBookmarks, subscribeToBookmarks, toggleStutiBookmark 
} from '../lib/db';
import SEO from '../components/SEO';

export default function StutiDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Initial immediate synchronous cache resolution
  const [stuti, setStuti] = useState<Stuti | null>(() => {
    if (!id) return null;
    return db.getStutiByIdOrSlug(id) || null;
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(!stuti);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>(getStutiBookmarks());
  const [activeTab, setActiveTab] = useState<'sanskrit' | 'translit' | 'meaning' | 'explanation' | 'benefits'>('sanskrit');
  
  // Action Feedback States
  const [isCopied, setIsCopied] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Simulated Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes simulated length

  const isBookmarked = Boolean(stuti && bookmarks.includes(stuti.id));

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // 1. Immediate in-memory check
    const cached = db.getStutiByIdOrSlug(id);
    if (cached) {
      setStuti(cached);
      setIsLoading(false);
    }

    // 2. Realtime listener to update if Firestore data streams in
    const unsubStutis = db.subscribe('stutis', (data) => {
      if (!isMounted) return;
      const found = db.getStutiByIdOrSlug(id);
      if (found) {
        setStuti(found);
        setIsLoading(false);
      }
    });

    // 3. Fallback async fetch for direct document / network query
    db.fetchStuti(id).then((fetched) => {
      if (!isMounted) return;
      if (fetched) {
        setStuti(fetched);
      }
      setIsLoading(false);
    }).catch((err) => {
      console.warn('[StutiDetails Load Error]:', err);
      if (isMounted && !stuti) {
        setIsLoading(false);
      }
    });

    // Bookmark subscriber
    const unsubBookmarks = subscribeToBookmarks((updatedBookmarks) => {
      if (isMounted) {
        setBookmarks(updatedBookmarks);
      }
    });

    return () => {
      isMounted = false;
      unsubStutis();
      unsubBookmarks();
    };
  }, [id]);

  // Audio timer simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Safe clipboard helper
  const copyToClipboard = async (text: string) => {
    if (!text) return false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      // Fallback for non-secure / webview contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    } catch (err) {
      console.warn('Copy failed:', err);
      return false;
    }
  };

  const handleCopyText = async (textType: 'verses' | 'meaning' | 'full') => {
    if (!stuti) return;
    let targetText = '';
    if (textType === 'verses') {
      targetText = stuti.sanskrit || '';
    } else if (textType === 'meaning') {
      targetText = stuti.hindiMeaning || '';
    } else {
      targetText = `**${stuti.title}**\n\n[Sanskrit Verses]\n${stuti.sanskrit || ''}\n\n[Hindi Translation]\n${stuti.hindiMeaning || ''}`;
    }

    const success = await copyToClipboard(targetText);
    if (success) {
      setCopyFeedback(textType);
      showToast(textType === 'verses' ? 'Sanskrit verses copied!' : 'Hindi meaning copied!');
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  const handleShare = async () => {
    if (!stuti) return;
    const shareUrl = window.location.href;
    const shareData = {
      title: stuti.title,
      text: `${stuti.title} - ${stuti.hindiTitle || 'Devotional Stuti'} | Hari Pathshala`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (e) {
        // User cancelled or fallback to clipboard
      }
    }

    const success = await copyToClipboard(shareUrl);
    if (success) {
      setIsCopied(true);
      showToast('Stuti link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownloadPDF = () => {
    if (!stuti) return;
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      showToast(`PDF for "${stuti.title}" is ready!`);
    }, 1200);
  };

  const formatTime = (timeInSecs: number) => {
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Loading State (Never render a blank screen)
  if (isLoading && !stuti) {
    return (
      <div className="min-h-screen bg-stone-50 py-10 px-4 flex flex-col items-center">
        <div className="w-full max-w-3xl space-y-6 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="h-6 w-28 bg-stone-200 rounded-lg"></div>
            <div className="h-8 w-16 bg-stone-200 rounded-lg"></div>
          </div>
          <div className="text-center space-y-3 py-6">
            <div className="h-5 w-24 bg-amber-100 rounded-full mx-auto"></div>
            <div className="h-8 w-64 bg-stone-300 rounded-xl mx-auto"></div>
            <div className="h-5 w-48 bg-stone-200 rounded-lg mx-auto"></div>
          </div>
          <div className="h-32 bg-stone-200 rounded-3xl"></div>
          <div className="h-64 bg-white border border-stone-200 rounded-3xl p-6"></div>
        </div>
      </div>
    );
  }

  // 2. Not Found State (Graceful fallback with suggested stutis)
  if (!stuti) {
    const allStutis = db.getStutis();
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center py-16 px-4 pb-28">
        <SEO title="Stuti Not Found | Hari Pathshala" description="The requested devotional prayer was not found." url="/stutis" />
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600">
            <Scroll className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">Stuti Not Found</h2>
          <p className="text-stone-500 text-sm mb-6 leading-relaxed">
            The devotional stuti or stotra you are looking for may have been moved or updated.
          </p>
          
          <div className="flex flex-col gap-2.5 mb-6">
            <Link 
              to="/stutis" 
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse All Stutis</span>
            </Link>
            
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-2.5 px-4 rounded-xl transition-all text-sm"
            >
              Go Back
            </button>
          </div>

          {allStutis.length > 0 && (
            <div className="text-left pt-4 border-t border-stone-100">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Popular Stutis</p>
              <div className="space-y-1.5">
                {allStutis.slice(0, 3).map((s) => (
                  <Link
                    key={s.id}
                    to={`/stutis/${s.slug || s.id}`}
                    className="flex items-center justify-between text-xs font-semibold text-stone-700 hover:text-amber-600 p-2 rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    <span>{s.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Normal Details Render
  return (
    <div className="min-h-screen bg-stone-50 py-6 sm:py-10 md:py-16 pb-32 md:pb-16">
      <SEO 
        title={`${stuti.title} | Sanskrit, Hindi Translation & Benefits`}
        description={`Read ${stuti.title} with correct Sanskrit recitation, English transliteration, direct Hindi translation, and spiritual significance.`}
        url={`/stutis/${stuti.slug || stuti.id}`}
      />

      {/* Floating Toast Notice */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-stone-700 pointer-events-none font-medium"
          >
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            to="/stutis" 
            className="inline-flex items-center gap-1.5 text-stone-600 hover:text-amber-700 transition-colors font-semibold text-xs sm:text-sm bg-white border border-stone-200/80 px-3 py-1.5 rounded-xl shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Stutis</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleStutiBookmark(stuti.id)}
              className={`p-2 bg-white border border-stone-200/80 rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center cursor-pointer shadow-xs ${
                isBookmarked ? 'text-amber-600 border-amber-300 bg-amber-50/70' : 'text-stone-500'
              }`}
              title={isBookmarked ? "Bookmarked" : "Bookmark Stuti"}
              aria-label="Bookmark"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-600' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 bg-white border border-stone-200/80 rounded-xl hover:bg-stone-50 text-stone-500 hover:text-amber-600 transition-colors flex items-center justify-center cursor-pointer shadow-xs"
              title="Share Stuti"
              aria-label="Share"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Header Block */}
        <div className="text-center mb-8 px-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 border border-amber-200/80 px-3 py-1 rounded-full inline-block mb-2.5">
            {stuti.deity || 'Devotional'}
          </span>
          <h1 className="font-serif text-[clamp(1.75rem,4.5vw,2.75rem)] leading-tight font-bold text-stone-900 mb-1.5">
            {stuti.title}
          </h1>
          {stuti.hindiTitle && (
            <p className="font-hindi text-base sm:text-lg text-stone-600 font-semibold mb-3">
              {stuti.hindiTitle}
            </p>
          )}
          <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full"></div>
        </div>

        {/* Audio Player Card */}
        <div className="bg-amber-950 text-white rounded-2xl p-4 sm:p-5 shadow-md mb-6 relative overflow-hidden border border-amber-800/60">
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 justify-between">
            
            {/* Title / Info */}
            <div className="flex items-center gap-3 w-full sm:w-auto text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-900/80 border border-amber-700/50 flex items-center justify-center text-amber-300 shrink-0 shadow-xs">
                <Volume2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-serif font-bold text-xs sm:text-sm leading-tight text-white truncate">
                  Devotional Chanting Audio
                </h4>
                <p className="text-[11px] text-amber-300/80 truncate">Sanskrit recitation & tanpura</p>
              </div>
            </div>

            {/* Timings and Progress */}
            <div className="w-full sm:flex-1 sm:max-w-xs px-1">
              <div className="flex items-center justify-between text-[10px] text-amber-300/80 mb-1 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              
              <div 
                className="h-2 bg-amber-900/60 rounded-full w-full cursor-pointer overflow-hidden relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  setCurrentTime(Math.floor(fraction * duration));
                }}
              >
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all duration-150" 
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>

            {/* Play Controls */}
            <div className="flex items-center gap-2 self-center sm:self-auto">
              <button 
                onClick={() => setCurrentTime(0)}
                className="p-2 hover:bg-amber-900/80 rounded-full transition-colors cursor-pointer text-amber-300"
                title="Restart"
                aria-label="Restart audio"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-amber-950" /> : <Play className="w-4 h-4 fill-amber-950 ml-0.5" />}
              </button>

              <button 
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="p-2 hover:bg-amber-900/80 rounded-full text-amber-300 transition-colors cursor-pointer"
                title="Download PDF"
                aria-label="Download PDF guide"
              >
                <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
              </button>
            </div>

          </div>
        </div>

        {/* Tab Selection row */}
        <div className="flex bg-white p-1 rounded-xl border border-stone-200/80 mb-6 overflow-x-auto scrollbar-none touch-pan-x shadow-xs -mx-1 sm:mx-0">
          {(['sanskrit', 'translit', 'meaning', 'explanation', 'benefits'] as const).map((tab) => {
            const labelMap = {
              sanskrit: 'मूल श्लोक',
              translit: 'English',
              meaning: 'भावार्थ',
              explanation: 'दार्शनिक महत्व',
              benefits: 'महात्म्य'
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer text-center ${
                  activeTab === tab
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-amber-700'
                }`}
              >
                {labelMap[tab]}
              </button>
            );
          })}
        </div>

        {/* Main Verses Card */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-5 sm:p-8 mb-8 relative">
          
          <AnimatePresence mode="wait">
            {/* Tab 1: Sanskrit Verses */}
            {activeTab === 'sanskrit' && (
              <motion.div
                key="sanskrit"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>देवनागरी संस्कृत मूल पाठ</span>
                  </span>
                  <button 
                    onClick={() => handleCopyText('verses')}
                    className="text-stone-500 hover:text-amber-700 text-xs flex items-center gap-1 font-semibold transition-colors cursor-pointer p-1"
                  >
                    {copyFeedback === 'verses' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copyFeedback === 'verses' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="font-hindi text-lg sm:text-xl md:text-2xl text-center text-stone-900 leading-[2.1] whitespace-pre-line font-medium py-3 selection:bg-amber-100">
                  {stuti.sanskrit || 'संस्कृत श्लोक उपलब्ध नहीं हैं।'}
                </div>
              </motion.div>
            )}

            {/* Tab 2: Roman Transliteration */}
            {activeTab === 'translit' && (
              <motion.div
                key="translit"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-amber-600" />
                    <span>English Transliteration</span>
                  </span>
                </div>

                <div className="font-serif text-sm sm:text-base md:text-lg text-center text-stone-800 leading-[2] whitespace-pre-line italic py-3">
                  {stuti.transliteration || 'Phonetic transliteration will be added soon.'}
                </div>
              </motion.div>
            )}

            {/* Tab 3: Hindi Translation */}
            {activeTab === 'meaning' && (
              <motion.div
                key="meaning"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>सरल हिंदी भावार्थ</span>
                  </span>
                  <button 
                    onClick={() => handleCopyText('meaning')}
                    className="text-stone-500 hover:text-amber-700 text-xs flex items-center gap-1 font-semibold transition-colors cursor-pointer p-1"
                  >
                    {copyFeedback === 'meaning' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copyFeedback === 'meaning' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="font-hindi text-sm sm:text-base md:text-lg text-stone-800 leading-[1.9] whitespace-pre-line text-left sm:text-justify py-3 selection:bg-amber-100">
                  {stuti.hindiMeaning || 'हिंदी भावार्थ शीघ्र उपलब्ध होगा।'}
                </div>
              </motion.div>
            )}

            {/* Tab 4: Philosophical Commentary */}
            {activeTab === 'explanation' && (
              <motion.div
                key="explanation"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>आध्यात्मिक महत्व एवं दार्शनिक पृष्ठभूमि</span>
                  </span>
                </div>

                <div className="font-hindi text-sm sm:text-base text-stone-700 leading-[1.8] whitespace-pre-line text-left sm:text-justify py-3">
                  {stuti.spiritualExplanation || 'इस स्तुति की दार्शनिक विवेचना शीघ्र जोड़ी जाएगी।'}
                </div>
              </motion.div>
            )}

            {/* Tab 5: Chanting Benefits */}
            {activeTab === 'benefits' && (
              <motion.div
                key="benefits"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>पाठ के लाभ एवं महात्म्य</span>
                  </span>
                </div>

                <div className="font-hindi text-sm sm:text-base text-stone-800 leading-[1.8] bg-amber-50/60 p-4 sm:p-5 rounded-xl border border-amber-200/60 whitespace-pre-line">
                  {stuti.benefits || 'नित्य पाठ से मानसिक शांति, भक्ति और दैवीय कृपा प्राप्त होती है।'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Support Alert banner */}
        <div className="bg-stone-900 text-stone-300 p-5 sm:p-6 rounded-2xl border border-stone-800 shadow-md flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="text-left">
            <h4 className="font-serif text-white font-bold text-sm mb-0.5">Need guidance on Sanskrit pronunciation?</h4>
            <p className="text-xs text-stone-400">Join our weekly live chanting sessions with Gurukul Acharyas.</p>
          </div>
          <Link 
            to="/join-us" 
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl text-center shadow-xs transition-colors shrink-0"
          >
            Contact Acharya
          </Link>
        </div>

      </div>
    </div>
  );
}
