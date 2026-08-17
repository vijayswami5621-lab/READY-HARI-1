import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube, Send, Twitter, Download as DownloadIcon, MessageCircle } from 'lucide-react';
import { db, AppSettings, DEFAULT_WHATSAPP_GROUP_URL } from '../lib/db';
import { normalizeUrl } from '../lib/urlUtils';

const DEFAULT_LOGO = 'https://i.ibb.co/qMG2MS27/logo.png';

export default function Footer() {
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    const unsubImages = db.subscribeToDynamicImages((images) => {
      const rawLogo = images.websiteLogo || images.appIcon || DEFAULT_LOGO;
      setLogoUrl(normalizeUrl(rawLogo) || DEFAULT_LOGO);
    });

    const unsubSettings = db.subscribeToAppSettings((st) => {
      setSettings(st);
    });

    return () => {
      unsubImages();
      unsubSettings();
    };
  }, []);

  const appName = settings?.appName || 'Hari Pathshala';
  const tagline = settings?.tagline || 'एक Modern Spiritual Gurukul';
  const contactPhone = settings?.contactPhone || '+91 9610579423';
  const contactEmail = settings?.contactEmail || 'haripathshala@gmail.com';
  const address = settings?.address || 'Jaipur, Rajasthan, India';
  const whatsappGroupUrl = settings?.whatsappGroupUrl || DEFAULT_WHATSAPP_GROUP_URL;
  const social = settings?.socialLinks;

  return (
    <footer className="bg-stone-900 text-white pt-16 pb-8 border-t-[8px] border-orange-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden flex items-center justify-center bg-orange-100 shadow-md border-2 border-orange-200 drop-shadow-md">
                <img src={logoUrl} alt={appName} className="w-[80%] h-[80%] object-contain" referrerPolicy="no-referrer" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white block leading-none">
                {appName}
              </span>
            </Link>
            <p className="text-stone-400 leading-relaxed text-sm mt-4">
              {appName} {tagline} — Bhagavad Gita, Ramcharitmanas, Sanskrit, Shlokas और Sanatana Dharma की दिव्य शिक्षाएँ।
            </p>
            <p className="text-orange-400 font-bold italic mt-4 text-sm leading-relaxed">
              "श्री राम जय राम जय जय राम"<br/>
              राम नाम ही जीवन का प्रकाश है।
            </p>
            <div className="flex space-x-3 pt-2">
              {social?.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="bg-white/5 p-2 rounded-full hover:bg-white/20 transition-colors text-stone-400 hover:text-white" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
              )}
              {social?.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="bg-white/5 p-2 rounded-full hover:bg-white/20 transition-colors text-stone-400 hover:text-white" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
              )}
              {social?.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="bg-white/5 p-2 rounded-full hover:bg-white/20 transition-colors text-stone-400 hover:text-white" aria-label="YouTube">
                  <Youtube size={18} />
                </a>
              )}
              {social?.telegram && (
                <a href={social.telegram} target="_blank" rel="noopener noreferrer" className="bg-white/5 p-2 rounded-full hover:bg-white/20 transition-colors text-stone-400 hover:text-white" aria-label="Telegram">
                  <Send size={18} />
                </a>
              )}
              {social?.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="bg-white/5 p-2 rounded-full hover:bg-white/20 transition-colors text-stone-400 hover:text-white" aria-label="Twitter">
                  <Twitter size={18} />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg text-white mb-6 tracking-wider">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'About', path: '/about' },
                { name: 'Founder', path: '/founder' },
                { name: 'Bhagavad Gita', path: '/gita' },
                { name: 'Ramcharitmanas', path: '/ramcharitmanas' },
                { name: 'Sanskrit Learning', path: '/sanskrit' },
                { name: 'Stutis', path: '/stutis' },
                { name: 'Contact Us', path: '/contact' },
                { name: 'Download App', path: '/download' },
                { name: 'Join Hari Pathshala', path: '/join' },
                { name: 'Gurukul Store', path: '/store' }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path} 
                    className="text-stone-400 hover:text-orange-400 hover:translate-x-1 inline-block transition-all text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg text-white mb-6 tracking-wider">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-sm text-stone-400">
                <MapPin size={18} className="text-orange-500 shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-stone-400">
                <Phone size={18} className="text-orange-500 shrink-0" />
                <span>{contactPhone}</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-stone-400">
                <Mail size={18} className="text-orange-500 shrink-0" />
                <span>{contactEmail}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg text-white mb-6 tracking-wider">Daily Inspiration</h3>
            <p className="text-sm text-stone-400 mb-4 leading-relaxed">
              Join our WhatsApp community for daily spiritual wisdom, Gita shlokas, and satsang updates.
            </p>
            <a 
              href={whatsappGroupUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#128C7E] transition-all shadow-lg w-full text-center hover:shadow-green-500/20 active:scale-98"
            >
              <MessageCircle size={18} className="shrink-0" />
              <span>Join WhatsApp Group</span>
            </a>
          </div>

        </div>

        <div className="border-t border-stone-800 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-stone-500 text-sm">
            &copy; 2026 {appName} — All Rights Reserved
          </p>
          <p className="text-stone-500 text-sm mt-2 md:mt-0 flex items-center">
            Made with <span className="text-orange-500 mx-1">❤️</span> for Sanatana Dharma & Bhakti
          </p>
        </div>
      </div>
    </footer>
  );
}
