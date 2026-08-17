/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  XCircle, AlertTriangle, ArrowRight, ShoppingBag, RotateCcw, Lock 
} from 'lucide-react';
import SEO from '../components/SEO';

export default function PaymentFailed() {
  return (
    <div className="min-h-screen bg-stone-50/50 pt-28 pb-20">
      <SEO 
        title="Payment Failed | Hari Pathshala"
        description="Your transaction could not be processed. Please check your credentials and try again."
        url="/payment-failed"
      />

      <div className="max-w-xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-stone-200 rounded-[32px] p-8 md:p-12 text-center shadow-xl space-y-8"
        >
          {/* Error Visual */}
          <div className="w-20 h-20 bg-red-50 border-2 border-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 shadow-md">
            <XCircle className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <span className="bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-red-200/50">
              Transaction Declined
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
              Payment Processing Error
            </h1>
            <p className="text-stone-600 text-sm leading-relaxed max-w-sm mx-auto">
              We were unable to complete your secure pre-authorization transaction via Razorpay. No funds have been deducted from your account.
            </p>
          </div>

          <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/50 text-left text-xs text-stone-600 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-stone-850">Possible Causes:</strong>
              <ul className="list-disc pl-4 space-y-1 text-stone-550 leading-relaxed">
                <li>Incorrect UPI PIN or card authentication verification.</li>
                <li>Temporary connectivity timeout with your banking provider.</li>
                <li>Closed payment window before completing Razorpay approval.</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              to="/checkout"
              className="w-full sm:flex-1 bg-stone-900 hover:bg-stone-850 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-orange-400" />
              <span>Retry Payment</span>
            </Link>

            <Link 
              to="/cart"
              className="w-full sm:flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>View Shopping Cart</span>
            </Link>
          </div>

          <div className="border-t border-stone-100 pt-6 flex items-center justify-center gap-1.5 text-xs text-stone-500">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Secure encryption verified by <strong>Razorpay v1</strong></span>
          </div>

          <Link 
            to="/store"
            className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Return to Bookstore</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
