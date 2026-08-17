/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Download, X, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import { db, AppSettings } from '../lib/db';
import { normalizeUrl } from '../lib/urlUtils';

export default function AppDownloadPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('desktop');

  useEffect(() => {
    // 1. Platform Detection
    const userAgent = navigator.userAgent || navigator.vendor || '';
    if (/android/i.test(userAgent)) {
      setPlatform('android');
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      setPlatform('ios');
    } else {
      setPlatform('desktop');
    }

    // 2. Subscribe to Firestore Settings for real-time APK config
    const unsub = db.subscribeToAppSettings((settings) => {
      setAppSettings(settings);
      const apkUrl = normalizeUrl(settings?.apkDownloadUrl);
      
      const isDismissed = localStorage.getItem('hari_pathshala_apk_dismissed');
      if (settings?.forceUpdate) {
        setIsVisible(true);
      } else if (apkUrl) {
        setIsVisible(!isDismissed);
      } else {
        setIsVisible(false);
      }
    });

    return () => unsub();
  }, []);

  const handleLater = () => {
    localStorage.setItem('hari_pathshala_apk_dismissed', 'true');
    localStorage.setItem('hari_pathshala_apk_dismissed_time', Date.now().toString());
    setIsVisible(false);
  };

  const apkUrl = normalizeUrl(appSettings?.apkDownloadUrl);

  const handleDownload = () => {
    if (apkUrl) {
      window.open(apkUrl, '_blank');
    } else {
      window.location.href = '/apk.apk';
    }
  };

  if (!isVisible || !apkUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="w-full bg-amber-50 border-b border-amber-200/60 shadow-md relative z-[1000]"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Left Content Column */}
            <div className="flex items-center gap-4 text-center md:text-left w-full md:w-auto justify-center md:justify-start">
              
              {/* App Icon Container */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-md border-2 border-white">
                <span className="font-serif font-black text-xl">HP</span>
              </div>

              {/* Text Description */}
              <div>
                <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                  <h4 className="font-serif font-bold text-stone-900 text-sm md:text-base">Hari Pathshala App</h4>
                  <span className="text-[10px] bg-orange-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    v{appSettings?.version || '1.2.0'}
                  </span>
                  {appSettings?.forceUpdate && (
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                      <span>Important Update</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 mt-0.5 max-w-lg leading-relaxed">
                  {platform === 'ios' 
                    ? 'Our iOS client is in appraisal. Read stutis, articles and access spiritual utilities in your pocket!'
                    : 'Access authentic Bhagavad Gita commentary, daily stutis and spiritual store directly in your pocket.'}
                </p>
              </div>
            </div>

            {/* Middle QR Code for Desktop */}
            {platform === 'desktop' && (
              <div className="hidden lg:flex items-center gap-3 bg-white px-3 py-1.5 rounded-2xl border border-amber-200 shadow-sm shrink-0">
                {/* Simulated QR Code vector */}
                <div className="w-10 h-10 bg-stone-900 rounded p-1 flex flex-wrap gap-0.5 shrink-0 select-none">
                  <div className="w-4 h-4 bg-white rounded-sm border-2 border-stone-900 m-0.5 flex items-center justify-center"><div className="w-1 h-1 bg-stone-900"></div></div>
                  <div className="w-4 h-4 bg-white rounded-sm border-2 border-stone-900 m-0.5 flex items-center justify-center"><div className="w-1 h-1 bg-stone-900"></div></div>
                  <div className="w-4 h-4 bg-white rounded-sm border-2 border-stone-900 m-0.5 flex items-center justify-center"><div className="w-1 h-1 bg-stone-900"></div></div>
                  <div className="w-4 h-4 bg-stone-900 rounded-sm"></div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-800 uppercase tracking-wider">Scan to Download</p>
                  <p className="text-[10px] text-stone-500 mt-0.5">Android APK</p>
                </div>
              </div>
            )}

            {/* Right CTAs Column */}
            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-center md:justify-end">
              
              <Link 
                to="/download"
                onClick={() => setIsVisible(false)}
                className="px-3.5 py-2 hover:bg-stone-200/60 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                <Smartphone className="w-3.5 h-3.5 text-orange-600" />
                <span>App Info</span>
              </Link>

              <button 
                onClick={handleLater}
                className="px-3 py-2 hover:bg-stone-200/50 text-stone-500 font-medium text-xs rounded-xl transition-colors cursor-pointer"
              >
                Later
              </button>

              {platform === 'ios' ? (
                <div className="text-[11px] font-bold text-amber-800 bg-amber-100 px-4 py-2 rounded-xl flex items-center gap-1.5 border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>iOS Version coming soon</span>
                </div>
              ) : (
                <button 
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow hover:shadow-md transition-all hover:scale-102 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download APK</span>
                </button>
              )}

              <button 
                onClick={handleLater}
                className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/40 rounded-full transition-colors cursor-pointer"
                title="Dismiss Banner"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
