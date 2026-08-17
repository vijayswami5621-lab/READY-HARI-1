/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../lib/auth';
import { User, Mail, Lock, Phone, Calendar, Sparkles, Upload, Trash2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import { translateToFriendlyError } from '../lib/error';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/profile';

  // Form states
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  
  // File upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [localPreview, setLocalPreview] = useState('');

  // General state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read and compress image locally before uploading
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB. Please upload a smaller photo.');
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      setUploadError('Invalid file type. Please upload an image.');
      return;
    }

    setUploadError('');
    setUploading(true);
    setUploadProgress(10);

    // Create a local object URL for instant visual feedback
    const reader = new FileReader();
    
    // Set up local preview immediately
    const localUrl = URL.createObjectURL(file);
    setLocalPreview(localUrl);

    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64String = reader.result as string;
      setUploadProgress(40);

      try {
        // Post base64 string to our Express backend upload proxy /api/upload
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image: base64String,
            name: `avatar-${Date.now()}`
          })
        });

        setUploadProgress(70);

        if (!response.ok) {
          throw new Error('Upload request failed.');
        }

        const data = await response.json();
        setUploadProgress(90);

        if (data.success && data.data?.url) {
          // Successfully uploaded to ImgBB, save the direct image URL
          setPhotoURL(data.data.url);
          setUploadProgress(100);
          setTimeout(() => setUploading(false), 300);
        } else {
          throw new Error('ImgBB did not return a valid direct URL.');
        }
      } catch (err: any) {
        console.error('Image upload failed:', err);
        setUploadError('Failed to upload image. Click to retry.');
        setUploading(false);
      }
    };
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = () => {
    setPhotoURL('');
    setLocalPreview('');
    setUploadError('');
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Field validations
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName,
        displayName: displayName || fullName.split(' ')[0],
        email,
        mobile,
        gender,
        dateOfBirth: dob,
        photoURL,
        password
      });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(translateToFriendlyError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/50 flex items-center justify-center pt-24 pb-16 px-4">
      <SEO 
        title="Register Profile | Hari Pathshala"
        description="Register a free profile with Hari Pathshala to access stutis, track Daily Sadhana, and manage spiritual products orders."
        url="/register"
      />
      
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-100/30 rounded-full blur-3xl -mr-32 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-100/30 rounded-full blur-3xl -ml-32 -mb-16 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl bg-white border border-stone-200 shadow-xl rounded-[32px] p-8 md:p-10 relative z-10 my-8"
      >
        <div className="text-center mb-8">
          <div className="text-3xl mb-3">🚩</div>
          <h2 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">Create Profile</h2>
          <p className="text-sm text-stone-600 mt-2">Join our digital gurukul family and begin your spiritual path</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-2xl border border-red-200 flex items-start gap-3 text-sm mb-6">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          
          {/* PHOTO UPLOAD BLOCK */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-stone-50 p-6 rounded-3xl border border-stone-100">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-stone-100 border-2 border-orange-200 shrink-0 shadow-inner group">
              {localPreview || photoURL ? (
                <img 
                  src={localPreview || photoURL} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">
                  <User className="w-10 h-10" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider mb-1">Uploading</span>
                  <div className="w-12 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left space-y-2">
              <h3 className="text-sm font-bold text-stone-800">Profile Photo</h3>
              <p className="text-xs text-stone-600">Upload a profile photo. The image is compressed and securely hosted.</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={uploading}
                  className="bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-stone-500" />
                  <span>Choose Image</span>
                </button>
                {(localPreview || photoURL) && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="bg-white hover:bg-red-50 text-red-600 border border-stone-200 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
              {uploadError && <p className="text-xs text-red-600 font-medium">{uploadError}</p>}
              {photoURL && (
                <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span className="truncate max-w-[200px] md:max-w-xs">Profile Photo set!</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Full Name <span className="text-orange-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Vijay Swami"
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3.5 pl-12 pr-4 text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Display Name (Optional)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                  <Sparkles className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Vijay"
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3.5 pl-12 pr-4 text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Email Address <span className="text-orange-500">*</span>
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

            {/* Mobile */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Mobile Number (Optional)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                  <Phone className="w-5 h-5" />
                </span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 9610579423"
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3.5 pl-12 pr-4 text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Gender (Optional)
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3.5 px-4 text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Date of Birth (Optional)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                  <Calendar className="w-5 h-5" />
                </span>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3.5 pl-12 pr-4 text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Password <span className="text-orange-500">*</span>
              </label>
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Confirm Password <span className="text-orange-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3.5 pl-12 pr-4 text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-600/10 hover:shadow-orange-600/20 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Profile</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-stone-500 font-bold tracking-wider">Already have a profile?</span>
          </div>
        </div>

        <p className="text-center text-sm text-stone-600">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-orange-600 hover:text-orange-700 transition-colors">
            Login Here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
