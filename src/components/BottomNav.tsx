/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Sparkles, BookOpen, User, LogIn } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getCart, subscribeToCart } from '../lib/db';

export default function BottomNav() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [forceKey, setForceKey] = useState(0);

  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  // Calculate cart count
  useEffect(() => {
    const updateCount = (cart: any[]) => {
      const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(total);
    };
    updateCount(getCart());
    const unsub = subscribeToCart(updateCount);
    return () => unsub();
  }, []);

  // Recovery function called on Lock/Unlock, Resume, Focus, Resize
  const restoreNav = useCallback(() => {
    setIsVisible(true);
    lastScrollYRef.current = window.scrollY || 0;
    setForceKey((prev) => prev + 1);
  }, []);

  // Setup Lifecycle listeners (Screen lock, Capacitor resume, Focus, Visibility)
  useEffect(() => {
    // 1. standard browser visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        restoreNav();
      }
    };

    // 2. window focus and pageshow
    const handleFocus = () => restoreNav();
    const handlePageShow = () => restoreNav();

    // 3. window resize and orientation change
    const handleResize = () => restoreNav();

    // 4. Capacitor or Cordova native app resume listeners
    const handleCapacitorResume = () => restoreNav();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('resume', handleCapacitorResume);
    document.addEventListener('appRestored', handleCapacitorResume);

    // Try attaching Capacitor App plugin dynamically if loaded in environment
    let capAppListener: any = null;
    if ((window as any).Capacitor?.Plugins?.App) {
      try {
        capAppListener = (window as any).Capacitor.Plugins.App.addListener('appStateChange', (state: any) => {
          if (state?.isActive) {
            restoreNav();
          }
        });
      } catch (err) {
        console.warn('Capacitor listener setup failed:', err);
      }
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('resume', handleCapacitorResume);
      document.removeEventListener('appRestored', handleCapacitorResume);

      if (capAppListener && typeof capAppListener.remove === 'function') {
        capAppListener.remove();
      }
    };
  }, [restoreNav]);

  // Scroll listener for auto hide/show
  useEffect(() => {
    const onScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY || 0;
          const diff = currentScrollY - lastScrollYRef.current;

          // Always show when near the top
          if (currentScrollY <= 20) {
            setIsVisible(true);
          } else if (diff > 8) {
            // Scrolling down -> hide smoothly
            setIsVisible(false);
          } else if (diff < -3) {
            // Scrolling up -> immediately show
            setIsVisible(true);
          }

          lastScrollYRef.current = currentScrollY;
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Force show on route navigation
  useEffect(() => {
    restoreNav();
  }, [location.pathname, restoreNav]);

  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: Home,
      exact: true,
    },
    {
      label: 'Store',
      path: '/store',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      label: 'Gallery',
      path: '/gallery',
      icon: Sparkles,
    },
    {
      label: 'Stutis',
      path: '/stutis',
      icon: BookOpen,
    },
    {
      label: currentUser ? 'Profile' : 'Account',
      path: currentUser ? '/profile' : '/login',
      icon: currentUser ? User : LogIn,
    },
  ];

  return (
    <div
      key={`bottom-nav-${forceKey}`}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out pointer-events-auto"
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(110%)',
        opacity: isVisible ? 1 : 0,
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))',
      }}
    >
      <nav aria-label="Bottom Navigation" className="mx-3 mb-2 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-2xl px-2 py-2 flex items-center justify-around text-stone-600">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          const IconComponent = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={restoreNav}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 select-none ${
                isActive
                  ? 'text-orange-700 font-black bg-orange-50/80 scale-105'
                  : 'text-stone-500 hover:text-orange-600 font-medium hover:bg-stone-50'
              }`}
            >
              <div className="relative">
                <IconComponent
                  className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                    isActive ? 'stroke-[2.5px] text-orange-600' : 'stroke-[1.75px]'
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight whitespace-nowrap leading-tight ${
                  isActive ? 'text-orange-800 font-bold' : 'text-stone-600 font-medium'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <span className="absolute bottom-0 w-1.5 h-1.5 bg-orange-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
