/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  HeartHandshake, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft, 
  Home, 
  Phone, 
  User, 
  MapPin, 
  Calendar, 
  BookOpen, 
  MessageSquare,
  AlertCircle,
  Loader2
} from 'lucide-react';
import SEO from '../components/SEO';
import { db, AppSettings, DEFAULT_WHATSAPP_GROUP_URL } from '../lib/db';

const INDIAN_STATES = [
  'Rajasthan',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Chandigarh',
  'Other / Outside India'
];

const JOIN_REASONS = [
  'Spiritual Knowledge',
  'Bhagavad Gita Learning',
  'Ramcharitmanas Learning',
  'Sanskrit Learning',
  'Stuti & Mantra Learning',
  'Bhakti / Naam Jap',
  'Daily Spiritual Guidance',
  'Satsang & Community',
  'Sanatana Dharma Learning',
  'Meditation / Sadhana',
  'Children\'s Spiritual Education',
  'Other'
];

export default function JoinUs() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  
  const [formData, setFormData] = useState({ 
    fullName: '', 
    mobileNumber: '', 
    city: 'Jaipur', 
    state: 'Rajasthan', 
    age: '', 
    reason: 'Spiritual Knowledge',
    additionalMessage: '' 
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<typeof formData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Subscribe to realtime global settings for WhatsApp & phone
  useEffect(() => {
    const unsub = db.subscribeToAppSettings((st) => {
      setSettings(st);
    });
    return () => unsub();
  }, []);

  const whatsappNumber = settings?.whatsappNumber || '919610579423';
  const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, '');

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'कृपया अपना पूरा नाम दर्ज करें (Please enter full name)';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'नाम कम से कम 2 अक्षरों का होना चाहिए';
    }

    const cleanPhone = formData.mobileNumber.replace(/[^0-9]/g, '');
    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें (Please enter mobile number)';
    } else if (cleanPhone.length < 10) {
      errors.mobileNumber = 'मान्य 10-अंकीय मोबाइल नंबर दर्ज करें';
    }

    if (!formData.city.trim()) {
      errors.city = 'कृपया अपने शहर का नाम दर्ज करें (Please enter city)';
    }

    if (!formData.state.trim()) {
      errors.state = 'कृपया अपना राज्य चुनें (Please select state)';
    }

    const ageNum = parseInt(formData.age, 10);
    if (!formData.age || isNaN(ageNum)) {
      errors.age = 'कृपया अपनी उम्र दर्ज करें (Please enter age)';
    } else if (ageNum < 5 || ageNum > 120) {
      errors.age = 'कृपया 5 से 120 के बीच मान्य उम्र दर्ज करें';
    }

    if (!formData.reason.trim()) {
      errors.reason = 'कृपया जुड़ने का कारण चुनें (Please select reason)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on user edit
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save to Firestore
      const res = await db.createJoinApplication({
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        age: parseInt(formData.age, 10),
        reason: formData.reason,
        additionalMessage: formData.additionalMessage.trim()
      });

      if (res && res.success) {
        setSubmittedData({ ...formData });
        setIsSuccess(true);
        // Reset form fields
        setFormData({
          fullName: '',
          mobileNumber: '',
          city: 'Jaipur',
          state: 'Rajasthan',
          age: '',
          reason: 'Spiritual Knowledge',
          additionalMessage: ''
        });
      } else {
        throw new Error('Could not submit form to server.');
      }
    } catch (err: any) {
      console.error('Join application submission error:', err);
      setErrorMessage(err?.message || 'आवेदन भेजते समय त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppAction = () => {
    const data = submittedData || formData;
    const text = `*Hari Pathshala - New Join Application*%0A%0A` +
      `*Name:* ${encodeURIComponent(data.fullName)}%0A` +
      `*Mobile:* ${encodeURIComponent(data.mobileNumber)}%0A` +
      `*City:* ${encodeURIComponent(data.city)}%0A` +
      `*State:* ${encodeURIComponent(data.state)}%0A` +
      `*Age:* ${encodeURIComponent(data.age)}%0A` +
      `*Reason:* ${encodeURIComponent(data.reason)}%0A` +
      (data.additionalMessage ? `*Message:* ${encodeURIComponent(data.additionalMessage)}%0A` : '') +
      `%0A_Sent from Hari Pathshala Web App_`;

    const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${text}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleResetForNew = () => {
    setIsSuccess(false);
    setSubmittedData(null);
    setFormErrors({});
    setErrorMessage(null);
  };

  return (
    <div className="flex flex-col w-full bg-stone-50/50 min-h-screen pt-8 pb-20 relative overflow-hidden">
      <SEO 
        title="Join Hari Pathshala | Become a part of Spiritual Family"
        description="Hari Pathshala परिवार का हिस्सा बनें। निःशुल्क आध्यात्मिक कक्षाओं, भगवद्गीता, रामायण, संस्कृत और सत्संग के लिए आज ही जुड़ें।"
        keywords="Join Hari Pathshala, Spiritual Community India, Free Spiritual Classes, Join Gurukul, Sanatan Dharma, Bhagavad Gita Learning"
        url="/join"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Join Hari Pathshala", item: "/join" }
        ]}
      />

      {/* Decorative Ambient Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-200/25 rounded-full blur-3xl pointer-events-none -mr-40 -mt-20 z-0" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -ml-32 -mb-20 z-0" />

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Navigation Breadcrumb Pill */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-orange-600 bg-white px-3.5 py-1.5 rounded-full border border-stone-200 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <span className="text-xs font-bold text-orange-800 bg-orange-50 border border-orange-200/80 px-3 py-1 rounded-full">
            निःशुल्क आध्यात्मिक परिवार
          </span>
        </div>

        {/* Main Card Container */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-[28px] sm:rounded-[36px] shadow-xl border border-stone-200/90 overflow-hidden"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-orange-500 p-6 sm:p-8 md:p-10 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
            
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md">
              <HeartHandshake className="text-white w-6 h-6 sm:w-8 sm:h-8" />
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-2 tracking-tight">
              Join Hari Pathshala
            </h1>
            
            <p className="text-orange-100 text-xs sm:text-sm md:text-base max-w-xl mx-auto font-medium leading-relaxed">
              Become a part of our spiritual family. Fill the form below to connect with us directly.
            </p>
          </div>

          <div className="p-6 sm:p-8 md:p-12">

            <AnimatePresence mode="wait">
              {isSuccess ? (
                /* Success View */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-6 sm:py-8 space-y-6"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-serif text-2xl sm:text-3xl font-black text-stone-900">
                      Application Submitted Successfully 🙏
                    </h2>
                    <p className="text-stone-800 font-hindi text-base sm:text-lg font-bold">
                      आपका आवेदन सफलतापूर्वक भेज दिया गया है। हरि पथशाला परिवार में आपका स्वागत है।
                    </p>
                    <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto">
                      Thank you for joining Hari Pathshala. We have recorded your application in our ashram database and will connect with you soon.
                    </p>
                  </div>

                  {submittedData && (
                    <div className="max-w-md mx-auto bg-orange-50/70 border border-orange-200/80 rounded-2xl p-5 text-left text-xs sm:text-sm text-stone-800 space-y-2">
                      <div className="font-bold text-orange-950 border-b border-orange-200 pb-2 mb-2 flex items-center justify-between">
                        <span>Submitted Details (विवरण)</span>
                        <span className="text-[11px] bg-emerald-600 text-white px-2 py-0.5 rounded-md">Status: New</span>
                      </div>
                      <p><span className="font-semibold text-stone-600">Name:</span> {submittedData.fullName}</p>
                      <p><span className="font-semibold text-stone-600">Mobile:</span> {submittedData.mobileNumber}</p>
                      <p><span className="font-semibold text-stone-600">Location:</span> {submittedData.city}, {submittedData.state}</p>
                      <p><span className="font-semibold text-stone-600">Age:</span> {submittedData.age} years</p>
                      <p><span className="font-semibold text-stone-600">Interest:</span> {submittedData.reason}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                    <a
                      href={settings?.whatsappGroupUrl || DEFAULT_WHATSAPP_GROUP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold px-6 py-3.5 rounded-2xl text-sm shadow-md transition-all cursor-pointer active:scale-98"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Join WhatsApp Group</span>
                    </a>

                    <button
                      onClick={handleWhatsAppAction}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3.5 rounded-2xl text-sm shadow-md transition-all cursor-pointer active:scale-98"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Details on WhatsApp</span>
                    </button>

                    <button
                      onClick={handleResetForNew}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-6 py-3.5 rounded-2xl text-sm transition-all cursor-pointer"
                    >
                      <span>Submit Another Form</span>
                    </button>

                    <Link
                      to="/"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all shadow-md"
                    >
                      <Home className="w-4 h-4" />
                      <span>Back to Home</span>
                    </Link>
                  </div>

                </motion.div>
              ) : (
                /* Form View */
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>

                  {/* General Error Banner */}
                  {errorMessage && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-medium flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Row 1: Full Name + Mobile Number */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                        Full Name <span className="text-orange-600">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input 
                          type="text" 
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="e.g. Ram Kumar Sharma"
                          className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-stone-50 border text-stone-900 placeholder:text-stone-400 text-sm font-medium outline-none transition-all focus:bg-white focus:ring-2 focus:ring-orange-500 ${
                            formErrors.fullName ? 'border-red-400 bg-red-50/20' : 'border-stone-200 hover:border-stone-300'
                          }`}
                        />
                      </div>
                      {formErrors.fullName && (
                        <p className="mt-1.5 text-xs text-red-600 font-medium">{formErrors.fullName}</p>
                      )}
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                        Mobile Number <span className="text-orange-600">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input 
                          type="tel" 
                          name="mobileNumber"
                          required
                          maxLength={15}
                          value={formData.mobileNumber}
                          onChange={handleChange}
                          placeholder="e.g. 9610579423"
                          className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-stone-50 border text-stone-900 placeholder:text-stone-400 text-sm font-medium outline-none transition-all focus:bg-white focus:ring-2 focus:ring-orange-500 ${
                            formErrors.mobileNumber ? 'border-red-400 bg-red-50/20' : 'border-stone-200 hover:border-stone-300'
                          }`}
                        />
                      </div>
                      {formErrors.mobileNumber && (
                        <p className="mt-1.5 text-xs text-red-600 font-medium">{formErrors.mobileNumber}</p>
                      )}
                    </div>

                  </div>

                  {/* Row 2: City + State + Age */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
                    
                    {/* City */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                        City <span className="text-orange-600">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <input 
                          type="text" 
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="e.g. Jaipur"
                          className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-stone-50 border text-stone-900 placeholder:text-stone-400 text-sm font-medium outline-none transition-all focus:bg-white focus:ring-2 focus:ring-orange-500 ${
                            formErrors.city ? 'border-red-400 bg-red-50/20' : 'border-stone-200 hover:border-stone-300'
                          }`}
                        />
                      </div>
                      {formErrors.city && (
                        <p className="mt-1.5 text-xs text-red-600 font-medium">{formErrors.city}</p>
                      )}
                    </div>

                    {/* State Dropdown */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                        State <span className="text-orange-600">*</span>
                      </label>
                      <select 
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleChange}
                        className={`w-full px-4 py-3.5 rounded-2xl bg-stone-50 border text-stone-900 text-sm font-medium outline-none transition-all focus:bg-white focus:ring-2 focus:ring-orange-500 cursor-pointer ${
                          formErrors.state ? 'border-red-400 bg-red-50/20' : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                      {formErrors.state && (
                        <p className="mt-1.5 text-xs text-red-600 font-medium">{formErrors.state}</p>
                      )}
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                        Age <span className="text-orange-600">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <input 
                          type="number" 
                          name="age"
                          min="5"
                          max="120"
                          required
                          value={formData.age}
                          onChange={handleChange}
                          placeholder="e.g. 24"
                          className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-stone-50 border text-stone-900 placeholder:text-stone-400 text-sm font-medium outline-none transition-all focus:bg-white focus:ring-2 focus:ring-orange-500 ${
                            formErrors.age ? 'border-red-400 bg-red-50/20' : 'border-stone-200 hover:border-stone-300'
                          }`}
                        />
                      </div>
                      {formErrors.age && (
                        <p className="mt-1.5 text-xs text-red-600 font-medium">{formErrors.age}</p>
                      )}
                    </div>

                  </div>

                  {/* Why do you want to join Hari Pathshala? (Dropdown) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Why do you want to join Hari Pathshala? <span className="text-orange-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <select 
                        name="reason"
                        required
                        value={formData.reason}
                        onChange={handleChange}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-stone-50 border text-stone-900 text-sm font-medium outline-none transition-all focus:bg-white focus:ring-2 focus:ring-orange-500 cursor-pointer ${
                          formErrors.reason ? 'border-red-400 bg-red-50/20' : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        {JOIN_REASONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    {formErrors.reason && (
                      <p className="mt-1.5 text-xs text-red-600 font-medium">{formErrors.reason}</p>
                    )}
                  </div>

                  {/* Additional Message (Optional) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center justify-between">
                      <span>Additional Message (Optional)</span>
                      <span className="text-[11px] text-stone-400 normal-case font-normal">वैकल्पिक</span>
                    </label>
                    <textarea 
                      name="additionalMessage"
                      rows={4}
                      value={formData.additionalMessage}
                      onChange={handleChange}
                      placeholder="Tell us anything else you would like to share..."
                      className="w-full p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-stone-300 text-stone-900 placeholder:text-stone-400 text-sm font-medium outline-none transition-all focus:bg-white focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white py-4 rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-orange-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-stone-500 text-center font-medium">
                    🔒 All information is securely stored in Hari Pathshala database. No spam or commercial sharing.
                  </p>

                </form>
              )}
            </AnimatePresence>

          </div>

        </motion.div>

      </div>
    </div>
  );
}
