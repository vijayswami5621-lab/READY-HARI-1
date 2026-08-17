import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Target, Eye, Heart, Compass, Calendar, MapPin, Laptop, Flame, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import FounderImage, { DEFAULT_FOUNDER_OFFICIAL_IMAGE } from '../components/FounderImage';
import { db, FounderInfo } from '../lib/db';
import { normalizeUrl } from '../lib/urlUtils';

const DEFAULT_FOUNDER_PHOTO = DEFAULT_FOUNDER_OFFICIAL_IMAGE;

export default function About() {
  const [founder, setFounder] = useState<FounderInfo | null>(null);

  useEffect(() => {
    const unsub = db.subscribeToFounderInfo((info) => {
      setFounder(info);
    });
    return () => unsub();
  }, []);

  const founderName = founder?.name || 'Ajay Swami (Amar Das)';
  const founderTitle = founder?.title || 'Founder • Hari Pathshala';
  const founderPhoto = normalizeUrl(founder?.photoUrl) || DEFAULT_FOUNDER_PHOTO;
  const founderMessage = founder?.message || 'Hari Pathshala में आपका स्वागत है। हमारा उद्देश्य भगवान श्री राम, श्री हरि और सनातन धर्म की दिव्य शिक्षाओं को सरल रूप में सभी seekers तक पहुँचाना है।';

  const aboutSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Hari Pathshala",
    "description": "Learn about Hari Pathshala, a modern spiritual gurukul dedicated to Sanatan Dharma.",
    "publisher": {
      "@type": "EducationalOrganization",
      "name": "Hari Pathshala"
    }
  });

  const values = [
    { icon: <Target className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Our Mission", text: "To spread the divine knowledge of Sanatana Dharma and inspire individuals to lead a life of devotion and righteousness." },
    { icon: <Eye className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Our Vision", text: "A world where every soul is connected to the supreme through Bhakti Yoga and the timeless teachings of our scriptures." },
    { icon: <Heart className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Our Purpose", text: "To create a spiritual community that fosters love for Bhagavan Shri Ram and Shri Hari." },
  ];

  return (
    <div className="flex flex-col w-full bg-transparent overflow-hidden">
      <SEO 
        title="About Hari Pathshala | Our Mission & Vision"
        description="Hari Pathshala सनातन धर्म का एक डिजिटल गुरुकुल है। जानिए हमारी आध्यात्मिक यात्रा, Mission और Vision के बारे में।"
        keywords="About Hari Pathshala, Sanatan Dharma teachings, Spiritual Education, Bhakti Yoga"
        url="/about"
        schema={aboutSchema}
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "About", item: "/about" }
        ]}
      />
      {/* Page Header */}
      <div className="bg-stone-900 py-10 sm:py-14 border-b-4 border-orange-500 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/mandala-pattern.png')]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent"></div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-5xl mx-auto">
          <Flame size={36} className="mx-auto text-orange-400 mb-3" />
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md px-2">
            About Hari Pathshala
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-orange-300 font-hindi tracking-widest drop-shadow-xs mb-1 px-2">
            ज्ञान • भक्ति • संस्कार
          </p>
        </motion.div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-16">
        
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12 md:mb-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4 text-stone-700 leading-relaxed"
          >
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-stone-900">Hari Pathshala क्या है?</h2>
            <div className="w-12 h-1 bg-orange-400 rounded-full mb-4"></div>
            <p className="text-xs sm:text-sm leading-relaxed">
              Hari Pathshala एक ऐसा Modern Spiritual Learning Platform है जहाँ Sanatana Dharma की दिव्य शिक्षाओं को सरल और आधुनिक तरीके से सिखाया जाता है। हमारा उद्देश्य केवल ज्ञान देना नहीं, बल्कि विद्यार्थियों और spiritual seekers के जीवन में discipline, positivity, devotion और inner peace लाना है।
            </p>
            <p className="text-xs sm:text-sm leading-relaxed">
              यहाँ आप Bhagavad Gita, Sanskrit, Shlokas, Mantra Chanting, Daily Sadhana, Bhakti Yoga और Vedic Wisdom को step-by-step सीख सकते हैं। यह कोई सामान्य स्कूल या कोचिंग सेंटर नहीं है, बल्कि यह एक "आध्यात्मिक परिवार" है।
            </p>
            <div className="bg-orange-50 p-4 sm:p-5 rounded-2xl border border-orange-100 shadow-xs">
              <h3 className="font-serif text-sm sm:text-base font-bold text-orange-900 mb-1">संपूर्णतः निःशुल्क शिक्षा</h3>
              <p className="text-orange-800 m-0 text-xs sm:text-sm leading-relaxed">
                Hari Pathshala में सभी spiritual classes, Bhagavad Gita learning, Sanskrit, Shlokas, Daily Sadhana और Vedic Wisdom sessions पूरी तरह <strong className="text-orange-900 uppercase">Free</strong> हैं। कोई Registration Fees, Hidden Charges या Paid Membership नहीं है।
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative w-full max-w-sm lg:max-w-none mx-auto"
          >
            <img 
              src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1000&auto=format&fit=crop" 
              alt="Spiritual Journey" 
              className="rounded-2xl sm:rounded-3xl shadow-lg relative z-10 w-full object-cover aspect-[4/3] border-4 border-white"
            />
          </motion.div>
        </div>

        {/* Core Values */}
        <div className="text-center mb-8">
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 mb-2">Our Core Principles</h2>
          <div className="w-12 h-1 bg-orange-400 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 md:mb-16">
          {values.map((val, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-stone-200 hover:shadow-md hover:-translate-y-1 transition-all group w-full text-center sm:text-left"
            >
              <div className="bg-orange-50 w-11 h-11 rounded-xl flex items-center justify-center text-orange-600 mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300 mx-auto sm:mx-0">
                {val.icon}
              </div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 mb-2">{val.title}</h3>
              <p className="text-stone-600 leading-relaxed text-xs sm:text-sm">{val.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Founder Section Extended */}
        <div className="bg-stone-50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border border-stone-200 shadow-xs mb-12 md:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-center">
            <div className="lg:col-span-5 w-full flex justify-center">
              <div className="aspect-[3/4] w-full max-w-[260px] sm:max-w-[300px] bg-orange-100 rounded-2xl overflow-hidden relative shadow-md border-4 border-white group mx-auto">
                <FounderImage 
                  src={founderPhoto} 
                  alt={`${founderName} - ${founderTitle}`} 
                  className="w-full h-full object-cover"
                  containerClassName="relative w-full h-full overflow-hidden"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500 pointer-events-none"></div>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-3 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 text-center lg:text-left">{founderName}</h2>
              <p className="text-orange-600 font-bold tracking-wider uppercase text-xs text-center lg:text-left">{founderTitle}</p>
              
              <div className="bg-orange-50/70 p-4 rounded-xl border border-orange-100 shadow-2xs italic text-stone-800 text-xs sm:text-sm font-hindi leading-relaxed text-center lg:text-left">
                "{founderMessage}"
              </div>

              <p className="text-center lg:text-left">
                Bhagavad Gita, Ramcharitmanas, Sanskrit, Hari Naam और Daily Sadhana के माध्यम से spiritual growth, devotion और inner peace को जीवन का हिस्सा बनाना ही हमारा लक्ष्य है।
              </p>
              <p className="text-center lg:text-left">
                Hari Pathshala केवल एक learning platform नहीं बल्कि एक आध्यात्मिक परिवार है जहाँ ज्ञान, भक्ति, संस्कार और सकारात्मक जीवन का सुंदर संगम होता है।
              </p>
              <div className="pt-2 flex justify-center lg:justify-start">
                <Link to="/founder" className="inline-flex items-center gap-1.5 bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-orange-600 transition-colors shadow-sm">
                  <span>Read Full Journey</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline/Facts */}
        <div className="bg-stone-900 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden border-b-4 border-orange-500 shadow-xl">
          <div className="absolute top-0 right-0 opacity-5 hidden sm:block pointer-events-none">
            <Compass size={280} className="-mt-10 -mr-10 text-white" />
          </div>
          
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-center text-white relative z-10">Our Journey</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10 text-center">
            <div className="group">
              <div className="w-12 h-12 mx-auto bg-white/10 rounded-xl flex items-center justify-center text-orange-400 mb-3 backdrop-blur-sm group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                <Calendar size={22} />
              </div>
              <h4 className="text-base sm:text-lg font-serif font-bold mb-1">Est. 2020</h4>
              <p className="text-stone-400 text-xs leading-relaxed">Founded with a vision to spread Bhakti</p>
            </div>
            
            <div className="group">
              <div className="w-12 h-12 mx-auto bg-white/10 rounded-xl flex items-center justify-center text-orange-400 mb-3 backdrop-blur-sm group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                <MapPin size={22} />
              </div>
              <h4 className="text-base sm:text-lg font-serif font-bold mb-1">Vrindavan Roots</h4>
              <p className="text-stone-400 text-xs leading-relaxed">Deeply connected to the sacred land</p>
            </div>
            
            <div className="group">
              <div className="w-12 h-12 mx-auto bg-white/10 rounded-xl flex items-center justify-center text-orange-400 mb-3 backdrop-blur-sm group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                <Laptop size={22} />
              </div>
              <h4 className="text-base sm:text-lg font-serif font-bold mb-1">Digital Gurukul</h4>
              <p className="text-stone-400 text-xs leading-relaxed">Reaching devotees globally</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
