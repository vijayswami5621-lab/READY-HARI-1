/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { X, Share2, Download, Copy, Check, Sparkles, MessageCircle, RefreshCw } from 'lucide-react';
import { Quote, db } from '../lib/db';
import { useAuth } from '../lib/auth';
import { generateQrCodeDataUrl, fetchAsDataUrl, DEFAULT_SPIRITUAL_AVATAR } from '../lib/quoteUtils';

interface QuoteShareModalProps {
  quote: Quote | null;
  onClose: () => void;
}

export default function QuoteShareModal({ quote, onClose }: QuoteShareModalProps) {
  const { currentUser } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  // Data URLs for canvas safety
  const [userAvatarDataUrl, setUserAvatarDataUrl] = useState<string>(DEFAULT_SPIRITUAL_AVATAR);
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (!quote) return;

    let isMounted = true;
    setIsGenerating(true);
    setGeneratedImageUrl(null);

    async function prepareAssets() {
      // 1. Prepare User Avatar
      const rawAvatar = currentUser?.photoURL || '';
      const avatarData = await fetchAsDataUrl(rawAvatar, DEFAULT_SPIRITUAL_AVATAR);

      // 2. Prepare App Logo
      const rawLogo = db.getDynamicImage('websiteLogo') || 'https://i.ibb.co/qMG2MS27/logo.png';
      const logoData = await fetchAsDataUrl(rawLogo, rawLogo);

      // 3. Prepare QR Code
      const qrTargetUrl = `https://haripathshala.online/quotes?id=${quote.id}`;
      const qrData = await generateQrCodeDataUrl(qrTargetUrl);

      if (isMounted) {
        setUserAvatarDataUrl(avatarData);
        setLogoDataUrl(logoData);
        setQrCodeDataUrl(qrData);
      }
    }

    prepareAssets();

    return () => {
      isMounted = false;
    };
  }, [quote, currentUser]);

  // Generate PNG once DOM assets are set
  useEffect(() => {
    if (!quote || !qrCodeDataUrl) return;

    const timer = setTimeout(async () => {
      if (cardRef.current) {
        try {
          const dataUrl = await toPng(cardRef.current, {
            cacheBust: true,
            pixelRatio: 2,
            quality: 0.98,
            skipFonts: true
          });
          setGeneratedImageUrl(dataUrl);
        } catch (err) {
          console.warn('Error generating quote image with skipFonts, trying fallback:', err);
          try {
            const dataUrlFallback = await toPng(cardRef.current, {
              cacheBust: false,
              pixelRatio: 1,
              fontEmbedCSS: ''
            });
            setGeneratedImageUrl(dataUrlFallback);
          } catch (fallbackErr) {
            console.error('Failed to generate quote image:', fallbackErr);
          }
        } finally {
          setIsGenerating(false);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [quote, qrCodeDataUrl, userAvatarDataUrl, logoDataUrl]);

  if (!quote) return null;

  const quoteText = quote.content || quote.quote || quote.text || '';
  const displayAuthor = quote.author === 'Kabir' ? 'कबीर' : (quote.author || 'Hari Pathshala');

  const quoteShareUrl = `https://haripathshala.online/quotes?id=${quote.id}`;

  // Native File Sharing
  const handleNativeShare = async () => {
    setShareError(null);
    if (!generatedImageUrl) return;

    try {
      // Convert Data URL to Blob / File
      const blob = await (await fetch(generatedImageUrl)).blob();
      const file = new File([blob], `haripathshala-quote-${quote.id}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Hari Pathshala - आज का विचार',
          text: `“${quoteText}”\n— ${displayAuthor}\n\nपढ़ें हरि पाठशाला पर:`,
          url: quoteShareUrl,
          files: [file]
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'Hari Pathshala - आज का विचार',
          text: `“${quoteText}”\n— ${displayAuthor}\n\n${quoteShareUrl}`
        });
      } else {
        handleDownloadImage();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Native share failed, downloading instead:', err);
        handleDownloadImage();
      }
    }
  };

  // Direct Image Download
  const handleDownloadImage = () => {
    if (!generatedImageUrl) return;
    const a = document.createElement('a');
    a.href = generatedImageUrl;
    a.download = `haripathshala-quote-${quote.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // WhatsApp Direct Text Share
  const handleWhatsAppShare = () => {
    const text = `✨ *आज का आध्यात्मिक विचार - Hari Pathshala* ✨\n\n“${quoteText}”\n\n— *${displayAuthor}* ${quote.source ? `(${quote.source})` : ''}\n\n📖 पूर्ण विचार पढ़ें: ${quoteShareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(quoteShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const userName = currentUser?.displayName || currentUser?.fullName || 'Sadhak Member';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl bg-white rounded-[32px] p-6 shadow-2xl overflow-hidden border border-stone-200 my-8"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-150 mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-600" />
              <h3 className="font-serif text-lg font-bold text-stone-900">Share Quote Image</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* HIDDEN / OFFSCREEN TEMPLATE CARD FOR HTML-TO-IMAGE CONVERSION */}
          <div className="absolute top-[-9999px] left-[-9999px] pointer-events-none">
            <div
              ref={cardRef}
              className="w-[600px] h-[600px] p-8 flex flex-col justify-between bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 text-stone-900 font-serif relative overflow-hidden border-[8px] border-orange-600 rounded-[32px] shadow-2xl"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 0%, rgba(251, 146, 60, 0.15), transparent 70%), radial-gradient(circle at 50% 100%, rgba(234, 88, 12, 0.1), transparent 70%)`
              }}
            >
              {/* Corner Ornaments */}
              <div className="absolute top-3 left-3 text-orange-400/60 text-xl font-sans">🪔</div>
              <div className="absolute top-3 right-3 text-orange-400/60 text-xl font-sans">🪔</div>
              <div className="absolute bottom-3 left-3 text-orange-400/60 text-xl font-sans">🚩</div>
              <div className="absolute bottom-3 right-3 text-orange-400/60 text-xl font-sans">🚩</div>

              {/* CARD TOP HEADER: Brand + User Info */}
              <div className="flex items-center justify-between border-b-2 border-orange-200 pb-4">
                {/* Brand Logo & Name */}
                <div className="flex items-center gap-3">
                  <img
                    src={logoDataUrl || 'https://i.ibb.co/qMG2MS27/logo.png'}
                    alt="Hari Pathshala"
                    className="w-12 h-12 rounded-full object-cover border-2 border-orange-500 shadow-sm"
                  />
                  <div>
                    <h1 className="font-serif text-xl font-black text-stone-900 tracking-tight leading-none">
                      Hari Pathshala
                    </h1>
                    <p className="text-[11px] font-sans font-bold text-orange-700 tracking-wider mt-1">
                      ज्ञान • भक्ति • संस्कार
                    </p>
                  </div>
                </div>

                {/* User Profile Avatar */}
                <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-orange-200 shadow-sm">
                  <img
                    src={userAvatarDataUrl}
                    alt={userName}
                    className="w-8 h-8 rounded-full object-cover border border-orange-500"
                  />
                  <div className="text-left font-sans">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block leading-none">Shared By</span>
                    <span className="text-xs font-bold text-stone-800 leading-tight block">{userName}</span>
                  </div>
                </div>
              </div>

              {/* CARD CENTER QUOTE */}
              <div className="my-auto py-6 px-4 text-center relative">
                <span className="text-5xl font-black text-orange-400/40 block leading-none mb-1">“</span>
                <p className="text-2xl font-bold leading-[1.8] text-stone-900 px-2 font-hindi drop-shadow-sm whitespace-pre-line">
                  {quoteText}
                </p>
                <span className="text-5xl font-black text-orange-400/40 block leading-none mt-1">”</span>

                <div className="mt-4 flex flex-col items-center">
                  <div className="w-16 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent mb-3 rounded-full" />
                  <p className="text-base font-bold text-orange-800 font-sans tracking-wide">
                    — {displayAuthor}
                  </p>
                  {quote.source && (
                    <p className="text-xs text-stone-600 italic font-sans mt-0.5">
                      ({quote.source})
                    </p>
                  )}
                </div>
              </div>

              {/* CARD FOOTER: QR Code + Domain */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-orange-200 bg-white/60 p-3 rounded-2xl border border-orange-100">
                <div className="flex items-center gap-3">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code"
                      className="w-16 h-16 rounded-lg border border-orange-300 p-1 bg-white shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg border border-orange-300 bg-white" />
                  )}
                  <div className="font-sans text-left">
                    <p className="text-[11px] font-bold text-stone-800">स्कैन करें एवं पूर्ण विचार पढ़ें</p>
                    <p className="text-xs font-black text-orange-600 mt-0.5">haripathshala.online</p>
                    <p className="text-[9px] text-stone-500 mt-0.5">🚩 श्री सीताराम नाम महिमा</p>
                  </div>
                </div>

                <div className="text-right font-sans">
                  <span className="text-[10px] bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-orange-200">
                    {quote.category || 'Spiritual'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* VISIBLE PREVIEW */}
          <div className="space-y-5">
            {isGenerating ? (
              <div className="aspect-square w-full max-w-[360px] mx-auto bg-stone-100 rounded-3xl border border-stone-200 flex flex-col items-center justify-center gap-3 p-6">
                <RefreshCw className="w-8 h-8 text-orange-600 animate-spin" />
                <p className="text-xs font-bold text-stone-600">Generating Professional Quote Image...</p>
              </div>
            ) : generatedImageUrl ? (
              <div className="relative group max-w-[380px] mx-auto">
                <img
                  src={generatedImageUrl}
                  alt="Generated Quote"
                  className="w-full aspect-square rounded-3xl object-cover border-2 border-orange-200 shadow-xl"
                />
                <div className="absolute top-3 right-3 bg-stone-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                  HD Card Preview
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-red-600 bg-red-50 rounded-2xl">
                Could not render preview image. You can still share text or download directly.
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleNativeShare}
                disabled={isGenerating}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Quote Image</span>
              </button>

              <button
                onClick={handleDownloadImage}
                disabled={isGenerating || !generatedImageUrl}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-orange-400" />
                <span>Download Quote Image</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleWhatsAppShare}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share Text on WhatsApp</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-stone-200"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>

            {shareError && (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-center font-medium">
                {shareError}
              </p>
            )}

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
