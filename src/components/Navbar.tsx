import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, User, LogIn, ShoppingCart, 
  Sparkles, ShieldCheck, Home, BookOpen, 
  ShoppingBag, Newspaper, Image as ImageIcon, PhoneCall, Info,
  HeartHandshake
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/auth';
import { db, getCart, subscribeToCart } from '../lib/db';
import { normalizeUrl } from '../lib/urlUtils';

const links = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'About', path: '/about', icon: Info },
  { name: 'Gita', path: '/gita', icon: BookOpen },
  { name: 'Ramcharitmanas', path: '/ramcharitmanas', icon: Sparkles },
  { name: 'Quotes', path: '/quotes', icon: Sparkles },
  { name: 'Gallery', path: '/gallery', icon: ImageIcon },
  { name: 'Sanskrit', path: '/sanskrit', icon: BookOpen },
  { name: 'Stutis', path: '/stutis', icon: BookOpen },
  { name: 'Store', path: '/store', icon: ShoppingBag },
  { name: 'Join Us', path: '/join', icon: HeartHandshake },
  { name: 'Blog', path: '/blog', icon: Newspaper },
  { name: 'Contact', path: '/contact', icon: PhoneCall },
];

const DEFAULT_LOGO = 'https://i.ibb.co/qMG2MS27/logo.png';
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100';

