import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Compass, MapPin, Sparkles, HandHeart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import FounderImage, { DEFAULT_FOUNDER_OFFICIAL_IMAGE } from '../components/FounderImage';
import { db, FounderInfo } from '../lib/db';
import { normalizeUrl } from '../lib/urlUtils';

const DEFAULT_FOUNDER_PHOTO = DEFAULT_FOUNDER_OFFICIAL_IMAGE;

export default function Founder() {
  const [founder, setFounder] = useState<FounderInfo | null>(null);

  useEffect(() => {
    const unsub = db.subscribeToFounderInfo((info) => {
      setFounder(info);
    });
    return () => unsub();
  }, []);

  const name = founder?.name || 'Ajay Swami (Amar Das)';
  const title = founder?.title || 'Founder, Hari Pathshala';
  const bio = founder?.bio || 'Ajay Swami, spiritually known as Amar Das, embarked on his spiritual journey with a profound thirst for understanding Sanatana Dharma.';
  const message = founder?.message || 'Hari Pathshala में आपका स्वागत है। हमारा उद्देश्य भगवान श्री राम, श्री हरि और सनातन धर्म की दिव्य शिक्षाओं को सरल रूप में सभी seekers तक पहुँचाना है।';
  const photoUrl = normalizeUrl(founder?.photoUrl) || DEFAULT_FOUNDER_PHOTO;
  const signatureUrl = normalizeUrl(founder?.signatureUrl);

  const founderSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    "jobTitle": title,
    "worksFor": {
      "@type": "EducationalOrganization",
      "name": "Hari Pathshala"
    },
    "url": "https://haripathshala.online/founder",
    "image": photoUrl,
    "description": bio
  });

  return (
    <div className="flex flex-col w-full bg-stone-50 overflow-hidden">
      <SEO 
        title={`${name} | Founder of Hari Pathshala`}
        description={bio}
        keywords="Ajay Swami, Amar Das, Hari Pathshala Founder, Spiritual Teacher India, Sanatan Dharma Teacher"
        url="/founder"
        image={photoUrl}
        type="profile"
        schema={founderSchema}
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Founder", item: "/founder" }
        ]}
      />
      {/* Hero Section */}
      <div className="bg-stone-900 pt-10 sm:pt-14 pb-16 sm:pb-20 border-b-4 border-orange-500 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/mandala-pattern.png')]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="relative z-10 max-w-3xl mx-auto px-2"
        >
          <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-full overflow-hidden border-4 border-orange-400 shadow-xl mb-4 relative group bg-orange-100">
             <div className="absolute inset-0 bg-gradient-to-t from-orange-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none"></div>
             <FounderImage 
               src={photoUrl} 
               alt={`${name} - ${title}`} 
               className="w-full h-full object-cover"
               containerClassName="relative w-full h-full rounded-full overflow-hidden"
             />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 drop-shadow-md">
            {name}
          </h1>
          <p className="text-xs sm:text-sm text-orange-300 font-bold tracking-wider uppercase mb-2">
            {title}
          </p>
          <p className="text-xs sm:text-sm text-stone-300 font-serif mb-4 italic">ज्ञान • भक्ति • संस्कार</p>
          <div className="w-12 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Founder Message / Intro */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-stone-200 mb-10 -mt-12 sm:-mt-16 relative z-20"
        >
          <Sparkles className="w-6 h-6 text-orange-400 mx-auto mb-3" />
          <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-stone-900 mb-4 text-center">Founder Message</h2>
          <div className="text-stone-700 mx-auto text-center font-hindi leading-relaxed max-w-2xl text-xs sm:text-sm md:text-base">
            <div className="whitespace-pre-line">
              {message}
            </div>
            {signatureUrl && (
              <div className="mt-6 flex justify-center">
                <img src={signatureUrl} alt="Founder Signature" className="h-12 sm:h-16 object-contain" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Biography Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-10 md:mb-14">
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                <Compass size={20} />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">Spiritual Journey</h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Ajay Swami, spiritually known as Amar Das, embarked on his spiritual journey with a profound thirst for understanding the deeper meaning of life through Sanatana Dharma.
            </p>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Spending significant time studying scriptures, practicing Bhakti Yoga, and chanting the holy name, he realized the transformative power of devotion (Bhakti). His journey is marked by a deep connection to the teachings of the Bhagavad Gita and Ramcharitmanas.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-orange-50 rounded-2xl p-5 sm:p-6 border border-orange-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-orange-600 shadow-2xs shrink-0">
                <MapPin size={20} />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">Hari Pathshala Journey</h3>
            </div>
            <ul className="space-y-3 text-stone-700 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <span className="text-orange-500 font-bold mt-0.5 shrink-0">✓</span>
                <span className="leading-relaxed">Deeply connected to the spiritual traditions of India.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-orange-500 font-bold mt-0.5 shrink-0">✓</span>
                <span className="leading-relaxed">Practitioner of Niskama Karma (Selfless Action).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-orange-500 font-bold mt-0.5 shrink-0">✓</span>
                <span className="leading-relaxed">Dedicated to simplifying Vedic wisdom for the modern era.</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10 md:mb-14">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-stone-200 text-center"
          >
             <Heart className="w-8 h-8 text-orange-500 mb-3 mx-auto" />
             <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 mb-2">Mission</h3>
             <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
               To create a global spiritual community where individuals can freely learn, practice, and experience the profound teachings of Sanatana Dharma without any commercial barriers.
             </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="bg-stone-900 p-5 sm:p-6 rounded-2xl shadow-xs border border-stone-800 text-white text-center"
          >
             <HandHeart className="w-8 h-8 text-orange-400 mb-3 mx-auto" />
             <h3 className="font-serif text-base sm:text-lg font-bold mb-2">Vision</h3>
             <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
               A world illuminated by spiritual knowledge, where every soul finds peace through devotion to Bhagavan Shri Ram and lives a life of purpose and dharma.
             </p>
          </motion.div>
        </div>

        {/* Call To Action */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center bg-orange-100/80 p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-orange-200"
        >
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-2">Join The Journey</h2>
          <p className="text-xs sm:text-sm text-stone-700 mb-6 max-w-xl mx-auto leading-relaxed">
            Begin your spiritual journey with Hari Pathshala. Learn the wisdom of Gita, Ramcharitmanas, and immerse in divine Bhakti.
          </p>
          <Link to="/join" className="inline-flex items-center gap-1.5 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:bg-orange-700 transition-colors">
            <span>Join Hari Pathshala</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
