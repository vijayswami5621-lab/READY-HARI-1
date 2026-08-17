/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase';
import { RefreshCw, WifiOff, AlertTriangle, Check } from 'lucide-react';

export interface FriendlyError {
  id: string;
  title: string;
  message: string;
  type: 'auth' | 'firestore' | 'network' | 'imgbb' | 'razorpay' | 'shiprocket' | 'unknown';
  originalError?: any;
  retry?: () => Promise<any> | void;
}

export function translateToFriendlyError(err: any): Omit<FriendlyError, 'id'> {
  const errMsg = String(err?.message || err?.code || err || '').toLowerCase();
  const errCode = String(err?.code || '').toLowerCase();

  // 1. Specific Google Auth & Firebase Auth Errors
  if (errCode.includes('popup-blocked') || errMsg.includes('popup-blocked') || errMsg.includes('popup blocked')) {
    return {
      title: 'Popup Blocked',
      message: 'Google Login popup browser ने block कर दिया। कृपया popup allow करें।',
      type: 'auth'
    };
  }

  if (errCode.includes('unauthorized-domain') || errMsg.includes('unauthorized-domain') || errMsg.includes('unauthorized domain')) {
    return {
      title: 'Unauthorized Domain',
      message: 'यह website Google Login के लिए authorized नहीं है।',
      type: 'auth'
    };
  }

  if (errCode.includes('network-request-failed') || errMsg.includes('network-request-failed') || errMsg.includes('network error')) {
    return {
      title: 'Network Error',
      message: 'Internet connection की समस्या है। कृपया पुनः प्रयास करें।',
      type: 'network'
    };
  }

  if (
    errCode.includes('popup-closed-by-user') || 
    errCode.includes('cancelled-popup-request') || 
    errMsg.includes('popup-closed-by-user') || 
    errMsg.includes('cancelled-popup-request')
  ) {
    return {
      title: 'Login Cancelled',
      message: 'Google Login रद्द किया गया।',
      type: 'auth'
    };
  }

  if (
    errCode.includes('operation-not-allowed') || 
    errCode.includes('configuration-not-found') || 
    errCode.includes('invalid-api-key') ||
    errMsg.includes('operation-not-allowed') ||
    errMsg.includes('configuration-not-found')
  ) {
    return {
      title: 'Configuration Issue',
      message: 'Google Login configuration में समस्या है। Admin configuration check करें।',
      type: 'auth'
    };
  }

  if (
    errCode.includes('account-exists-with-different-credential') || 
    errMsg.includes('account-exists-with-different-credential')
  ) {
    return {
      title: 'Account Exists',
      message: 'यह Email किसी अन्य Login माध्यम से जुड़ा है।',
      type: 'auth'
    };
  }

  if (
    errMsg.includes('invalid-credential') ||
    errMsg.includes('wrong-password') ||
    errMsg.includes('invalid-login-credentials')
  ) {
    return {
      title: 'Invalid Credentials',
      message: 'Invalid email or password. Please check your credentials and try again.',
      type: 'auth'
    };
  }

  if (errMsg.includes('user-not-found')) {
    return {
      title: 'Account Not Found',
      message: 'No account found with this email address. Please register or check your email.',
      type: 'auth'
    };
  }

  if (errMsg.includes('invalid-email')) {
    return {
      title: 'Invalid Email',
      message: 'Please enter a valid email address.',
      type: 'auth'
    };
  }

  if (errMsg.includes('email-already-in-use')) {
    return {
      title: 'Email Already Registered',
      message: 'An account with this email address already exists. Please log in instead.',
      type: 'auth'
    };
  }

  if (errMsg.includes('too-many-requests')) {
    return {
      title: 'Too Many Attempts',
      message: 'Too many failed login attempts. Please wait a few minutes before trying again or reset your password.',
      type: 'auth'
    };
  }

  if (errMsg.includes('user-disabled')) {
    return {
      title: 'Account Disabled',
      message: 'This account has been disabled. Please contact support for assistance.',
      type: 'auth'
    };
  }

  if (errMsg.includes('weak-password')) {
    return {
      title: 'Weak Password',
      message: 'Password should be at least 6 characters long.',
      type: 'auth'
    };
  }

  if (errMsg.includes('auth/')) {
    return {
      title: 'Authentication Error',
      message: 'Unable to authenticate. Please check your details and try again.',
      type: 'auth'
    };
  }

  // 2. Firebase Permission / Sync Errors
  if (
    errMsg.includes('permission-denied') || 
    errMsg.includes('insufficient permissions') || 
    errMsg.includes('permission denied') || 
    errMsg.includes('unauthorized') || 
    errMsg.includes('access denied') ||
    errMsg.includes('unauthenticated')
  ) {
    return {
      title: 'Syncing Account',
      message: 'Updating your account details. Please wait a moment while we synchronize your view.',
      type: 'firestore'
    };
  }

  // 3. Network/Offline errors
  if (errMsg.includes('network') || errMsg.includes('fetch') || errMsg.includes('failed to fetch') || !navigator.onLine) {
    return {
      title: 'Network Connection Error',
      message: 'Unable to connect. Please check your internet connection and try again.',
      type: 'network'
    };
  }

  // 4. ImgBB / Upload errors
  if (errMsg.includes('imgbb') || errMsg.includes('upload') || errMsg.includes('image') || errMsg.includes('payload too large') || errMsg.includes('base64')) {
    return {
      title: 'Image Processing',
      message: 'Unable to process image upload. Retrying automatically...',
      type: 'imgbb'
    };
  }

  // 5. Razorpay errors
  if (errMsg.includes('razorpay') || errMsg.includes('payment') || errMsg.includes('order id') || errMsg.includes('transaction')) {
    return {
      title: 'Payment Gateway Notice',
      message: 'The transaction is being processed. If this persists, please try again or use direct UPI payment.',
      type: 'razorpay'
    };
  }

  // 6. Shiprocket / Delivery errors
  if (errMsg.includes('shiprocket') || errMsg.includes('courier') || errMsg.includes('pincode') || errMsg.includes('serviceable') || errMsg.includes('shipping')) {
    return {
      title: 'Shipping Service Notice',
      message: 'Checking courier availability and serviceable routes for your pincode.',
      type: 'shiprocket'
    };
  }

  // Default fallback
  return {
    title: 'Notice',
    message: err?.message || 'Unable to complete operation. Please try again.',
    type: 'unknown'
  };
}

