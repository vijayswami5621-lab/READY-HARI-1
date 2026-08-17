/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  db, Order 
} from '../lib/db';
import { 
  Truck, Package, MapPin, Search, Calendar, ChevronRight, CheckCircle2, 
  HelpCircle, ShieldCheck, Sparkles, PhoneCall 
} from 'lucide-react';
import SEO from '../components/SEO';

const STATUS_STEPS = [
  { status: 'Order Placed', label: 'Order Registered', desc: 'Secure online payment completed and verified.' },
  { status: 'Payment Confirmed', label: 'Payment Confirmed', desc: 'Transaction synced in our financial ledger.' },
  { status: 'Packed', label: 'Packed & Sanitized', desc: 'Items packed with proper spiritual hygiene and care.' },
  { status: 'Shipped', label: 'Dispatched to Hub', desc: 'Manifest generated and handed over to logistics partner.' },
  { status: 'In Transit', label: 'In Transit', desc: 'Cargo travelling through route logistics centers.' },
  { status: 'Out for Delivery', label: 'Out for Delivery', desc: 'Courier representative dispatched to your doorstep.' },
  { status: 'Delivered', label: 'Delivered', desc: 'Sadhana material received with high-fidelity reverence.' }
];

export default function TrackOrder() {
  const { orderId: routeOrderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (routeOrderId) {
      setLoading(true);
      setErrorMsg('');
      const unsub = db.subscribe('orders', (data) => {
        const found = data.find(o => o.id === routeOrderId || o.id.toLowerCase() === routeOrderId.toLowerCase());
        if (found) {
          setOrder(found);
          setErrorMsg('');
        } else {
          setErrorMsg(`Unable to locate Order ID "${routeOrderId}". Please verify your Order ID and try again.`);
          setOrder(null);
        }
        setLoading(false);
      });
      return () => unsub();
    } else {
      setOrder(null);
    }
  }, [routeOrderId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    navigate(`/order/track/${searchId.trim()}`);
  };

  const getStepIndex = (currentStatus: string) => {
    return STATUS_STEPS.findIndex(step => step.status === currentStatus);
  };

  const stepIndex = order ? getStepIndex(order.orderStatus) : -1;

  const whatsappMessage = order 
    ? encodeURIComponent(`Namaste! I would like to track my Hari Pathshala Order #${order.id}`)
    : encodeURIComponent(`Namaste! I need assistance tracking my Hari Pathshala order.`);

  return (
    <div className="min-h-screen bg-stone-50 pb-24 md:pb-16 pt-6 md:pt-10">
      <SEO 
        title={order ? `Track Order ${order.id} | Hari Pathshala` : 'Track My Order | Hari Pathshala'}
        description="Track your Hari Pathshala order shipment status with real-time tracking."
        url="/order/track"
      />

      <div className="max-w-4xl mx-auto px-4">
        {/* Title */}
        <div className="mb-8 text-center max-w-xl mx-auto space-y-2">
          <h1 className="font-serif text-3xl font-extrabold text-stone-900 tracking-tight">
            Track My Order
          </h1>
          <p className="text-sm text-stone-600">
            Enter your Order ID to track your shipment.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-white border border-stone-200 rounded-[24px] p-6 shadow-sm max-w-xl mx-auto mb-10">
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
              <input 
                type="text"
                placeholder="Enter your Order ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-11 pr-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <button 
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 rounded-xl text-xs transition-colors shrink-0 flex items-center justify-center cursor-pointer"
            >
              Track Order
            </button>
          </form>
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">Fetching order details...</p>
          </div>
        )}

        {!loading && errorMsg && (
          <div className="bg-amber-50 text-amber-900 border border-amber-200 p-6 rounded-2xl max-w-xl mx-auto text-sm text-center space-y-3 shadow-sm">
            <HelpCircle className="w-8 h-8 text-amber-600 mx-auto" />
            <p className="font-bold text-base">{errorMsg}</p>
            <p className="text-xs text-amber-800/80 leading-normal">
              Shipment tracking information is not available yet or the Order ID is incorrect. Please check again after your order has been shipped or contact support.
            </p>
          </div>
        )}

        {!loading && !order && !errorMsg && !routeOrderId && (
          <div className="text-center py-12 max-w-sm mx-auto space-y-4">
            <Truck className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="text-sm font-semibold text-stone-600 leading-normal">
              Enter your Hari Pathshala Order ID above to check live shipment status.
            </p>
          </div>
        )}

        {/* ORDER TRACKING CONTAINER */}
        {!loading && order && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Summary Banner */}
            <div className="bg-white border border-stone-200 rounded-[28px] p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-orange-50 text-orange-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-orange-200/50">
                    Order #{order.id}
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-200/40">
                    {order.paymentStatus}
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  {order.orderStatus}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Ordered Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="w-1.5 h-1.5 bg-stone-300 rounded-full hidden sm:inline" />
                  <span>Courier Partner: <strong>{order.courier || 'Standard Express'}</strong></span>
                </div>
              </div>

              <div className="text-left md:text-right space-y-1 bg-stone-50 md:bg-transparent p-4 md:p-0 rounded-2xl w-full md:w-auto border border-stone-100 md:border-0">
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Estimated Delivery</p>
                <p className="text-lg font-black text-emerald-700">
                  {order.orderStatus === 'Delivered' ? 'Delivered' : '3 - 5 Working Days'}
                </p>
                {order.trackingNumber && (
                  <p className="text-xs text-stone-600 mt-1">
                    Tracking Number: <strong className="text-stone-900 font-mono bg-stone-100 px-1.5 py-0.5 rounded">{order.trackingNumber}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* VISUAL TIMELINE */}
            <div className="bg-white border border-stone-200 rounded-[28px] p-6 md:p-8 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-4 mb-8">
                Shipment Status
              </h3>

              <div className="relative pl-6 md:pl-0 md:flex justify-between items-start md:space-x-4 space-y-8 md:space-y-0">
                {/* Connecting Horizontal Line (Desktop) */}
                <div className="absolute top-[21px] left-0 right-0 h-0.5 bg-stone-100 hidden md:block -z-10" />

                {/* Connecting Vertical Line (Mobile) */}
                <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-stone-100 md:hidden -z-10" />

                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx <= stepIndex;
                  const isCurrent = idx === stepIndex;

                  return (
                    <div key={step.status} className="relative md:text-center md:flex-1">
                      {/* Timeline Dot */}
                      <div className="flex md:flex-col items-center gap-4 md:gap-3">
                        <div 
                          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                            isCompleted 
                              ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/10' 
                              : 'bg-white text-stone-300 border-stone-200'
                          } ${isCurrent ? 'ring-4 ring-orange-500/25 scale-110 z-10' : ''}`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Package className="w-4 h-4" />
                          )}
                        </div>

                        {/* Step details */}
                        <div className="text-left md:text-center">
                          <h4 className={`text-xs font-black uppercase tracking-wider ${
                            isCompleted ? 'text-stone-900' : 'text-stone-400'
                          }`}>
                            {step.label}
                          </h4>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ORDER ITEMS & DELIVERY DESTINATION SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Delivery info */}
              <div className="bg-white border border-stone-200 rounded-[24px] p-6 shadow-sm space-y-4">
                <h4 className="font-serif text-base font-bold text-stone-950 border-b border-stone-100 pb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <span>Delivery Address</span>
                </h4>
                <div className="text-xs text-stone-700 space-y-1 leading-relaxed">
                  <p className="font-black text-stone-900 text-sm">{order.customerName}</p>
                  <p className="text-stone-600">{order.customerAddress}</p>
                  <p className="text-stone-500 pt-1 font-semibold">Contact: {order.customerPhone}</p>
                </div>
              </div>

              {/* Package contents summary */}
              <div className="bg-white border border-stone-200 rounded-[24px] p-6 shadow-sm space-y-4">
                <h4 className="font-serif text-base font-bold text-stone-950 border-b border-stone-100 pb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-600" />
                  <span>Order Items ({order.items.length})</span>
                </h4>
                <div className="divide-y divide-stone-100 max-h-48 overflow-y-auto pr-2 text-xs">
                  {order.items.map((item) => (
                    <div key={item.product.id} className="py-2.5 flex justify-between items-center gap-4">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-lg object-cover bg-stone-50 border border-stone-200/50"
                        />
                        <span className="font-bold text-stone-800 line-clamp-1">{item.product.name}</span>
                      </div>
                      <span className="text-stone-500 font-semibold text-right shrink-0">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-stone-100 pt-3 text-xs">
                  <span className="text-stone-500 font-bold uppercase tracking-wider">Total Amount:</span>
                  <strong className="text-orange-600 font-black text-sm">₹{order.totalAmount}</strong>
                </div>
              </div>

            </div>

            {/* Support / Track on WhatsApp */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-center justify-between text-stone-600 max-w-xl mx-auto text-xs">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-8 h-8 text-orange-600 shrink-0" />
                <div>
                  <h4 className="font-black text-stone-800 uppercase tracking-wider">Need Help?</h4>
                  <p className="text-stone-550 leading-relaxed mt-0.5">Have questions regarding your order delivery?</p>
                </div>
              </div>
              <a 
                href={`https://wa.me/919610579423?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl font-bold shrink-0 transition-colors shadow-sm"
              >
                <span>Track on WhatsApp</span>
              </a>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
