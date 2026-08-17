/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  useAuth, Address 
} from '../lib/auth';
import { 
  db, getCart, clearCart, Product 
} from '../lib/db';
import { 
  CreditCard, ShieldCheck, MapPin, Plus, Trash2, ArrowRight, CheckCircle2, 
  Sparkles, Lock, AlertCircle, RefreshCw, Smartphone, Landmark, Wallet, Check 
} from 'lucide-react';
import SEO from '../components/SEO';

// Safe API Fetch Helper to prevent 'Unexpected end of JSON input'
async function safeApiFetch(url: string, options?: RequestInit) {
  let response: Response;
  const fallbackUrl = `https://ready-hari.onrender.com${url.startsWith('/') ? '' : '/'}${url}`;

  try {
    response = await fetch(url, options);
  } catch (err) {
    console.warn(`Primary endpoint ${url} failed, attempting production backend ${fallbackUrl}:`, err);
    try {
      response = await fetch(fallbackUrl, options);
    } catch (err2) {
      throw new Error('Unable to reach payment gateway. Please check your internet connection.');
    }
  }

  const rawText = await response.text();
  if (!rawText || rawText.trim() === '') {
    if (url.includes('process-background-order')) {
      return { success: true };
    }
    throw new Error('Payment gateway server response was empty. Please try again.');
  }

  try {
    const data = JSON.parse(rawText);
    if (!response.ok) {
      throw new Error(data.error || data.message || `Server error (${response.status})`);
    }
    return data;
  } catch (jsonErr: any) {
    if (jsonErr.message && !jsonErr.message.toLowerCase().includes('json')) {
      throw jsonErr;
    }
    throw new Error('Payment gateway returned an invalid response. Please try again.');
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, addAddress, deleteAddress, setDefaultAddress } = useAuth();
  
  // Cart & Pricing
  const [cartItems, setCartItems] = useState(getCart());
  const [shippingCost, setShippingCost] = useState(50);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingCourier, setShippingCourier] = useState('Delhivery Express');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  // Address form
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [addressType, setAddressType] = useState<'Home' | 'Office' | 'Other'>('Home');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Checkout states
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Handle address default selection on load
  useEffect(() => {
    if (currentUser?.addresses && currentUser.addresses.length > 0) {
      const def = currentUser.addresses.find(a => a.isDefault);
      if (def) {
        setSelectedAddressId(def.id);
      } else {
        setSelectedAddressId(currentUser.addresses[0].id);
      }
    }
  }, [currentUser]);

  // Recalculate shipping whenever address selection changes
  useEffect(() => {
    if (selectedAddressId && currentUser) {
      const addr = currentUser.addresses.find(a => a.id === selectedAddressId);
      if (addr && addr.pincode) {
        calculateShipping(addr.pincode);
      }
    }
  }, [selectedAddressId, currentUser]);

  const calculateShipping = async (pin: string) => {
    setShippingLoading(true);
    try {
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pincode: pin,
          weight: cartItems.reduce((sum, item) => sum + ((item.product.weight || 600) * item.quantity), 0)
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShippingCost(data.shippingCharges);
          setShippingCourier(data.courier);
          setEstimatedDelivery(data.estimatedDelivery);
        }
      }
    } catch (err) {
      console.error('Failed to calculate shipping:', err);
    } finally {
      setShippingLoading(false);
    }
  };

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');
    if (!fullName || !mobile || !addressLine || !city || !state || !pincode) {
      setAddressError('Please fill in all address details.');
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      setAddressError('Please enter a valid 6-digit Indian Pincode.');
      return;
    }

    try {
      const added = await addAddress({
        type: addressType,
        fullName,
        mobile,
        addressLine,
        city,
        state,
        pincode,
        isDefault
      });
      setSelectedAddressId(added.id);
      
      // Clear form
      setFullName('');
      setMobile('');
      setAddressLine('');
      setCity('');
      setState('');
      setPincode('');
      setIsDefault(false);
      setShowNewAddressForm(false);
    } catch (err: any) {
      setAddressError(err.message || 'Failed to add address.');
    }
  };

  const handlePaySecurely = async () => {
    setPaymentError('');
    if (!selectedAddressId || !currentUser) {
      setPaymentError('Please select or add a delivery address to proceed.');
      return;
    }

    const addr = currentUser.addresses.find(a => a.id === selectedAddressId);
    if (!addr) {
      setPaymentError('Selected address not found.');
      return;
    }

    setCheckoutLoading(true);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const finalAmount = subtotal + shippingCost;

    try {
      const ecomCfg = db.getEcomConfig();

      // 1. Create Razorpay order on backend
      const orderData = await safeApiFetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          isLiveMode: ecomCfg.razorpayLiveMode
        })
      });

      if (!orderData.success && orderData.error) {
        throw new Error(orderData.error);
      }

      // 2. Official Razorpay Integration
      const rzpScript = document.createElement('script');
      rzpScript.src = 'https://checkout.razorpay.com/v1/checkout.js';
      rzpScript.async = true;
      rzpScript.onload = () => {
        const options = {
          key: orderData.keyId || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID,
          amount: orderData.order?.amount || Math.round(finalAmount * 100),
          currency: orderData.order?.currency || 'INR',
          name: 'Hari Pathshala',
          description: 'Sacred Books & Sadhana Materials',
          image: db.getDynamicImage('websiteLogo') || 'https://i.ibb.co/qMG2MS27/logo.png',
          order_id: orderData.order?.id,
          handler: async function (response: any) {
            try {
              // Verify payment on backend
              const verifyData = await safeApiFetch('/api/checkout/verify-signature', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });

              if (verifyData.verified) {
                // Save Order to Firestore DB
                const savedOrder = db.addOrder({
                  customerName: addr.fullName,
                  customerPhone: addr.mobile,
                  customerAddress: `${addr.addressLine}, ${addr.city}, ${addr.state} - ${addr.pincode} (${addr.type})`,
                  pincode: addr.pincode,
                  items: cartItems,
                  subtotal,
                  shippingCharges: shippingCost,
                  codCharges: 0,
                  totalAmount: finalAmount,
                  paymentMethod: 'ONLINE',
                  paymentStatus: 'PAID',
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  orderStatus: 'Payment Confirmed',
                  isTest: false
                });

                clearCart();
                safeApiFetch('/api/checkout/process-background-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ order: savedOrder })
                }).catch(() => {});
                navigate(`/payment-success?orderId=${savedOrder.id}`);
              } else {
                navigate('/payment-failed');
              }
            } catch (err: any) {
              setPaymentError(err.message || 'Payment signature validation failed.');
              setCheckoutLoading(false);
            }
          },
          prefill: {
            name: addr.fullName,
            email: currentUser.email,
            contact: addr.mobile
          },
          theme: {
            color: '#ea580c'
          },
          modal: {
            ondismiss: function () {
              setCheckoutLoading(false);
            }
          }
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.open();
      };
      
      document.body.appendChild(rzpScript);

    } catch (err: any) {
      setPaymentError(err.message || 'Payment process failed. Please try again.');
      setCheckoutLoading(false);
    }
  };

  // Login Prompter Page
  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center pt-28">
        <SEO title="Secure Checkout | Hari Pathshala" description="Secure Checkout page." url="/checkout" />
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-stone-900 mb-2">Checkout Authentication</h2>
        <p className="text-stone-600 max-w-sm mb-6">You must log in or register a free profile to secure your shipping locations and track order history.</p>
        <button 
          onClick={() => navigate('/login', { state: { from: location } })}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          Login to Continue
        </button>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalWeight = cartItems.reduce((sum, item) => sum + ((item.product.weight || 600) * item.quantity), 0);

  return (
    <div className="min-h-screen bg-stone-50 pb-24 md:pb-16 pt-6 md:pt-10">
      <SEO 
        title="Secure Checkout | Hari Pathshala"
        description="Verify your delivery details and pay securely using UPI, cards, and net banking via Razorpay."
        url="/checkout"
      />

      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-extrabold text-stone-900 tracking-tight">Secure Checkout</h1>
          <p className="text-sm text-stone-600 mt-1 flex items-center gap-1.5 font-medium">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Encrypted Payment powered by <strong>Razorpay</strong></span>
          </p>
        </div>

        {paymentError && (
          <div className="bg-red-50 text-red-800 p-4 rounded-2xl border border-red-200 flex items-start gap-3 text-sm mb-8 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <span>{paymentError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Shipping Addresses & Payments */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* ADDRESS SELECTOR CARD */}
            <div className="bg-white border border-stone-200 rounded-[28px] p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <h2 className="font-serif text-xl font-bold text-stone-900">Delivery Address</h2>
                </div>
                {!showNewAddressForm && (
                  <button 
                    onClick={() => setShowNewAddressForm(true)}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Inline Address Creation Form */}
              {showNewAddressForm && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-black text-stone-800 uppercase tracking-wider">Add Shipping Address</h3>
                    <button 
                      type="button" 
                      onClick={() => setShowNewAddressForm(false)}
                      className="text-stone-500 hover:text-stone-800 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>

                  {addressError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 text-xs flex gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{addressError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAddAddressSubmit} className="space-y-4">
                    {/* Type selection */}
                    <div className="flex gap-2.5">
                      {(['Home', 'Office', 'Other'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setAddressType(t)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            addressType === t 
                              ? 'bg-orange-600 text-white border-orange-600' 
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Full Name *</label>
                        <input 
                          type="text" 
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Ajay Swami"
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Mobile Number *</label>
                        <input 
                          type="tel" 
                          required
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="10-digit mobile"
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Street Address, Landmark *</label>
                      <input 
                        type="text" 
                        required
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        placeholder="House No, Building name, Street, Area"
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Pincode *</label>
                        <input 
                          type="text" 
                          required
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="6 digits"
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">City *</label>
                        <input 
                          type="text" 
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City / Town"
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">State *</label>
                        <input 
                          type="text" 
                          required
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="State"
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 py-1 select-none cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="rounded border-stone-300 text-orange-600 focus:ring-orange-500/20 h-4 w-4"
                      />
                      <span className="text-xs font-semibold text-stone-700">Set as my default address</span>
                    </label>

                    <button 
                      type="submit"
                      className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                    >
                      Save and Ship to this Address
                    </button>
                  </form>
                </motion.div>
              )}

              {currentUser.addresses.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-stone-200 rounded-2xl">
                  <MapPin className="mx-auto text-stone-300 w-8 h-8 mb-2" />
                  <p className="text-sm font-semibold text-stone-700">No Shipping Address Saved</p>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1 mb-4">Please add your shipping address so we can route the package using Shiprocket Delhivery Air.</p>
                  <button 
                    onClick={() => setShowNewAddressForm(true)}
                    className="bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Add Address First
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentUser.addresses.map((addr) => (
                    <label 
                      key={addr.id}
                      className={`block p-4 border rounded-2xl relative select-none cursor-pointer transition-all ${
                        selectedAddressId === addr.id 
                          ? 'border-orange-600 bg-orange-50/10' 
                          : 'border-stone-200 hover:bg-stone-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input 
                          type="radio"
                          name="selected_address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 accent-orange-600"
                        />
                        <div className="flex-1 text-sm text-stone-800">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-stone-950">{addr.fullName}</span>
                            <span className="bg-stone-100 text-stone-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                              {addr.type}
                            </span>
                            {addr.isDefault && (
                              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-600 mt-1">{addr.addressLine}</p>
                          <p className="text-xs text-stone-600 mt-0.5">{addr.city}, {addr.state} - <strong className="text-stone-800">{addr.pincode}</strong></p>
                          <p className="text-xs text-stone-500 mt-1.5 font-semibold">Mobile: {addr.mobile}</p>
                        </div>
                      </div>

                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          deleteAddress(addr.id);
                        }}
                        className="absolute top-4 right-4 text-stone-400 hover:text-red-600 transition-colors"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* PAYMENT METHOD BLOCK (ONLY ONLINE) */}
            <div className="bg-white border border-stone-200 rounded-[28px] p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-orange-600" />
                <h2 className="font-serif text-xl font-bold text-stone-900">Payment Gateway Selection</h2>
              </div>

              <div className="border border-stone-200 rounded-2xl overflow-hidden">
                <div className="bg-orange-50/10 border-b border-stone-100 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">Razorpay Online Checkout</h3>
                      <p className="text-[11px] text-stone-500 mt-0.5">UPI, Cards, Net Banking, Wallets</p>
                    </div>
                  </div>
                  <span className="bg-orange-100 text-orange-800 text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full border border-orange-200">Instant</span>
                </div>

                <div className="p-5 space-y-4 text-xs text-stone-600">
                  <div className="flex flex-wrap gap-5">
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-stone-400" />
                      <span className="font-semibold text-stone-700">BHIM / GPay UPI</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-stone-400" />
                      <span className="font-semibold text-stone-700">Credit / Debit Card</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-stone-400" />
                      <span className="font-semibold text-stone-700">Net Banking</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-stone-400" />
                      <span className="font-semibold text-stone-700">Amazon/Paytm Wallets</span>
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-2.5 text-[11px] text-orange-800 leading-normal">
                    <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <strong>No Cash on Delivery (COD) Options:</strong> In alignment with gurukul trust guidelines, all transactions are processed 100% cashless. There are no secondary shipping surcharges or COD processing overheads.
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Order Review */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            
            {/* ITEM REVIEW */}
            <div className="bg-white border border-stone-200 rounded-[28px] p-6 md:p-8 shadow-sm space-y-6">
              <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                Items in Order
              </h3>

              <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="py-3 flex gap-3.5 items-center">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-xl bg-stone-50 border border-stone-200/50"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-900 text-xs truncate">{item.product.name}</h4>
                      <p className="text-[10px] text-stone-500 mt-0.5">Quantity: {item.quantity} | Weight: {item.product.weight || 600}g</p>
                    </div>
                    <span className="font-extrabold text-stone-900 text-sm shrink-0">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Courier info */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex justify-between items-center text-xs text-stone-600">
                <div className="space-y-0.5">
                  <p className="font-black text-stone-800 uppercase tracking-wider text-[10px]">Logistics Partner</p>
                  <p className="font-medium text-stone-700">{shippingCourier}</p>
                </div>
                {shippingLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                ) : (
                  estimatedDelivery && <p className="text-right font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/40">Delivers: {estimatedDelivery}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3.5 border-t border-stone-100 pt-5">
                <div className="flex justify-between text-xs text-stone-500 font-bold uppercase tracking-wider">
                  <span>Subtotal ({cartItems.reduce((s,i) => s+i.quantity, 0)} items)</span>
                  <span className="text-stone-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-xs text-stone-500 font-bold uppercase tracking-wider">
                  <span>Shipping Fee</span>
                  {shippingLoading ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-orange-600" />
                  ) : shippingCost === 0 ? (
                    <span className="text-emerald-600 font-extrabold">FREE</span>
                  ) : (
                    <span className="text-stone-900">₹{shippingCost}</span>
                  )}
                </div>
                <div className="flex justify-between text-xs text-stone-500 font-bold uppercase tracking-wider">
                  <span>Est. Weight Surcharge</span>
                  <span className="text-stone-900">₹0</span>
                </div>
                
                <div className="flex justify-between items-baseline pt-4 border-t border-stone-100">
                  <span className="text-sm font-extrabold text-stone-950 uppercase tracking-wider">Payable Total</span>
                  <span className="text-3xl font-black text-orange-600">₹{subtotal + shippingCost}</span>
                </div>
              </div>

              <button 
                onClick={handlePaySecurely}
                disabled={checkoutLoading || shippingLoading || currentUser.addresses.length === 0}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-600/10 hover:shadow-orange-600/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {checkoutLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Launching Secure Portal...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay Securely via Razorpay</span>
                  </>
                )}
              </button>
            </div>

            {/* Secure Badges */}
            <div className="p-4 border border-stone-200/50 rounded-2xl bg-stone-50/50 flex items-center gap-3.5 text-[11px] text-stone-500">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>By clicking payment, you acknowledge that items are packed with proper spiritual hygiene and shipped via Delhivery/Shiprocket tracking.</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
