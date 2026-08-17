/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../lib/auth';
import { db } from '../lib/db';
import { 
  User, Mail, Phone, Calendar, MapPin, Plus, Trash2, Home, Briefcase, Tag, 
  LogOut, Edit3, Save, Check, UserCheck, ShoppingBag, ExternalLink, FileText, Truck, ArrowRight, RefreshCw 
} from 'lucide-react';
import SEO from '../components/SEO';
import { useGlobalError } from '../lib/error';

// Helper to compress and resize images client-side
function compressAndResizeImage(file: File, maxWidth = 400, maxHeight = 400, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

// Upload helper with automatic retry
async function uploadToImgBBWithRetry(base64Image: string, fileName: string, maxRetries = 3): Promise<string> {
  let attempt = 0;
  while (true) {
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          name: fileName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Upload server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data?.url) {
        return data.data.url;
      } else {
        throw new Error(data.error || 'Invalid API response format from server');
      }
    } catch (err: any) {
      attempt++;
      if (attempt >= maxRetries) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
}

export default function Profile() {
  const { currentUser, updateProfile, logout, addAddress, deleteAddress, setDefaultAddress } = useAuth();
  const navigate = useNavigate();
  const { showFriendlyError } = useGlobalError();
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressedBase64 = await compressAndResizeImage(file);
      const imgBbUrl = await uploadToImgBBWithRetry(compressedBase64, file.name);
      await updateProfile({ photoURL: imgBbUrl });
    } catch (err: any) {
      console.error('[Profile Avatar Upload Error]', err);
      showFriendlyError(err);
    } finally {
      setIsUploading(false);
    }
  };

  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = db.subscribe('orders', (data) => {
      // Filter orders belonging to the user
      const userOrders = data.filter(o => 
        o.customerName === currentUser.fullName || 
        (currentUser.mobile && o.customerPhone === currentUser.mobile)
      );
      setOrders(userOrders);
    });
    return () => unsub();
  }, [currentUser]);

  // Address modal/form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressType, setAddressType] = useState<'Home' | 'Office' | 'Other'>('Home');
  const [addressFullName, setAddressFullName] = useState('');
  const [addressMobile, setAddressMobile] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressPincode, setAddressPincode] = useState('');
  const [addressDefault, setAddressDefault] = useState(false);

  // Edit details states
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [gender, setGender] = useState(currentUser?.gender || 'Male');
  const [dob, setDob] = useState(currentUser?.dateOfBirth || '');
  const [successMsg, setSuccessMsg] = useState('');

  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center pt-24">
        <SEO title="My Profile | Hari Pathshala" description="Access your profile." url="/profile" />
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="font-serif text-3xl font-bold text-stone-900 mb-2">Access Restrained</h2>
        <p className="text-stone-600 max-w-sm mb-6">You must log in to view and manage your spiritual profile, sadhana journals, and address books.</p>
        <button 
          onClick={() => navigate('/login')}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg transition-all"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      await updateProfile({
        fullName,
        displayName,
        mobile,
        gender,
        dateOfBirth: dob
      });
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressFullName || !addressMobile || !addressLine || !addressCity || !addressState || !addressPincode) {
      alert('Please fill in all address fields.');
      return;
    }

    try {
      await addAddress({
        type: addressType,
        fullName: addressFullName,
        mobile: addressMobile,
        addressLine,
        city: addressCity,
        state: addressState,
        pincode: addressPincode,
        isDefault: addressDefault
      });

      // Reset address form
      setAddressFullName('');
      setAddressMobile('');
      setAddressLine('');
      setAddressCity('');
      setAddressState('');
      setAddressPincode('');
      setAddressDefault(false);
      setShowAddressForm(false);
    } catch (err) {
      console.error('Failed to add address:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-50/40 pt-28 pb-20">
      <SEO 
        title={`${currentUser.fullName}'s Profile | Hari Pathshala`}
        description="Manage your addresses, spiritual sadhana reports, bookmarks, and shopping credentials."
        url="/profile"
      />

      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header Banner */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-[32px] p-8 md:p-12 text-white shadow-xl relative overflow-hidden mb-8">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/mandala-pattern.png')]" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="relative group w-28 h-28 rounded-full border-4 border-white/30 overflow-hidden shadow-2xl shrink-0 bg-stone-100">
              <img 
                src={currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'} 
                alt={currentUser.fullName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              {isUploading ? (
                <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm flex flex-col items-center justify-center text-white p-2">
                  <RefreshCw className="w-5 h-5 mb-1 animate-spin text-orange-400" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-center text-white/95">Syncing...</span>
                </div>
              ) : (
                <label className="absolute inset-0 bg-stone-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center cursor-pointer text-[10px] font-black uppercase tracking-wider text-white select-none">
                  <Edit3 className="w-4 h-4 mb-1 text-orange-300" />
                  <span>Change</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarUpload}
                    className="hidden" 
                  />
                </label>
              )}
            </div>
            <div className="text-center md:text-left flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="font-serif text-3xl md:text-4xl font-black tracking-tight">{currentUser.fullName}</h1>
                <span className="bg-white/20 text-white border border-white/20 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                  Member
                </span>
              </div>
              <p className="text-orange-50 font-medium md:text-lg">@{currentUser.displayName}</p>
              <p className="text-white/80 text-sm flex items-center justify-center md:justify-start gap-1.5">
                <Mail className="w-4 h-4" />
                <span>{currentUser.email}</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-6 py-3 rounded-2xl text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 flex items-center gap-3 text-sm mb-8 animate-fade-in">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PROFILE DETAILS CARD */}
          <div className="lg:col-span-1 bg-white border border-stone-200 rounded-[32px] p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-bold text-stone-900">Personal Details</h2>
              <button
                onClick={() => {
                  if (isEditing) {
                    setFullName(currentUser.fullName);
                    setDisplayName(currentUser.displayName);
                    setMobile(currentUser.mobile || '');
                    setGender(currentUser.gender || 'Male');
                    setDob(currentUser.dateOfBirth || '');
                  }
                  setIsEditing(!isEditing);
                }}
                className="text-stone-500 hover:text-orange-600 transition-colors font-bold text-sm flex items-center gap-1"
              >
                {isEditing ? (
                  <span>Cancel</span>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </>
                )}
              </button>
            </div>

            {!isEditing ? (
              <div className="space-y-5">
                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-stone-50 transition-all">
                  <User className="w-5 h-5 text-stone-400" />
                  <div>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Full Name</p>
                    <p className="text-stone-900 font-semibold text-sm">{currentUser.fullName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-stone-50 transition-all">
                  <User className="w-5 h-5 text-stone-400" />
                  <div>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Display Name</p>
                    <p className="text-stone-900 font-semibold text-sm">@{currentUser.displayName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-stone-50 transition-all">
                  <Phone className="w-5 h-5 text-stone-400" />
                  <div>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Mobile Number</p>
                    <p className="text-stone-900 font-semibold text-sm">{currentUser.mobile || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-stone-50 transition-all">
                  <Calendar className="w-5 h-5 text-stone-400" />
                  <div>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Gender</p>
                    <p className="text-stone-900 font-semibold text-sm">{currentUser.gender || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-stone-50 transition-all">
                  <Calendar className="w-5 h-5 text-stone-400" />
                  <div>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Date of Birth</p>
                    <p className="text-stone-900 font-semibold text-sm">{currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1 shadow transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </form>
            )}
          </div>

          {/* ADDRESS BOOK SECTION */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-stone-200 rounded-[32px] p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">My Addresses</h2>
                  <p className="text-xs text-stone-500 mt-1">Manage shipping locations for spiritual bookstore deliveries</p>
                </div>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200/50 font-bold px-4 py-2 rounded-2xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {/* Address Form */}
              {showAddressForm && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-stone-50 p-6 rounded-2xl border border-stone-200 mb-6 space-y-4"
                >
                  <h3 className="text-sm font-bold text-stone-800">Add New Address</h3>
                  
                  <div className="flex gap-2.5">
                    {(['Home', 'Office', 'Other'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAddressType(type)}
                        className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
                          addressType === type 
                            ? 'bg-orange-600 text-white border-orange-600 shadow-sm' 
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {type === 'Home' && <Home className="w-3.5 h-3.5" />}
                        {type === 'Office' && <Briefcase className="w-3.5 h-3.5" />}
                        {type === 'Other' && <Tag className="w-3.5 h-3.5" />}
                        <span>{type}</span>
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Recipient Name</label>
                      <input
                        type="text"
                        value={addressFullName}
                        onChange={(e) => setAddressFullName(e.target.value)}
                        placeholder="Vijay Swami"
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        required
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        value={addressMobile}
                        onChange={(e) => setAddressMobile(e.target.value)}
                        placeholder="+91 9610579423"
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Street Address</label>
                      <input
                        type="text"
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        placeholder="Flat/House No, Building, Street, Area"
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        required
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">City</label>
                      <input
                        type="text"
                        value={addressCity}
                        onChange={(e) => setAddressCity(e.target.value)}
                        placeholder="Jaipur"
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        required
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">State</label>
                      <input
                        type="text"
                        value={addressState}
                        onChange={(e) => setAddressState(e.target.value)}
                        placeholder="Rajasthan"
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        required
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Pincode</label>
                      <input
                        type="text"
                        value={addressPincode}
                        onChange={(e) => setAddressPincode(e.target.value)}
                        placeholder="302001"
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        required
                      />
                    </div>

                    <div className="md:col-span-1 flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addressDefault}
                          onChange={(e) => setAddressDefault(e.target.checked)}
                          className="rounded text-orange-600 focus:ring-orange-500/20 border-stone-300 h-4.5 w-4.5"
                        />
                        <span className="text-xs font-semibold text-stone-700">Set as default address</span>
                      </label>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow cursor-pointer"
                      >
                        Add Address
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Saved Addresses List */}
              {currentUser.addresses.length === 0 ? (
                <div className="text-center py-10 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  <MapPin className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-stone-500 text-sm font-semibold">No addresses saved yet</p>
                  <p className="text-stone-400 text-xs mt-1">Add your shipping details to checkout instantly</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentUser.addresses.map((addr) => (
                    <div 
                      key={addr.id}
                      className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                        addr.isDefault 
                          ? 'bg-orange-50/20 border-orange-200 shadow-sm' 
                          : 'bg-white border-stone-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="p-2.5 rounded-xl bg-stone-100 text-stone-600 shrink-0 mt-1">
                        {addr.type === 'Home' && <Home className="w-5 h-5 text-orange-600" />}
                        {addr.type === 'Office' && <Briefcase className="w-5 h-5 text-orange-600" />}
                        {addr.type === 'Other' && <Tag className="w-5 h-5 text-orange-600" />}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">{addr.fullName}</span>
                          <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">
                            {addr.type}
                          </span>
                          {addr.isDefault && (
                            <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-stone-700 text-sm">{addr.addressLine}</p>
                        <p className="text-stone-600 text-xs">
                          {addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span>
                        </p>
                        <p className="text-stone-600 text-xs">Mobile: {addr.mobile}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!addr.isDefault && (
                          <button
                            onClick={() => setDefaultAddress(addr.id)}
                            className="text-stone-500 hover:text-orange-600 transition-colors font-semibold text-xs border border-stone-200 px-2.5 py-1 rounded-xl bg-white shadow-sm hover:bg-stone-50 cursor-pointer"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="text-stone-400 hover:text-red-600 p-1.5 rounded-xl border border-stone-200 bg-white hover:bg-red-50 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order History */}
            <div className="bg-white border border-stone-200 rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
              <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-orange-600" />
                <span>My Orders</span>
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-10 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  <p className="text-stone-500 text-sm font-semibold">No orders placed yet</p>
                  <p className="text-stone-400 text-xs mt-1">Products purchased from our spiritual bookstore will show up here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow transition-shadow"
                    >
                      {/* Card Header */}
                      <div className="bg-stone-50/50 px-5 py-4 border-b border-stone-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Order Reference</p>
                          <p className="font-extrabold text-stone-900 text-xs mt-0.5">{order.id}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            order.orderStatus === 'Delivered' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                              : order.orderStatus === 'Cancelled'
                              ? 'bg-red-50 text-red-800 border-red-100'
                              : 'bg-orange-50 text-orange-800 border-orange-100'
                          }`}>
                            {order.orderStatus}
                          </span>
                          {order.isTest && (
                            <span className="bg-amber-50 text-amber-800 border-amber-100 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                              Sandbox Test
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-4">
                        {/* Items */}
                        <div className="divide-y divide-stone-100 text-xs">
                          {order.items?.map((item: any) => (
                            <div key={item.product.id} className="py-2.5 flex justify-between items-center gap-4">
                              <div className="flex items-center gap-2.5">
                                <img 
                                  src={item.product.image} 
                                  alt={item.product.name} 
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-8 rounded-lg object-cover bg-stone-50 border border-stone-200/50"
                                />
                                <span className="font-bold text-stone-850 line-clamp-1">{item.product.name}</span>
                              </div>
                              <span className="text-stone-500 font-semibold shrink-0">Qty: {item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Summary details */}
                        <div className="border-t border-stone-100 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="text-xs text-stone-500">
                            Ordered: <strong className="text-stone-800">{new Date(order.createdAt).toLocaleDateString()}</strong>
                          </div>
                          
                          <div className="flex items-baseline gap-1">
                            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Total Amount:</span>
                            <span className="text-lg font-black text-orange-600">₹{order.totalAmount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="bg-stone-50/20 px-5 py-3 border-t border-stone-100 flex flex-wrap justify-end gap-2 text-xs">
                        <a 
                          href={`/api/invoice/${order.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-orange-600" />
                          <span>Invoice</span>
                        </a>
                        <Link 
                          to={`/order/track/${order.id}`}
                          className="px-4 py-1.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-colors font-bold flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5 text-orange-400" />
                          <span>Track Shipment</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