export default function Navbar() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  const activeTabRef = useRef<HTMLAnchorElement | null>(null);

  // Subscribe to dynamic branding logo changes
  useEffect(() => {
    const unsubscribe = db.subscribeToDynamicImages((images) => {
      const rawLogo = images.websiteLogo || images.appIcon || DEFAULT_LOGO;
      setLogoUrl(normalizeUrl(rawLogo) || DEFAULT_LOGO);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to shopping cart changes
  useEffect(() => {
    const countItems = (cart: any[]) => cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    setCartCount(countItems(getCart()));
    const unsub = subscribeToCart((updatedCart) => {
      setCartCount(countItems(updatedCart));
    });
    return () => unsub();
  }, []);

  // Auto scroll active pill in mobile category bar
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [location.pathname]);

  // Robust Smart Navbar Scroll Logic with Screen Lock & Back Recovery
  useEffect(() => {
    let lastY = window.scrollY || 0;
    let ticking = false;

    const restoreNav = () => {
      setIsVisible(true);
      lastY = window.scrollY || 0;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY || 0;
          setScrolled(currentScrollY > 15);

          // Always visible near top
          if (currentScrollY <= 20) {
            setIsVisible(true);
          } else {
            const diff = currentScrollY - lastY;
            if (diff > 8) {
              // Scrolling down
              setIsVisible(false);
            } else if (diff < -3) {
              // Scrolling up (even slightly)
              setIsVisible(true);
            }
          }

          lastY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('focus', restoreNav);
    window.addEventListener('pageshow', restoreNav);
    window.addEventListener('resize', restoreNav);
    window.addEventListener('popstate', restoreNav);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') restoreNav();
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('focus', restoreNav);
      window.removeEventListener('pageshow', restoreNav);
      window.removeEventListener('resize', restoreNav);
      window.removeEventListener('popstate', restoreNav);
    };
  }, []);

  // Reset navbar on route changes
  useEffect(() => {
    setIsVisible(true);
    setIsOpen(false);
  }, [location.pathname]);

  const showNavbar = isVisible || isOpen;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-out shadow-md bg-white ${
        scrolled ? 'border-b border-stone-200/90 shadow-sm' : ''
      }`}
      style={{
        transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
      }}
    >
      {/* 1. TOP PROFILE SECTION */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-amber-950 text-amber-50 border-b border-amber-500/20 px-3 sm:px-6 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          
          {/* User Profile Info & Greeting */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Link 
              to={currentUser ? "/profile" : "/login"} 
              className="relative shrink-0 group flex items-center gap-2 cursor-pointer"
              title="Go to User Profile"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-orange-100 ring-2 ring-amber-400/80 shadow-sm shrink-0 flex items-center justify-center">
                <img 
                  src={currentUser?.photoURL || DEFAULT_AVATAR} 
                  alt={currentUser?.displayName || 'User Profile'} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                  }}
                />
              </div>
            </Link>

            <div className="truncate flex items-center gap-2">
              <span className="font-serif font-bold text-amber-300 text-xs sm:text-sm truncate">
                {currentUser ? `नमस्ते, ${currentUser.displayName || currentUser.fullName}!` : 'नमस्ते! हरि पाठशाला में आपका स्वागत है'}
              </span>
              <span className="hidden md:inline text-[11px] text-stone-300 font-medium">
                | {currentUser ? 'हरि साधना एवं अध्ययन पोर्टल' : 'सनातन धर्म एवं संस्कृत गुरुकुल'} 🙏
              </span>
            </div>
          </div>

          {/* Account Status & Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>{currentUser ? 'Sadhak Member' : 'Guest Visitor'}</span>
            </span>

            <Link
              to={currentUser ? "/profile" : "/login"}
              className="flex items-center gap-1 bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-1 rounded-full text-[11px] transition-all shadow-sm cursor-pointer"
            >
              <User className="w-3 h-3" />
              <span>{currentUser ? 'My Profile' : 'Login'}</span>
            </Link>
          </div>

        </div>
      </div>

      {/* 2. MAIN BRANDING & DESKTOP NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex justify-between items-center gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center bg-orange-500 shadow-md group-hover:scale-105 transition-transform border-2 border-orange-200">
              <img src={logoUrl} alt="Hari Pathshala" className="w-[82%] h-[82%] object-contain drop-shadow-md" referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-black tracking-tight text-orange-900 leading-none">
                Hari Pathshala
              </span>
              <span className="text-[9px] font-bold tracking-widest text-orange-700 uppercase mt-0.5">
                Sacred Vedic Wisdom
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-2.5 xl:gap-3.5">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs xl:text-sm font-bold transition-all px-2.5 py-1.5 rounded-xl ${
                    isActive
                      ? 'text-orange-700 bg-orange-50 font-black shadow-xs'
                      : 'text-stone-700 hover:text-orange-600 hover:bg-stone-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Shopping Cart Button */}
            <Link 
              to="/cart" 
              className="relative p-2 text-stone-700 hover:text-orange-600 transition-colors bg-stone-100 hover:bg-stone-200/70 rounded-full border border-stone-200/80 flex items-center justify-center shrink-0 ml-1"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4 text-stone-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Right Quick Controls */}
          <div className="lg:hidden flex items-center gap-2">
            <Link 
              to="/cart" 
              className="relative p-2 text-stone-700 hover:text-orange-600 transition-colors bg-stone-100 rounded-full border border-stone-200/80 flex items-center justify-center shrink-0"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-4.5 h-4.5 text-stone-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black px-3.5 py-1.5 rounded-full text-xs shadow-md transition-all active:scale-95 cursor-pointer border border-orange-400/30"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? (
                <>
                  <X size={16} />
                  <span>Close</span>
                </>
              ) : (
                <>
                  <Menu size={16} />
                  <span>Menu</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE DRAWER MENU OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-white border-t border-stone-200 overflow-hidden shadow-2xl"
          >
            <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
              {/* User Drawer Card */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-3.5 rounded-2xl border border-orange-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-100 border-2 border-orange-300 shrink-0">
                  <img 
                    src={currentUser?.photoURL || DEFAULT_AVATAR} 
                    alt={currentUser?.displayName || 'User'} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-bold text-stone-900 text-sm truncate">
                    {currentUser?.fullName || 'Guest Visitor'}
                  </p>
                  <p className="text-[11px] text-orange-700 font-semibold truncate">
                    {currentUser?.email || 'Welcome to Hari Pathshala'}
                  </p>
                </div>
                <Link
                  to={currentUser ? "/profile" : "/login"}
                  onClick={() => setIsOpen(false)}
                  className="bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs"
                >
                  {currentUser ? 'Profile' : 'Login'}
                </Link>
              </div>

              {/* Navigation Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {links.map((link) => {
                  const isActive = location.pathname === link.path;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={`drawer-${link.path}`}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-orange-600 text-white shadow-sm font-black'
                          : 'bg-stone-50 text-stone-800 hover:bg-orange-50 hover:text-orange-600 border border-stone-200/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-orange-600'}`} />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="border-t border-stone-100 pt-3 flex gap-2">
                <Link
                  to="/cart"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 py-2.5 rounded-xl text-xs font-bold border border-stone-200"
                >
                  <ShoppingCart className="w-4 h-4 text-orange-600" />
                  <span>Cart ({cartCount})</span>
                </Link>
                {currentUser ? (
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-sm"
                  >
                    <User className="w-4 h-4" />
                    <span>My Account</span>
                  </Link>
                ) : (
                  <Link
                    to="/join-us"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Join Gurukul</span>
                  </Link>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
