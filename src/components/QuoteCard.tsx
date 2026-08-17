/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Share2, Sparkles, BookOpen, Copy, Check, Heart } from 'lucide-react';
import { Quote } from '../lib/db';
import { useAuth } from '../lib/auth';
import QuoteShareModal from './QuoteShareModal';
import { DEFAULT_SPIRITUAL_AVATAR } from '../lib/quoteUtils';

interface QuoteCardProps {
  key?: string | number;
  quote: Quote;
  compact?: boolean;
  festivalName?: string;
}

export default function QuoteCard({ quote, compact = false, festivalName }: QuoteCardProps) {
  const { currentUser } = useAuth();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const userPhoto = currentUser?.photoURL || DEFAULT_SPIRITUAL_AVATAR;
  const userName = currentUser?.displayName || currentUser?.fullName || 'Hari Pathshala Sadhak';

  const quoteText = quote.quote || quote.content || quote.text || '';
  const displayAuthor = quote.author === 'Kabir' ? 'कबीर' : (quote.author || 'Hari Pathshala');
  const activeFestival = festivalName || quote.festival;

  const handleCopy = () => {
    const textToCopy = `“${quoteText}”\n— ${displayAuthor}${quote.source ? ` (${quote.source})` : ''}\n\n🚩 Hari Pathshala • ज्ञान • भक्ति • संस्कार\nhttps://haripathshala.online`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        className={`bg-white border border-stone-200/90 rounded-[28px] p-6 sm:p-8 shadow-md hover:shadow-xl hover:border-orange-300 transition-all relative overflow-hidden flex flex-col justify-between ${
          compact ? 'max-w-3xl mx-auto' : 'w-full'
        }`}
      >
        {/* Background decorative watermark */}
        <div className="absolute top-0 right-0 p-4 text-orange-100/50 pointer-events-none text-8xl font-serif select-none leading-none">
          “
        </div>

        {/* Card Header: User avatar + Category & Festival badges */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <img
              src={userPhoto}
              alt={userName}
              className="w-9 h-9 rounded-full object-cover border-2 border-orange-400 shadow-sm shrink-0"
              onError={(e) => { e.currentTarget.src = DEFAULT_SPIRITUAL_AVATAR; }}
            />
            <div>
              <p className="text-xs sm:text-sm font-bold text-stone-900 leading-none">{userName}</p>
              <p className="text-[10px] text-stone-400 font-medium mt-0.5">साधक • Hari Pathshala</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {activeFestival && (
              <span className="text-[10px] font-black tracking-wide bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{activeFestival}</span>
              </span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-900 px-3 py-1 rounded-full border border-orange-200/80">
              {quote.category || 'Spiritual'}
            </span>
          </div>
        </div>

        {/* Optional Quote Image if present */}
        {quote.imageUrl && (
          <div className="mb-5 rounded-2xl overflow-hidden aspect-[16/9] border border-stone-200 shadow-inner">
            <img 
              src={quote.imageUrl} 
              alt={quote.author} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Quote Content */}
        <div className="my-2 relative z-10">
          <p className="font-hindi text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 leading-[1.65] drop-shadow-2xs whitespace-pre-line text-left">
            “{quoteText}”
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-orange-700">
            <span>— {displayAuthor}</span>
            {quote.source && (
              <span className="text-stone-500 font-normal italic">
                ({quote.source})
              </span>
            )}
            {quote.topic && (
              <span className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium">
                #{quote.topic}
              </span>
            )}
          </div>

          {quote.explanation && (
            <div className="mt-3 p-3 rounded-xl bg-orange-50/60 border border-orange-100/80 text-xs sm:text-sm text-stone-700 font-hindi leading-relaxed">
              <span className="font-bold text-orange-800">भावार्थ: </span>
              {quote.explanation}
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-5 mt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-orange-500" />
            <span>ज्ञान • भक्ति • संस्कार</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Copy quote text"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShareModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Image</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Share Modal Trigger */}
      {shareModalOpen && (
        <QuoteShareModal
          quote={quote}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </>
  );
}