// Automatic retry for Firebase Firestore calls
export async function runFirebaseWithRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const errMsg = String(err?.message || err || '').toLowerCase();
      const isPermissionError = 
        errMsg.includes('permission') || 
        errMsg.includes('unauthorized') || 
        errMsg.includes('access') ||
        errMsg.includes('unauthenticated');
      
      console.warn(`[Firebase Retry] Attempt ${attempt} failed:`, errMsg);
      
      if (attempt >= maxRetries) {
        throw err;
      }

      // If auth permission error, force refresh user token
      if (isPermissionError && auth.currentUser) {
        console.log('[Firebase Retry] Refreshing auth token...');
        try {
          await auth.currentUser.getIdToken(true);
        } catch (tokenErr) {
          console.error('[Firebase Retry] Token refresh failed:', tokenErr);
        }
      }

      // Small backoff
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
}

interface ErrorContextType {
  activeError: FriendlyError | null;
  showFriendlyError: (err: any, retryFn?: () => any) => void;
  clearError: () => void;
  wrapCall: <T>(fn: () => Promise<T>, retryFn?: () => any) => Promise<T | null>;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [activeError, setActiveError] = useState<FriendlyError | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (activeError?.type === 'network') {
        setActiveError(null);
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      showFriendlyError('network');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [activeError]);

  const showFriendlyError = (err: any, retryFn?: () => any) => {
    const translated = translateToFriendlyError(err);
    const friendly: FriendlyError = {
      id: `err-${Date.now()}`,
      ...translated,
      originalError: err,
      retry: retryFn
    };
    // Log the error internally
    console.error('[Internal Error Logger]', {
      timestamp: new Date().toISOString(),
      type: friendly.type,
      originalMessage: err?.message || String(err),
      stack: err?.stack
    });
    
    setActiveError(friendly);
  };

  const clearError = () => {
    setActiveError(null);
  };

  const wrapCall = async <T,>(fn: () => Promise<T>, retryFn?: () => any): Promise<T | null> => {
    try {
      return await fn();
    } catch (err: any) {
      showFriendlyError(err, retryFn);
      return null;
    }
  };

  return (
    <ErrorContext.Provider value={{ activeError, showFriendlyError, clearError, wrapCall }}>
      {children}
      
      {/* Global Friendly Error Dialog / Overlay */}
      {activeError && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 w-full max-w-md rounded-[32px] p-6 md:p-8 shadow-2xl relative overflow-hidden animate-fade-in">
            {/* Top design accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 to-amber-500" />
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
                {activeError.type === 'network' ? (
                  <WifiOff className="w-8 h-8 stroke-[1.5]" />
                ) : (
                  <AlertTriangle className="w-8 h-8 stroke-[1.5]" />
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  {activeError.title}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {activeError.message}
                </p>
              </div>

              <div className="flex gap-3 w-full pt-4">
                <button
                  onClick={() => {
                    clearError();
                    if (activeError.retry) {
                      activeError.retry();
                    }
                  }}
                  className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 px-4 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>Try Again</span>
                </button>
                
                <button
                  onClick={clearError}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-3 px-4 rounded-2xl text-xs transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ErrorContext.Provider>
  );
}

export function useGlobalError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useGlobalError must be used within an ErrorProvider');
  }
  return context;
}
