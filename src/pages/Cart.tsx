/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShoppingCart, Plus, Minus, Trash2, ArrowRight, ShieldCheck, 
  RotateCcw, Sparkles, AlertCircle, RefreshCw 
} from 'lucide-react';
import { 
  getCart, subscribeToCart, updateCartQuantity, removeFromCart, clearCart 
} from '../lib/db';
import SEO from '../components/SEO';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(getCart());
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    const unsubCart = subscribeToCart((updatedCart) => {
      setCartItems(updatedCart);
    });
    return () => unsubCart();
  }, []);

  const handleUpdateQty = (productId: string, newQty: number) => {
    setIsUpdating(productId);
    updateCartQuantity(productId, newQty);
    setTimeout(() => setIsUpdating(null), 150);
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
  };

  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Free shipping threshold
  const freeShippingThreshold = 999;
  const shippingCharge = cartSubtotal >= freeShippingThreshold ? 0 : 50;
  const grandTotal = cartSubtotal + shippingCharge;

  return (
    <div className="min-h-screen bg-stone-50 pb-24 md:pb-16 pt-6 md:pt-10">
      <SEO 
        title="Shopping Cart | Hari Pathshala"
        description="Review your spiritual items, holy books, and daily sadhana tools in your Hari Pathshala cart."
        url="/cart"
      />

      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb / Title */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
              My Shopping Cart
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Review and manage your selected sacred books and sadhana utensils
            </p>
          </div>
          <Link 
            to="/store"
            className="text-orange-600 hover:text-orange-700 font-bold text-sm flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Continue Browsing</span>
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-stone-200 rounded-[32px] p-12 md:p-16 text-center max-w-xl mx-auto shadow-sm"
          >
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-600">
              <ShoppingCart className="w-9 h-9" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-stone-600 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
              Explore our verified collections of pure Tulsi malas, authentic Srimad Bhagavad Gitas, Sunderkands, and accessories.
            </p>
            <Link 
              to="/store"
              className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-orange-600/10 hover:shadow-orange-600/25 transition-all"
            >
              <span>Visit Spiritual Store</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-stone-200 rounded-[28px] overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/40 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Product Details ({cartCount} Items)
                  </span>
                  <button 
                    onClick={() => clearCart()}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Cart</span>
                  </button>
                </div>

                <div className="divide-y divide-stone-100">
                  {cartItems.map((item) => (
                    <motion.div 
                      key={item.product.id}
                      className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 relative group"
                    >
                      {/* Product Image */}
                      <Link 
                        to={`/store/product/${item.product.id}`}
                        className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-50 border border-stone-200 shrink-0 shadow-sm hover:opacity-95 transition-opacity"
                      >
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      {/* Product details */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/store/product/${item.product.id}`}
                          className="font-serif text-base font-bold text-stone-950 hover:text-orange-600 transition-colors line-clamp-2 block"
                        >
                          {item.product.name}
                        </Link>
                        {item.product.hindiName && (
                          <p className="text-xs font-semibold text-stone-500 font-hindi mt-0.5">
                            {item.product.hindiName}
                          </p>
                        )}
                        <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider font-bold">
                          Category: {item.product.category}
                        </p>
                      </div>

                      {/* Pricing & Quantities Selector */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0">
                        <div className="flex items-center gap-2.5 bg-stone-50 border border-stone-200 rounded-xl px-2 py-1">
                          <button 
                            onClick={() => handleUpdateQty(item.product.id, item.quantity - 1)}
                            disabled={isUpdating === item.product.id}
                            className="w-8 h-8 rounded-lg border border-stone-200/60 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold text-stone-800 w-6 text-center select-none">
                            {isUpdating === item.product.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin mx-auto text-orange-600" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button 
                            onClick={() => handleUpdateQty(item.product.id, item.quantity + 1)}
                            disabled={isUpdating === item.product.id}
                            className="w-8 h-8 rounded-lg border border-stone-200/60 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-stone-900 font-extrabold text-base">
                            ₹{item.product.price * item.quantity}
                          </p>
                          <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                            ₹{item.product.price} each
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button 
                          onClick={() => handleRemove(item.product.id)}
                          className="text-stone-400 hover:text-red-500 transition-colors p-2 -mr-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Trust badges */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-center justify-between text-stone-600">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-stone-800 uppercase tracking-wider">100% Online Payment</h4>
                    <p className="text-xs">Secure transaction verified by Razorpay Payment Gateway.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200/40">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>Verified Sacred Items</span>
                </div>
              </div>
            </div>

            {/* Order Summary sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-stone-200 rounded-[28px] p-6 md:p-8 shadow-sm sticky top-28 space-y-6">
                <h3 className="font-serif text-xl font-bold text-stone-950">
                  Order Summary
                </h3>

                <div className="space-y-3.5 border-b border-stone-100 pb-5">
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-stone-900">₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Shipping Charges</span>
                    {shippingCharge === 0 ? (
                      <span className="font-extrabold text-emerald-600 uppercase tracking-wider text-xs bg-emerald-50 px-2 py-0.5 rounded-lg">Free</span>
                    ) : (
                      <span className="font-bold text-stone-900">₹{shippingCharge}</span>
                    )}
                  </div>
                  {shippingCharge > 0 && (
                    <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100/50 flex gap-2 text-[11px] text-orange-800 leading-normal">
                      <AlertCircle className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <span>Add item of ₹{freeShippingThreshold - cartSubtotal} more for <strong>FREE Delivery</strong>.</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-sm font-extrabold text-stone-900 uppercase tracking-wider">Estimated Total</span>
                  <span className="text-3xl font-black text-orange-600">₹{grandTotal}</span>
                </div>

                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-600/10 hover:shadow-orange-600/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    By proceeding, you agree to our 100% cashless, digital-only fulfillment workflow. Orders processed through Shiprocket.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
