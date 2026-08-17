/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Download, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Music, 
  Bell, 
  Flame,
  QrCode,
  Zap, 
  Info, 
  ExternalLink,
  MessageCircle,
  HeartHandshake
} from 'lucide-react';
import QRCode from 'qrcode';
import SEO from '../components/SEO';
import { 
  db, 
  AppSettings, 
  DEFAULT_WHATSAPP_GROUP_URL, 
  DEFAULT_APK_DOWNLOAD_URL 
} from '../lib/db';
import { normalizeUrl } from '../lib/urlUtils';

const DEFAULT_APP_LOGO = 'https://i.ibb.co/qMG2MS27/logo.png';

export default function DownloadPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_APP_LOGO);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // 1. Realtime listener to Firestore App Settings & Dynamic Images
  useEffect(() => {
    const unsubSettings = db.subscribeToAppSettings((st) => {
      setSettings(st);
    });

    const unsubImages = db.subscribeToDynamicImages((images) => {
      const img = images.mobileAppLogo || images.websiteLogo || images.appIcon || DEFAULT_APP_LOGO;
      setLogoUrl(normalizeUrl(img) || DEFAULT_APP_LOGO);
    });

    return () => {
      unsubSettings();
      unsubImages();
    };
  }, []);

  // 2. Normalize APK URL & WhatsApp URL with fallback defaults
  const apkDownloadUrl = normalizeUrl(settings?.apkDownloadUrl) || DEFAULT_APK_DOWNLOAD_URL;
  const whatsappGroupUrl = normalizeUrl(settings?.whatsappGroupUrl) || DEFAULT_WHATSAPP_GROUP_URL;

  const appVersion = settings?.version || '2.4.0';
  const buildNumber = settings?.buildNumber || '108';
  const releaseNotesRaw = settings?.releaseNotes || '';

  // 3. Generate QR Code for Mobile Scanning
  useEffect(() => {
    const targetUrl = apkDownloadUrl || (typeof window !== 'undefined' ? window.location.href : 'https://haripathshala.online/download');
    QRCode.toDataURL(targetUrl, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#1c1917',
        light: '#ffffff'
      }
    }).then(url => {
      setQrCodeDataUrl(url);
    }).catch(err => {
      console.warn('QR Code generation notice:', err);
    });
  }, [apkDownloadUrl]);

  // 4. Download Handler
  const handleDownload = () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      // Create safe link and trigger download/navigation
      const link = document.createElement('a');
      link.href = apkDownloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => {
        setIsDownloading(false);
      }, 1500);
    } catch (e) {
      window.open(apkDownloadUrl, '_blank', 'noopener,noreferrer');
      setIsDownloading(false);
    }
  };

  // 5. Default Release Notes Bullet points if none provided by admin
  const defaultReleaseNotes = [
    '✨ Automatic Daily Festival & Auspicious Suvichar Notifications',
    '🪔 Live Vedic Panchang, Tithi, Nakshatra & Abhijit Muhurat updates',
    '📖 Complete Srimad Bhagavad Gita with Shlokas, Hindi translations & Audio',
    '🌺 Sacred Stutis & Chalisa recitations with Sanskrit lyrics & PDF downloads',
    '🛍️ Sacred Gurukul Store for authentic Vrindavan Tulsi Malas & Devotional accoutrements',
    '⚡ Ultra-fast performance with seamless offline caching'
  ];

  const parsedReleaseNotes = releaseNotesRaw 
    ? releaseNotesRaw.split('\n').filter(line => line.trim().length > 0)
    : defaultReleaseNotes;

  const appHighlights = [
    {
      icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 shrink-0" />,
      title: 'सम्पूर्ण भगवद्गीता एवं रामायण',
      desc: 'सभी १८ अध्याय, ७०० श्लोक एवं श्रीरामचरितमानस की चौपाइयां सरल हिंदी अर्थ के साथ।'
    },
    {
      icon: <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 shrink-0" />,
      title: 'दैनिक पंचांग एवं विशेष पर्व',
      desc: 'सूर्योदय, सूर्यास्त, राहुकाल, शुभ मुहूर्त एवं आज के त्योहारों की सटीक जानकारी।'
    },
    {
      icon: <Music className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 shrink-0" />,
      title: 'स्तुति, चालीसा एवं ऑडियो',
      desc: 'हनुमान चालीसा, शिव तांडव, राम स्तुति का सस्वर पाठ एवं संस्कृत लिरिक्स।'
    },
    {
      icon: <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 shrink-0" />,
      title: 'दैनिक सुविचार एवं प्रेरणा',
      desc: 'प्रतिदिन प्रातः काल पावन सुविचार, सनातन धर्म का ज्ञान एवं साधना मार्गदर्शन।'
    },
    {
      icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 shrink-0" />,
      title: 'फास्ट एवं ऑफलाइन सपोर्ट',
      desc: 'कम डेटा खर्च, तेज लोडिंग एवं बिना इंटरनेट के भी स्तुतियों का अध्ययन।'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />,
      title: '१००% सुरक्षित एवं विज्ञापन-मुक्त',
      desc: 'बिना किसी व्यवधान और व्यावसायिक विज्ञापनों के विशुद्ध आध्यात्मिक अनुभव।'
    }
  ];

  const installSteps = [
    {
      step: '1',
      title: 'APK डाउनलोड करें',
      desc: 'नीचे दिए गए "Download Android App" बटन पर क्लिक करें। APK फाइल तुरंत डाउनलोड होना शुरू हो जाएगी।'
    },
    {
      step: '2',
      title: 'अनजान स्रोत की अनुमति दें',
      desc: 'यदि आपका फोन "Install from Unknown Sources" का संदेश दिखाए, तो Settings में जाकर "Allow from this source" चालू करें।'
    },
    {
      step: '3',
      title: 'ऐप इंस्टॉल करें',
      desc: 'डाउनलोड हुई फाइल पर टैप करें और स्क्रीन पर "Install" बटन दबाएं।'
    },
    {
      step: '4',
      title: 'साधना आरंभ करें',
      desc: 'ऐप खोलें और भगवान श्री राम, भगवद्गीता एवं दैनिक साधना की दिव्य यात्रा से जुड़ें।'
    }
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-stone-50/50 pb-20">
      <SEO 
        title="Download Hari Pathshala App | Official Android APK"
        description="Get the official Hari Pathshala Android App and experience Sanatana Dharma, Gita wisdom, Stutis, Panchang, Quotes and spiritual content in one place."
        url="/download"
      />

      {/* Main Header / Hero Container */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-100/60 via-orange-50/40 to-stone-50 pt-8 sm:pt-12 pb-14 sm:pb-18 border-b border-stone-200">
        
        {/* Subtle Decorative Ambience */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-300/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Top Pill Badge */}
          <div className="text-center mb-6">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-orange-100 text-orange-900 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest border border-orange-200/90 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Download Official App • Experience Hari Pathshala on Android</span>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: App Identity & Download CTAs */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 text-center lg:text-left"
            >
              
              {/* App Icon + Title */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 mb-5 justify-center lg:justify-start">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-2.5 shadow-xl border-2 border-orange-200 shrink-0 flex items-center justify-center relative overflow-hidden group">
                  <img 
                    src={logoUrl} 
                    alt="Hari Pathshala Logo" 
                    className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                    onError={(e) => { e.currentTarget.src = DEFAULT_APP_LOGO; }}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />
                </div>

                <div>
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight">
                    Download Hari Pathshala App
                  </h1>
                  <p className="font-serif text-base sm:text-lg font-bold text-orange-600 mt-1">
                    Read • Learn • Listen • Pray
                  </p>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-2">
                    <span className="bg-stone-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Android APK
                    </span>
                    <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
                      Version {appVersion}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Latest Official Release</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Subtitle */}
              <p className="text-stone-700 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium mb-6">
                Get the official <span className="font-bold text-stone-900">Hari Pathshala Android App</span> and experience Sanatana Dharma, Gita wisdom, Stutis, Panchang, Quotes and spiritual content in one place.
              </p>

              {/* Action Buttons: Primary APK Download + Secondary WhatsApp Group */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-6">
                
                {/* Primary APK Download Button */}
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="min-h-[52px] sm:min-h-[56px] px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-98 bg-orange-600 hover:bg-orange-700 text-white shadow-orange-200 hover:shadow-2xl hover:-translate-y-0.5"
                >
                  <Download className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${isDownloading ? 'animate-bounce' : ''}`} />
                  <span>
                    {isDownloading 
                      ? 'डाउनलोड शुरू हो रहा है...' 
                      : 'Download Android App'}
                  </span>
                </button>

                {/* Secondary WhatsApp Community Group Button */}
                <a
                  href={whatsappGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[52px] sm:min-h-[56px] px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 bg-[#25D366] hover:bg-[#128C7E] text-white hover:shadow-green-500/20 hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                  <span>Join WhatsApp Group</span>
                </a>

              </div>

              {/* Safety & Need Help note */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-stone-600 mb-6">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">100% Safe • Direct APK • No Ads</span>
                </div>
                <span className="text-stone-300 hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Need help? Join our WhatsApp community.</span>
                </div>
              </div>

              {/* Download notification feedback */}
              {downloadSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex items-center gap-3 mb-6"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">APK डाउनलोड शुरू हो गया है!</p>
                    <p className="text-emerald-700 text-xs mt-0.5">डाउनलोड पूर्ण होने पर फाइल को खोलकर "Install" करें।</p>
                  </div>
                </motion.div>
              )}

              {/* Quick Specs Pill Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center border-t border-stone-200/80 pt-6">
                <div className="p-2.5 sm:p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-stone-200/60">
                  <p className="text-[10px] sm:text-[11px] text-stone-400 font-bold uppercase">Size</p>
                  <p className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">~18 MB</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-stone-200/60">
                  <p className="text-[10px] sm:text-[11px] text-stone-400 font-bold uppercase">Requires</p>
                  <p className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">Android 7.0+</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-stone-200/60">
                  <p className="text-[10px] sm:text-[11px] text-stone-400 font-bold uppercase">Price</p>
                  <p className="text-xs sm:text-sm font-bold text-emerald-700 mt-0.5">100% Free</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-stone-200/60">
                  <p className="text-[10px] sm:text-[11px] text-stone-400 font-bold uppercase">Language</p>
                  <p className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">हिन्दी / संस्कृत</p>
                </div>
              </div>

            </motion.div>

            {/* Right Column: QR Code & Direct Scan Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-5 flex flex-col items-center justify-center"
            >
              <div className="w-full max-w-sm bg-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-8 shadow-2xl border border-stone-200 text-center relative overflow-hidden">
                
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-50 px-3 py-1 rounded-full mb-3 sm:mb-4 border border-orange-200/80">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan to Download</span>
                </div>

                <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 mb-1">
                  मोबाइल से स्कैन करें
                </h3>
                <p className="text-xs text-stone-500 mb-4 sm:mb-5">
                  अपने फोन के कैमरा या QR स्कैनर से सीधे ऐप डाउनलोड करें
                </p>

                {/* QR Code Container */}
                <div className="p-3 sm:p-4 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300 inline-block shadow-inner mb-3 sm:mb-4">
                  {qrCodeDataUrl ? (
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Hari Pathshala APK QR Code" 
                      className="w-40 h-40 sm:w-48 sm:h-48 object-contain mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center text-stone-400">
                      <QrCode className="w-12 h-12 animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-stone-500 font-medium">
                  Scan opens direct APK download link
                </div>

              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* Main Content Body: Release Notes + Installation Steps + Features */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
          
          {/* Left Column: Release Notes (What's New) & Community Box */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Release Notes */}
            <div className="bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 border border-stone-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-orange-600" />
                <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                  Latest Updates (What's New)
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-stone-500 mb-5 pb-3 border-b border-stone-100">
                <span>Version {appVersion}</span>
                <span>•</span>
                <span>Build #{buildNumber}</span>
                <span>•</span>
                <span className="text-orange-600">Stable Release</span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-stone-700">
                {parsedReleaseNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-2 shrink-0" />
                    <span>{note.replace(/^[•\-\*]\s*/, '')}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Community / WhatsApp Helpline Box */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 text-white text-center shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-orange-600/30 border border-orange-500/40 flex items-center justify-center mx-auto mb-3 text-orange-400">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-bold mb-2">Join Our WhatsApp Community</h4>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-4">
                दैनिक गीता श्लोक, प्रेरक सुविचार, सत्संग अपडेट्स और हरि पथशाला परिवार से जुड़ने के लिए हमारे आधिकारिक ग्रुप में शामिल हों।
              </p>
              <a 
                href={whatsappGroupUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-md active:scale-98 w-full sm:w-auto"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Join Hari Pathshala WhatsApp Group</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Step-by-Step Installation Instructions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 border border-stone-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-5 h-5 text-orange-600" />
                <h3 className="font-serif text-lg sm:text-2xl font-bold text-stone-900">
                  सरल इंस्टॉलेशन मार्गदर्शिका (Installation Guide)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mb-5 sm:mb-6">
                Android फोन में APK फाइल को सुरक्षित रूप से इंस्टॉल करने के लिए इन ४ सरल चरणों का पालन करें:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {installSteps.map((item) => (
                  <div 
                    key={item.step}
                    className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 hover:border-orange-200 hover:bg-orange-50/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-bold text-sm flex items-center justify-center mb-2.5 sm:mb-3 shadow-xs">
                        {item.step}
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm sm:text-base mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Android Note */}
              <div className="mt-5 sm:mt-6 p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5 sm:gap-3">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">विशेष सूचना: </span>
                  चूंकि यह आधिकारिक APK सीधे हमारी वेबसाइट से वितरित किया जाता है, आपका फोन "Unknown Source" का सुरक्षा संकेत दे सकता है। ऐप पूरी तरह सुरक्षित और १००% वायरस-मुक्त है।
                </div>
              </div>
            </div>

            {/* App Features Showcase */}
            <div className="bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 border border-stone-200 shadow-sm">
              <div className="flex items-center gap-2 mb-5 sm:mb-6">
                <Sparkles className="w-5 h-5 text-orange-600" />
                <h3 className="font-serif text-lg sm:text-2xl font-bold text-stone-900">
                  ऐप की प्रमुख विशेषताएं (App Highlights)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {appHighlights.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-orange-50 border border-orange-100 shrink-0">
                      {feat.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm">{feat.title}</h4>
                      <p className="text-xs text-stone-500 leading-relaxed mt-0.5">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
