/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../lib/auth';
import { Mail, Lock, LogIn, ArrowRight, Check, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';
import { translateToFriendlyError } from '../lib/error';

export default function Login() {
  const { login, googleSignIn, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');

  // Determine where to redirect after login (default is profile)
  const from = (location.state as any)?.from?.pathname || '/profile';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(translateToFriendlyError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await googleSignIn();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(translateToFriendlyError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setResetSuccess('Password reset link sent to your email address! Please check your inbox.');
      setForgotMode(false);
    } catch (err: any) {
      setError(translateToFriendlyError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/50 flex items-center justify-center pt-24 pb-16 px-4">
      <SEO 
        title="Login | Hari Pathshala"
        description="Login to your Hari Pathshala profile to track sadhana, store orders, and stutis bookmarks."
        url="/login"
      />
      
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-100/30 rounded-full blur-3xl -mr-32 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-100/30 rounded-full blur-3xl -ml-32 -mb-16 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white border border-stone-200 shadow-xl rounded-[32px] p-8 md:p-10 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="text-3xl mb-3">🪔</div>
          <h2 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
            {forgotMode ? 'Reset Password' : 'Hari Pathshala Login'}
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            {forgotMode 
              ? 'Enter your registered email address to receive a password reset link.' 
              : 'Sign in to access your spiritual profile and account features'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-2xl border border-red-200 flex items-start gap-3 text-sm mb-6 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {resetSuccess && (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 flex items-start gap-3 text-sm mb-6">
            <Check className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            <span>{resetSuccess}</span>
          </div>
        )}

        {!forgotMode ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3.5 pl-12 pr-4 text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(true);
                    setError('');
                    setResetSuccess('');
                  }}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3.5 pl-12 pr-4 text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500/20 h-4.5 w-4.5 border-stone-300 accent-orange-600"
                />
                <span className="text-sm text-stone-600 font-medium">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-600/10 hover:shadow-orange-600/20 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3.5 pl-12 pr-4 text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-600/10 hover:shadow-orange-600/20 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setForgotMode(false);
                setError('');
              }}
              className="w-full text-center text-sm font-semibold text-stone-600 hover:text-stone-900 py-1 transition-colors"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-stone-500 font-bold tracking-wider">Or continue with</span>
          </div>
        </div>

        {/* Google Sign-in */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.16-3.16C17.45 1.67 14.93 1 12 1 7.35 1 3.42 3.67 1.54 7.56l3.66 2.84C6.07 7.02 8.78 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.46c-.28 1.47-1.11 2.72-2.36 3.56l3.65 2.83c2.14-1.97 3.38-4.88 3.38-8.5z"
            />
            <path
              fill="#FBBC05"
              d="M5.2 14.76c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.54 7.3c-.85 1.71-1.34 3.63-1.34 5.65s.49 3.94 1.34 5.65l3.66-2.84z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.65-2.83c-1.01.68-2.31 1.08-3.79 1.08-3.22 0-5.93-1.98-6.91-4.96L1.54 16.2C3.42 20.1 7.35 23 12 23z"
            />
          </svg>
          <span>Sign In with Google</span>
        </button>

        <p className="text-center text-sm text-stone-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-orange-600 hover:text-orange-700 transition-colors">
            Register Now
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
