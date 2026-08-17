/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  User, 
  HelpCircle, 
  ArrowLeft,
  Home,
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import SEO from '../components/SEO';
import { db, AppSettings, DEFAULT_WHATSAPP_GROUP_URL } from '../lib/db';

const CONTACT_REASONS = [
  'Spiritual Guidance',
  'Bhagavad Gita',
  'Ramcharitmanas',
  'Sanskrit Learning',
  'Stuti / Mantra',
  'Satsang',
  'Join Hari Pathshala',
  'Website/App Issue',
  'Store / Order Query',
  'Payment Query',
  'General Query',
  'Other'
];

export default function Contact() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    mobileNumber: '',
    reason: 'Spiritual Guidance',
    message: '' 
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<typeof formData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Subscribe to realtime global settings
  useEffect(() => {
    const unsub = db.subscribeToAppSettings((st) => {
      setSettings(st);
    });
    return () => unsub();
  }, []);

  const contactPhone = settings?.contactPhone || '+91 9610579423';
  const whatsappNumber = settings?.whatsappNumber || '919610579423';
  const contactEmail = settings?.contactEmail || 'haripathshala@gmail.com';
  const address = settings?.address || 'Jaipur, Rajasthan, India';
  const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, '');
  const cleanPhone = contactPhone.replace(/[^0-9+]/g, '');

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'कृपया अपना नाम दर्ज करें (Please enter your name)';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'नाम कम से कम 2 अक्षरों का होना चाहिए';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'कृपया अपना ईमेल दर्ज करें (Please enter email address)';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'कृपया मान्य ईमेल दर्ज करें (e.g. ram@example.com)';
    }

    if (formData.mobileNumber.trim()) {
      const cleanMob = formData.mobileNumber.replace(/[^0-9]/g, '');
      if (cleanMob.length < 10) {
        errors.mobileNumber = 'मान्य 10-अंकीय मोबाइल नंबर दर्ज करें';
      }
    }

    if (!formData.reason.trim()) {
      errors.reason = 'कृपया संपर्क का कारण चुनें (Please select reason)';
    }

    if (!formData.message.trim()) {
      errors.message = 'कृपया अपना संदेश दर्ज करें (Please enter your message)';
    } else if (formData.message.trim().length < 5) {
      errors.message = 'संदेश कम से कम 5 अक्षरों का होना चाहिए';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      // Save message to Firestore collection
      const res = await db.createContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        reason: formData.reason,
        message: formData.message.trim()
      });

      if (res && res.success) {
        setSubmittedData({ ...formData });
        setIsSuccess(true);
        // Reset form fields
        setFormData({
          name: '',
          email: '',
          mobileNumber: '',
          reason: 'Spiritual Guidance',
          message: ''
        });
      } else {
        throw new Error('Failed to send message to server.');
      }
    } catch (err: any) {
      console.error('Contact message error:', err);
      setErrorMessage(err?.message || 'संदेश भेजते समय त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendViaWhatsApp = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Also save to Firestore
      await db.createContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        reason: formData.reason,
        message: formData.message.trim()
      });
    } catch (err) {
      console.warn('Silent fallback for Firestore logging on WhatsApp send:', err);
    } finally {
      setIsSubmitting(false);
    }

    const text = `*Hari Pathshala - Contact Inquiry*%0A%0A` +
      `*Name:* ${encodeURIComponent(formData.name.trim())}%0A` +
      `*Email:* ${encodeURIComponent(formData.email.trim())}%0A` +
      (formData.mobileNumber ? `*Mobile:* ${encodeURIComponent(formData.mobileNumber.trim())}%0A` : '') +
      `*Reason:* ${encodeURIComponent(formData.reason)}%0A` +
      `*Message:*%0A${encodeURIComponent(formData.message.trim())}%0A%0A` +
      `_Sent from Hari Pathshala Web App_`;

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
    <div className="flex flex-col w-full bg-stone-50/50 min-h-screen pb-20 relative overflow-hidden">
      <SEO 
        title="Contact Hari Pathshala | Get in Touch"
        description="Hari Pathshala से संपर्क करें। WhatsApp, Email या Phone के माध्यम से हमसे जुड़ें और सनातन धर्म के ज्ञान की ओर अपना कदम बढ़ाएं।"
        keywords="Contact Hari Pathshala, Hari Pathshala phone number, Hari Pathshala email, Spiritual Education contact, Jaipur Gurukul"
        url="/contact"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Contact Us", item: "/contact" }
        ]}
      />

      {/* Hero Header */}
      <div className="bg-stone-950 text-white py-16 sm:py-20 md:py-24 text-center px-4 relative overflow-hidden border-b-[6px] border-orange-500">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400 via-stone-900 to-stone-950 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-3">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-300 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-md mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white"
          >
            Contact Us
          </motion.h1>

          <p className="text-stone-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto font-medium">
            Reach out to us for any queries or spiritual guidance.
          </p>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            
            {/* Location Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 sm:p-7 rounded-[28px] shadow-sm border border-stone-200/80 flex flex-col items-center text-center gap-3.5 hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200/70 text-orange-600 flex items-center justify-center shadow-xs">
                <MapPin className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-stone-900 text-lg">Location</h3>
                <p className="text-stone-600 text-sm font-medium">{address}</p>
              </div>
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 px-5 py-2 rounded-full font-bold text-xs transition-colors cursor-pointer"
              >
                <span>View on Map</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
              </a>
            </motion.div>

            {/* Phone / WhatsApp Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white p-6 sm:p-7 rounded-[28px] shadow-sm border border-stone-200/80 flex flex-col items-center text-center gap-3.5 hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200/70 text-orange-600 flex items-center justify-center shadow-xs">
                <Phone className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-stone-900 text-lg">Phone / WhatsApp</h3>
                <p className="text-stone-600 text-sm font-medium">{contactPhone}</p>
              </div>
              <div className="flex gap-2 justify-center w-full max-w-xs">
                <a 
                  href={`tel:${cleanPhone}`} 
                  className="flex-1 inline-flex items-center justify-center gap-1 bg-orange-100 hover:bg-orange-200 text-orange-900 px-4 py-2 rounded-full font-bold text-xs transition-colors shadow-xs"
                >
                  <Phone className="w-3 h-3 text-orange-600" />
                  <span>Call Now</span>
                </a>
                <a 
                  href={`https://wa.me/${cleanWhatsapp}?text=Namaste%20Hari%20Pathshala%20%F0%9F%99%8F`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 inline-flex items-center justify-center gap-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 px-4 py-2 rounded-full font-bold text-xs transition-colors shadow-xs"
                >
                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </motion.div>

            {/* Email Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 sm:p-7 rounded-[28px] shadow-sm border border-stone-200/80 flex flex-col items-center text-center gap-3.5 hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200/70 text-orange-600 flex items-center justify-center shadow-xs">
                <Mail className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-stone-900 text-lg">Email</h3>
                <p className="text-stone-600 text-sm font-medium">{contactEmail}</p>
              </div>
              <a 
                href={`mailto:${contactEmail}`} 
                className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 px-5 py-2 rounded-full font-bold text-xs transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-stone-500" />
                <span>Email Us</span>
              </a>
            </motion.div>

            {/* Official WhatsApp Group Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-white p-6 rounded-[28px] shadow-sm border border-emerald-200 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-stone-900 text-base">WhatsApp Community</h3>
                <p className="text-stone-600 text-xs font-medium">Join our official spiritual family</p>
              </div>
              <a 
                href={settings?.whatsappGroupUrl || DEFAULT_WHATSAPP_GROUP_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-2.5 rounded-full font-bold text-xs transition-colors shadow-xs"
              >
                <span>Join WhatsApp Group</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </motion.div>

          </div>

          {/* Right Column: Contact Message Form */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white p-6 sm:p-8 md:p-10 rounded-[28px] sm:rounded-[36px] shadow-xl border border-stone-200/90"
          >
            <div className="mb-6 pb-4 border-b border-stone-100">
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Send us a Message
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-1">
                Fill the form below and we will respond promptly via Email or WhatsApp.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {isSuccess ? (
                /* Success View */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8 space-y-6"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl sm:text-3xl font-black text-stone-900">
                      Message Sent Successfully 🙏
                    </h3>
                    <p className="text-stone-800 font-hindi text-base sm:text-lg font-bold">
                      आपका संदेश सफलतापूर्वक प्राप्त हो गया है।
                    </p>
                    <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto">
                      Thank you for contacting Hari Pathshala. Your message has been recorded and we will connect with you soon.
                    </p>
                  </div>

                  {submittedData && (
                    <div className="max-w-md mx-auto bg-stone-50 border border-stone-200 rounded-2xl p-5 text-left text-xs sm:text-sm text-stone-800 space-y-2">
                      <p><span className="font-semibold text-stone-600">Name:</span> {submittedData.name}</p>
                      <p><span className="font-semibold text-stone-600">Email:</span> {submittedData.email}</p>
                      {submittedData.mobileNumber && (
                        <p><span className="font-semibold text-stone-600">Mobile:</span> {submittedData.mobileNumber}</p>
                      )}
                      <p><span className="font-semibold text-stone-600">Reason:</span> {submittedData.reason}</p>
                      <p><span className="font-semibold text-stone-600">Message:</span> {submittedData.message}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                    <button
                      onClick={handleResetForNew}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3.5 rounded-2xl text-sm shadow-md transition-all cursor-pointer"
                    >
                      <span>Send Another Message</span>
                    </button>

                    <Link
                      to="/"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-6 py-3.5 rounded-2xl text-sm transition-all"
                    >
                      <Home className="w-4 h-4" />
                      <span>Back to Home</span>
                    </Link>
                  </div>
                </motion.div>
              ) : (
                /* Contact Form */
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6" noValidate>

                  {errorMessage && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-medium flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                    
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                        Your Name <span className="text-orange-600">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input 
                          type="text" 
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Ram Kumar"
                          className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-stone-50 border text-stone-900 placeholder:text-stone-400 text-sm font-medium outline-none transition-all focus:bg-white focus:ring-2 focus:ring-orange-500 ${
                            formErrors.name ? 'border-red-400 bg-red-50/20' : 'border-stone-200 hover:border-stone-300'
                          }`}
                        />
                      </div>
                      {formErrors.name && (
                        <p className="mt-1.5 text-xs text-red-600 font-medium">{formErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                        Email Address <span className="text-orange-600">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input 
                          type="email" 
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="ram@example.com"
                          className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-stone-50 border text-stone-900 placeholder:text-stone-400 text-sm font-medium outline-none transition-all focus:bg-white focus:ring-2 focus:ring-orange-500 ${
                            formErrors.email ? 'border-red-400 bg-red-50/20' : 'border-stone-200 hover:border-stone-300'
                          }`}
                        />
                      </div>
                      {formErrors.email && (
                        <p className="mt-1.5 text-xs text-red-600 font-medium">{formErrors.email}</p>
                      )}
                    </div>

                  </div>

                  {/* Mobile Number + Reason */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                    
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center justify-between">
                        <span>Mobile Number</span>
                        <span className="text-[11px] text-stone-400 font-normal">Optional</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input 
                          type="tel" 
                          name="mobileNumber"
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

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                        Reason for Contact <span className="text-orange-600">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                          <HelpCircle className="w-4 h-4" />
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
                          {CONTACT_REASONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                      {formErrors.reason && (
                        <p className="mt-1.5 text-xs text-red-600 font-medium">{formErrors.reason}</p>
                      )}
                    </div>

                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Your Message <span className="text-orange-600">*</span>
                    </label>
                    <textarea 
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="How can we help you on your spiritual journey?"
                      className={`w-full p-4 rounded-2xl bg-stone-50 border text-stone-900 placeholder:text-stone-400 text-sm font-medium outline-none transition-all focus:bg-white focus:ring-2 focus:ring-orange-500 resize-none ${
                        formErrors.message ? 'border-red-400 bg-red-50/20' : 'border-stone-200 hover:border-stone-300'
                      }`}
                    />
                    {formErrors.message && (
                      <p className="mt-1.5 text-xs text-red-600 font-medium">{formErrors.message}</p>
                    )}
                  </div>

                  {/* Dual Action Buttons: Send Message + Send via WhatsApp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    
                    {/* Primary Button */}
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base shadow-lg shadow-orange-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>

                    {/* Secondary WhatsApp Button */}
                    <button 
                      type="button"
                      onClick={handleSendViaWhatsApp}
                      disabled={isSubmitting}
                      className="w-full bg-[#25D366] hover:bg-[#1fb855] text-white py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Send via WhatsApp</span>
                    </button>

                  </div>

                </form>
              )}
            </AnimatePresence>

          </motion.div>

        </div>
      </div>
    </div>
  );
}
