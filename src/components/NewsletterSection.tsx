import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && agreed) {
      setShowPopup(true);
      setEmail('');
      setAgreed(false);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
        <div className="bg-white/60 backdrop-blur-md rounded-[40px] p-10 md:p-16 border border-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-200 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-amber-200 rounded-full blur-3xl opacity-50"></div>
          
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mb-4 relative z-10">Hari Pathshala Spiritual Family से जुड़े रहें</h2>
          <p className="text-stone-600 mb-8 max-w-2xl mx-auto relative z-10 text-lg">Daily spiritual wisdom, Bhagavad Gita teachings, Ramcharitmanas doha, mantra chanting, upcoming satsang और divine updates पाने के लिए Hari Pathshala से जुड़ें।<br/><br/><span className="font-bold text-orange-700">यहाँ सब कुछ पूर्णतः निःशुल्क है — केवल भक्ति, ज्ञान और सेवा।</span></p>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto relative z-10">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input 
                type="email" 
                placeholder="Enter your email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow px-5 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              />
              <button 
                type="submit" 
                disabled={!agreed}
                className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-orange-200"
              >
                Subscribe
              </button>
            </div>
            <div className="flex items-start space-x-2 text-left">
              <input 
                type="checkbox" 
                id="agree" 
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
              />
              <label htmlFor="agree" className="text-sm text-stone-500">
                I agree to receive updates from Hari Pathshala. No spam, ever.
              </label>
            </div>
          </form>
        </div>
      </div>

      {/* Success Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white px-6 py-4 rounded-2xl shadow-2xl border border-green-100 flex items-center space-x-3 z-50"
          >
            <CheckCircle2 className="text-green-500 w-6 h-6" />
            <span className="text-gray-800 font-medium">Successfully Subscribed!</span>
            <button onClick={() => setShowPopup(false)} className="text-gray-400 hover:text-gray-600 ml-4">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
