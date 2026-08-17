/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Check, FileText, MapPin, Truck, ShoppingBag, ArrowRight, Sparkles, PhoneCall 
} from 'lucide-react';
import { db, Order } from '../lib/db';
import SEO from '../components/SEO';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      const unsub = db.subscribe('orders', (data) => {
        const found = data.find(o => o.id === orderId);
        if (found) {
          setOrder(found);
        }
      });
      return () => unsub();
    } else {
      navigate('/store');
    }
  }, [orderId, navigate]);

  if (!order) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center pt-28">
        <SEO title="Order Processing | Hari Pathshala" description="Order loading..." url="/payment-success" />
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-stone-600 font-medium">Syncing order details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/50 pt-28 pb-20">
      <SEO 
        title="Order Success | Hari Pathshala"
        description="Hare Krishna! Your payment has been processed and order recorded successfully."
        url={`/payment-success?orderId=${orderId}`}
      />

      <div className="max-w-3xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-stone-200 rounded-[32px] p-8 md:p-12 text-center shadow-xl space-y-8 relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          {/* Success Checkmark Anim */}
          <div className="relative">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-24 h-24 bg-emerald-100 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-lg shadow-emerald-100"
            >
              <Check className="w-12 h-12" />
            </motion.div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
              className="absolute inset-x-0 -top-1 w-26 h-26 border-2 border-dashed border-emerald-500/10 rounded-full mx-auto pointer-events-none"
            />
          </div>

          <div className="space-y-3">
            <span className="bg-orange-50 text-orange-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-orange-200/50">
              Transaction Successful
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-black text-stone-900 tracking-tight">
              Hare Krishna! Order Confirmed
            </h1>
            <p className="text-stone-600 text-sm max-w-lg mx-auto leading-relaxed">
              We have successfully registered your payment and configured your shipment package. A confirmation message and transaction summary has been logged to your account registry.
            </p>
          </div>

          {/* Order Details box */}
          <div className="border border-stone-200 rounded-2xl p-6 bg-stone-50/50 text-left text-xs text-stone-700 space-y-4 max-w-md mx-auto">
            <div className="flex justify-between items-center pb-3 border-b border-stone-200/50">
              <span className="text-stone-500 font-bold uppercase tracking-wider text-[10px]">Reference Details</span>
              <strong className="text-stone-900 font-extrabold">{order.id}</strong>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">Deliver To:</span>
                <span className="text-stone-900 font-bold">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Contact Number:</span>
                <span className="text-stone-900 font-semibold">{order.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Courier Logistics:</span>
                <span className="text-stone-900 font-semibold">{order.courier || 'Shiprocket (Fulfillment pending)'}</span>
              </div>
              {order.awb && (
                <div className="flex justify-between">
                  <span className="text-stone-500">AWB Tracking Code:</span>
                  <strong className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">{order.awb}</strong>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-dashed border-stone-200 text-sm">
                <span className="text-stone-600 font-bold">Paid Amount:</span>
                <strong className="text-orange-600 font-black">₹{order.totalAmount}</strong>
              </div>
            </div>
          </div>

          {/* Actions Block */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <a 
              href={`/api/invoice/${order.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 bg-stone-900 hover:bg-stone-850 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-orange-400" />
              <span>Download Invoice</span>
            </a>

            <Link 
              to={`/order/track/${order.id}`}
              className="w-full sm:flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              <Truck className="w-4 h-4" />
              <span>Track Dispatch</span>
            </Link>
          </div>

          {/* Quick Help info */}
          <div className="border-t border-stone-100 pt-8 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-stone-500 max-w-lg mx-auto">
            <p className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
              <span>This purchase directly funds free books for children!</span>
            </p>
            <div className="flex items-center gap-1 text-stone-600 font-semibold">
              <PhoneCall className="w-4 h-4 text-orange-600 shrink-0" />
              <span>WhatsApp Support: +91 9610579423</span>
            </div>
          </div>

          <Link 
            to="/store"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors pt-2"
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
