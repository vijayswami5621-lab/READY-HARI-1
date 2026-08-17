import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Book, Heart, Sunrise, Sparkles, Feather, Flower2, MapPin, Phone, Mail, BookHeart, Target, ArrowRight } from 'lucide-react';
import NewsletterSection from '../components/NewsletterSection';
import SEO from '../components/SEO';
import HomeProductsSection from '../components/HomeProductsSection';
import HomeBannerSlider from '../components/HomeBannerSlider';
import HomeQuotesSection from '../components/HomeQuotesSection';
import FounderImage from '../components/FounderImage';
import { db, FounderInfo, AppSettings } from '../lib/db';
import { normalizeUrl } from '../lib/urlUtils';

const DEFAULT_FOUNDER_PHOTO = 'https://i.ibb.co/C3fMqkPN/1afc23d9a35f.png';

export default function Home() {
  const [founder, setFounder] = useState<FounderInfo | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    const unsubFounder = db.subscribeToFounderInfo((info) => {
      setFounder(info);
    });
    const unsubSettings = db.subscribeToAppSettings((st) => {
      setSettings(st);
    });
    return () => {
      unsubFounder();
      unsubSettings();
    };
  }, []);

  const founderName = founder?.name || 'Ajay Swami (Amar Das)';
  const founderTitle = founder?.title || 'Founder, Hari Pathshala';
  const founderPhoto = normalizeUrl(founder?.photoUrl) || DEFAULT_FOUNDER_PHOTO;
  const founderMessage = founder?.message || 'हमारा उद्देश्य Bhagavad Gita, Sanskrit, Shlokas, Vedic Wisdom और Sanatana Dharma की timeless teachings को सरल और practical तरीके से सभी seekers तक पहुँचाना है।';

  const appName = settings?.appName || 'Hari Pathshala';
  const contactPhone = settings?.contactPhone || '+91 9610579423';
  const contactEmail = settings?.contactEmail || 'haripathshala@gmail.com';
  const address = settings?.address || 'Jaipur, Rajasthan, India';

  const homeSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": appName,
    "url": "https://haripathshala.online",
    "logo": "https://i.ibb.co/qMG2MS27/logo.png",
    "founder": {
      "@type": "Person",
      "name": founderName
    },
    "description": "Hari Pathshala एक आध्यात्मिक गुरुकुल है जहाँ Bhagavad Gita, Ramcharitmanas, Sanskrit, Daily Sadhana, Hari Naam और Sanatan Dharma की निःशुल्क शिक्षा प्रदान की जाती है।",
    "sameAs": [
      `https://wa.me/${(settings?.whatsappNumber || '919610579423').replace(/[^0-9]/g, '')}`
    ]
  });

  const features = [
    { title: "1. श्री राम की शरण", desc: "Hari Pathshala का मुख्य उद्देश्य लोगों को भगवान श्री राम और श्री हरि की भक्ति से जोड़ना है।", icon: <Heart className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { title: "2. सनातन धर्म का ज्ञान", desc: "यहाँ Bhagavad Gita, Ramcharitmanas, Vedas और ancient scriptures की शिक्षाएँ सरल भाषा में सिखाई जाती हैं।", icon: <Book className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { title: "3. संस्कार और भक्ति", desc: "हमारा उद्देश्य केवल शिक्षा देना नहीं, बल्कि अच्छे संस्कार, discipline और devotion विकसित करना है।", icon: <Sunrise className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { title: "4. निःशुल्क आध्यात्मिक शिक्षा", desc: "Hari Pathshala में सभी spiritual classes, shlok learning और guidance पूरी तरह FREE हैं।", icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { title: "5. आत्मिक शांति", desc: "Daily Sadhana, mantra chanting और meditation के माध्यम से inner peace और positivity प्राप्त की जाती है।", icon: <Flower2 className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { title: "6. राम नाम की महिमा", desc: "\"राम नाम\" को जीवन का आधार मानकर प्रेम, सेवा और भक्ति का मार्ग अपनाया जाता है।", icon: <Feather className="w-5 h-5 sm:w-6 sm:h-6" /> },
  ];

  const learningTopics = [
    "Bhagavad Gita Learning",
    "Ram Naam & Bhakti",
    "Ramcharitmanas",
    "Meditation & Sadhana",
    "Sanskrit & Shlokas",
    "Peace & Positive Living"
  ];

  return (
    <div className="flex flex-col w-full overflow-hidden">
      <SEO 
        title="Hari Pathshala | Bhagavad Gita, Ramcharitmanas, Sanskrit & Sanatan Dharma"
        description="Hari Pathshala एक आध्यात्मिक गुरुकुल है जहाँ Bhagavad Gita, Ramcharitmanas, Sanskrit, Daily Sadhana, Hari Naam और Sanatan Dharma की निःशुल्क शिक्षा प्रदान की जाती है।"
        url="/"
        schema={homeSchema}
      />

      {/* 1. TOP DYNAMIC 3-IMAGE BANNER SLIDER */}
      <HomeBannerSlider />

      {/* 2. PROMINENT PRODUCTS SECTION */}
      <HomeProductsSection />

      {/* 2.5. COMPACT QUOTES SECTION */}
      <HomeQuotesSection />

      {/* 3. HERO SECTION */}
      <section className="relative flex items-center justify-center overflow-hidden bg-transparent py-10 sm:py-14 md:py-16">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl -mr-32 -mt-16 pointer-events-none hidden md:block"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-100/50 rounded-full blur-2xl -ml-24 -mb-24 pointer-events-none hidden md:block"></div>
        
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-xl sm:text-2xl mb-3">🪔🪔🪔</div>
            <div className="inline-block mb-4 px-3.5 py-1 rounded-full bg-orange-100 text-orange-800 text-[11px] sm:text-xs font-bold uppercase tracking-widest shadow-xs border border-orange-200">
              <span>🚩 श्री सीताराम नाम महिमा 🚩</span>
            </div>
            
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-stone-900 mb-2 sm:mb-3 tracking-tight leading-tight px-2">
              Hari Pathshala
            </h1>
            
            <h2 className="font-serif text-base sm:text-lg md:text-xl text-orange-600 mb-4 sm:mb-6 font-bold drop-shadow-xs px-2">
              भक्ति • प्रेम • श्री सीताराम
            </h2>
            
            <p className="text-xs sm:text-sm md:text-base text-stone-700 max-w-3xl mx-auto mb-2 sm:mb-3 leading-relaxed font-medium px-2">
              Hari Pathshala एक ऐसा <span className="font-bold text-stone-900">Spiritual Gurukul</span> है जहाँ केवल ज्ञान नहीं, बल्कि भगवान के प्रति प्रेम, भक्ति और आत्मिक शांति सिखाई जाती है।
            </p>

            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
              यहाँ Bhagavad Gita, Ramcharitmanas, Sanskrit, Mantra Chanting और Sanatana Dharma की दिव्य शिक्षाओं को modern जीवन के अनुसार समझाया जाता है।
            </p>

            <div className="bg-white/80 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl border border-stone-200 shadow-sm max-w-xl mx-auto mb-6 sm:mb-8">
              <p className="font-hindi text-sm sm:text-base md:text-lg text-stone-900 mb-2 leading-relaxed font-bold">
                "कलियुग केवल नाम अधारा।<br/>सुमिरि सुमिरि नर उतरहि पारा॥"
              </p>
              <p className="text-orange-600 font-bold text-xs sm:text-sm mb-2">— श्री रामचरितमानस</p>
              <div className="w-10 h-0.5 bg-orange-300 mx-auto rounded-full mb-2"></div>
              <p className="text-stone-600 italic text-xs sm:text-sm">
                कलियुग में केवल श्री सीताराम नाम ही जीवन को भवसागर से पार लगाने वाला है।
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 max-w-md mx-auto">
              <Link to="/join" className="w-full sm:w-auto bg-orange-600 text-white px-6 sm:px-8 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-orange-600/20 hover:bg-orange-700 hover:-translate-y-0.5 transition-all text-center min-h-[44px] flex items-center justify-center">
                JOIN HARI PATHSHALA
              </Link>
              <Link to="/about" className="w-full sm:w-auto bg-white border border-stone-200 text-stone-800 px-6 sm:px-8 py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-stone-50 hover:-translate-y-0.5 transition-all shadow-xs text-center min-h-[44px] flex items-center justify-center">
                ABOUT US
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section className="py-10 sm:py-14 md:py-16 bg-stone-900 text-white relative overflow-hidden border-y-4 border-orange-500">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/mandala-pattern.png')]"></div>
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center gap-4 sm:gap-6 mb-4 text-orange-400 font-bold tracking-widest text-[11px] sm:text-xs uppercase">
              <span>Est. 2020</span>
              <span>•</span>
              <span>Vrindavan</span>
              <span>•</span>
              <span>Digital Gurukul</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Hari Pathshala</h2>
            <h3 className="text-base sm:text-lg text-orange-400 mb-6 font-serif">ज्ञान • भक्ति • संस्कार</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left bg-white/10 backdrop-blur-md p-5 sm:p-8 rounded-2xl md:rounded-3xl border border-white/20 shadow-xl mb-8">
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                  <span className="font-bold text-white">Hari Pathshala</span> एक ऐसा Modern Spiritual Learning Platform है जहाँ Sanatana Dharma की दिव्य शिक्षाओं को modern और easy तरीके से सिखाई जाती हैं।
                </p>
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                  यहाँ आप Bhagavad Gita, Sanskrit, Shlokas, Mantra Chanting, Daily Sadhana, Bhakti Yoga और Vedic Wisdom को step-by-step सीख सकते हैं।
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                  हमारा उद्देश्य केवल knowledge देना नहीं, बल्कि students और spiritual seekers के जीवन में discipline, positivity, devotion और inner peace लाना है।
                </p>
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                  Hari Pathshala एक spiritual community है जहाँ ancient wisdom और modern life का सुंदर संगम होता है।
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm md:text-base font-bold text-white mb-6">
              Join thousands of seekers and begin your spiritual journey today 🙏
            </p>

            <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-5 sm:p-6 rounded-2xl max-w-3xl mx-auto shadow-lg">
              <p className="text-xs sm:text-sm md:text-base font-bold text-white mb-2 leading-relaxed">
                Hari Pathshala: सभी spiritual classes, Bhagavad Gita learning, Sanskrit, Shlokas, Daily Sadhana और Vedic Wisdom sessions पूरी तरह FREE हैं 🙏
              </p>
              <div className="inline-block bg-white text-orange-700 px-4 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] sm:text-xs mt-1 shadow-sm">
                कोई Registration Fees, Hidden Charges या Paid Membership नहीं है।
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. FOUNDER SECTION */}
      <section className="py-10 sm:py-14 md:py-16 bg-orange-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative w-full max-w-xs sm:max-w-sm mx-auto lg:mx-0"
            >
              <div className="bg-white p-2 rounded-3xl shadow-xl relative z-10 border border-orange-100">
                <div className="aspect-[3/4] bg-orange-100 rounded-2xl overflow-hidden relative group">
                  <FounderImage 
                    src={founderPhoto} 
                    alt={`${founderName} - ${founderTitle}`} 
                    className="w-full h-full object-cover"
                    containerClassName="relative w-full h-full overflow-hidden"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-900/80 via-orange-900/20 to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-5 left-5 text-white z-20 pointer-events-none">
                    <h3 className="font-serif text-lg sm:text-xl font-bold mb-0.5">{founderName}</h3>
                    <p className="text-orange-300 font-medium text-xs">{founderTitle}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4 text-center lg:text-left"
            >
              <div className="inline-block bg-orange-100 text-orange-800 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Founder Message
              </div>
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-stone-900">
                {appName} में आपका स्वागत है।
              </h2>
              <div className="w-12 h-1 bg-orange-500 rounded-full mx-auto lg:mx-0"></div>
              
              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {founderMessage}
              </div>
              <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-bold bg-orange-100/50 p-4 rounded-xl border border-orange-200">
                Spiritual learning, devotion और inner peace को modern life के साथ जोड़ना ही {appName} का मुख्य लक्ष्य है।
              </p>
              <div className="pt-2">
                <Link to="/founder" className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700">
                  <span>Read full bio & vision</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DEVOTEE EXPERIENCES SECTION */}
      <section className="py-10 sm:py-14 md:py-16 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <div className="inline-block bg-orange-100 text-orange-800 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            Testimonials
          </div>
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 mb-2">🙏 हरि पाठशाला से जुड़े साधकों के अनुभव</h2>
          <div className="w-12 h-1 bg-orange-500 rounded-full mx-auto mb-3"></div>
          <p className="text-stone-600 max-w-2xl mx-auto text-xs sm:text-sm">राम नाम, भक्ति और सत्संग ने हजारों लोगों के जीवन में सकारात्मक परिवर्तन लाया है।</p>
        </div>
        
        <div className="flex w-[200%] md:w-max animate-scroll">
          {[
            "Hari Pathshala ने मुझे दैनिक गीता पाठ की प्रेरणा दी।",
            "राम नाम जप से मेरे जीवन में शांति आई।",
            "यह केवल learning platform नहीं बल्कि एक आध्यात्मिक परिवार है।",
            "Daily Sadhana ने जीवन में अनुशासन लाया।",
            "रामचरितमानस की सरल व्याख्या बहुत उपयोगी लगी।",
            "Bhagavad Gita के पाठ ने सोचने का दृष्टिकोण बदल दिया।",
            "यहाँ ज्ञान और भक्ति दोनों का सुंदर संगम है।",
            "Hari Naam Sankirtan से भगवान के प्रति प्रेम बढ़ा।",
            "सत्संग ने मेरे जीवन की सभी उलझनों को सुलझा दिया।",
            "संस्कृत के श्लोकों का उच्चारण अब मेरे लिए बहुत सरल हो गया है।",
            "इस परिवार से जुड़कर जीवन में सकारात्मकता और आनंद की अनुभूति हुई है।",
            "रामचरितमानस के पाठ से मन को असीम शांति मिलती है।"
          ].map((text, i) => (
            <div key={i} className="w-[260px] sm:w-[300px] shrink-0 mx-3 bg-orange-50/50 p-5 rounded-2xl shadow-xs border border-orange-100 hover:shadow-md transition-shadow relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold text-sm">
                  {String.fromCharCode(65 + (i % 26))}
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-xs">Spiritual Seeker</h4>
                  <p className="text-stone-500 text-[10px]">Hari Pathshala Community</p>
                </div>
              </div>
              <p className="text-stone-700 italic text-xs sm:text-sm leading-relaxed relative z-10">"{text}"</p>
              <div className="flex gap-0.5 text-orange-400 mt-3">
                {[...Array(5)].map((_, j) => <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>)}
              </div>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-324px * 6)); }
          }
          .animate-scroll {
            animation: scroll 25s linear infinite;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
          @media (max-width: 768px) {
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(calc(-284px * 6)); }
            }
          }
        `}</style>
      </section>

      {/* 4. MISSION SECTION */}
      <section className="py-10 sm:py-14 md:py-16 bg-white text-center border-t border-stone-100">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block bg-orange-100 p-3 rounded-2xl text-orange-600 mb-4">
              <Target className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 mb-2">
              Hari Pathshala • श्री राम शरणम्
            </h2>
            <div className="w-16 h-1 bg-orange-300 mx-auto rounded-full mb-6"></div>
            
            <p className="text-xs sm:text-sm md:text-base text-stone-700 leading-relaxed mb-4 font-medium">
              Hari Pathshala का अर्थ है — भगवान श्री राम, श्री हरि और सनातन धर्म की शरण में आकर ज्ञान, भक्ति, संस्कार और आत्मिक शांति को प्राप्त करना।
            </p>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              यह केवल एक learning platform नहीं, बल्कि एक spiritual परिवार है जहाँ Bhagavad Gita, Ramcharitmanas, Sanskrit, Shlokas, Bhakti और Vedic Wisdom को सरल रूप में सिखाया जाता है।
            </p>
          </motion.div>
        </div>
      </section>

      {/* 5. RAMCHARITMANAS DOHA SECTION */}
      <section className="py-10 sm:py-14 md:py-16 bg-stone-900 text-orange-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/mandala-pattern.png')]"></div>
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
           <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-lg p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xl border border-white/20"
           >
             <div className="mx-auto w-12 h-12 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mb-4 border border-orange-500/30">
               <BookHeart className="w-6 h-6" />
             </div>
             <h3 className="font-hindi text-base sm:text-xl md:text-2xl text-white mb-4 leading-relaxed drop-shadow-xs font-bold">
               श्रीगुरु चरन सरोज रज,<br/>निज मन मुकुर सुधारि।<br/>
               बरनउँ रघुवर बिमल जसु,<br/>जो दायक फल चारि॥
             </h3>
             <div className="w-16 h-0.5 bg-orange-500 mx-auto rounded-full mb-4"></div>
             <p className="text-orange-200 text-xs sm:text-sm italic font-light tracking-wide max-w-xl mx-auto leading-relaxed">
               गुरु चरणों की धूल से अपने मन रूपी दर्पण को शुद्ध करके, मैं श्री राम के निर्मल यश का वर्णन करता हूँ जो धर्म, अर्थ, काम और मोक्ष प्रदान करता है।
             </p>
           </motion.div>
        </div>
      </section>

      {/* 6. FEATURES SECTION */}
      <section className="py-10 sm:py-14 md:py-16 bg-transparent relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-orange-100 text-orange-800 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              Key Pillars
            </div>
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 mb-2">Pillars of Sanatana Dharma</h2>
            <div className="w-12 h-1 bg-orange-500 rounded-full mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center"
              >
                <div className="inline-block p-3 rounded-2xl bg-orange-50 text-orange-600 mb-4 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-serif text-base sm:text-lg text-stone-900 font-bold mb-2">{feature.title}</h3>
                <p className="text-stone-600 leading-relaxed text-xs sm:text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. RAM NAAM MAHIMA */}
      <section className="py-10 sm:py-14 md:py-16 bg-orange-100/70 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-hindi text-base sm:text-xl md:text-2xl font-bold text-orange-950 mb-4 leading-relaxed">
              राम नाम मणि दीप धरु,<br/>जीह देहरी द्वार।<br/>
              तुलसी भीतर बाहेरहुँ,<br/>जौं चाहसि उजियार॥
            </h2>
            <div className="w-12 h-1 bg-orange-400 mx-auto rounded-full mb-4"></div>
            <p className="text-xs sm:text-sm text-orange-900 font-medium leading-relaxed italic max-w-xl mx-auto">
              तुलसीदास जी कहते हैं कि यदि जीवन में प्रकाश चाहिए, तो अपनी जिह्वा रूपी द्वार पर राम नाम का दीपक जलाए रखें।
            </p>
          </motion.div>
        </div>
      </section>

      {/* 8. WHO IS THIS FOR */}
      <section className="py-10 sm:py-14 md:py-16 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-stone-50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xs"
          >
            <div className="inline-block bg-orange-100 text-orange-800 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              Audience
            </div>
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 mb-4">Who is this for?</h2>
            <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed max-w-2xl mx-auto">
              <p>
                Hari Pathshala उन सभी <span className="font-bold text-stone-900">seekers, students और devotees</span> के लिए है जो अपने जीवन में spiritual growth, inner peace, devotion और Sanatana Dharma के ज्ञान को अपनाना चाहते हैं।
              </p>
              <p className="font-bold text-orange-800 text-sm sm:text-base">
                यदि आप Bhagavad Gita, Ramcharitmanas, Sanskrit, Shlokas, Daily Sadhana, Bhakti और Vedic Wisdom सीखना चाहते हैं तो Hari Pathshala आपके लिए एक perfect spiritual family है।
              </p>
              <div className="inline-block bg-orange-100 px-4 py-1.5 rounded-full text-orange-900 font-bold text-xs mt-2 shadow-xs">
                यहाँ age, background या experience की कोई सीमा नहीं है।
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 9. SPIRITUAL JOURNEY SECTION */}
      <section className="py-10 sm:py-14 md:py-16 bg-stone-900 text-white text-center relative overflow-hidden border-y-4 border-orange-500">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1604502042188-4395669527ec?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <p className="font-hindi text-base sm:text-xl md:text-2xl text-orange-400 mb-4 leading-relaxed drop-shadow-sm font-bold">
              राम रामेति रामेति रमे रामे मनोरमे।<br/>
              सहस्रनाम तत् तुल्यं रामनाम वरानने॥
            </p>
            <div className="w-16 h-0.5 bg-orange-500 mx-auto rounded-full mb-4"></div>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed mb-4 font-light max-w-xl mx-auto">
              भगवान शिव माता पार्वती से कहते हैं कि केवल <span className="font-bold text-white tracking-wide">“राम”</span> नाम का जाप करना विष्णु सहस्रनाम के समान फलदायी है।
            </p>
            <p className="text-sm sm:text-base font-serif font-bold text-white drop-shadow-sm">
              श्री राम नाम ही भक्ति, शांति और मोक्ष का मार्ग है।
            </p>
          </motion.div>
        </div>
      </section>

      {/* 10. WHAT YOU WILL LEARN */}
      <section className="py-10 sm:py-14 md:py-16 bg-orange-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-orange-100 text-orange-800 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              Curriculum
            </div>
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 mb-2">What You Will Learn</h2>
            <div className="w-12 h-1 bg-orange-500 rounded-full mx-auto"></div>
          </div>
            
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
            {learningTopics.map((topic, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-stone-100 flex items-center justify-center text-center hover:shadow-md transition-all hover:-translate-y-0.5 group"
              >
                <span className="font-serif font-bold text-xs sm:text-sm md:text-base text-stone-800 group-hover:text-orange-600 transition-colors">{topic}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. CTA SECTION */}
      <section className="py-12 sm:py-16 bg-white text-center relative overflow-hidden border-t border-stone-100">
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 mb-3 leading-tight">
              अपने जीवन को Spirituality, Peace और Bhakti से जोड़िए
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mb-4 leading-relaxed max-w-xl mx-auto">
              Hari Pathshala का उद्देश्य हर व्यक्ति को श्री राम नाम, Bhagavad Gita, Ramcharitmanas और Sanatana Dharma की divine wisdom से जोड़ना है।
            </p>
            <p className="text-xs sm:text-sm text-stone-800 font-bold mb-6 leading-relaxed bg-orange-50 p-4 rounded-2xl inline-block shadow-xs border border-orange-100 max-w-lg">
              यहाँ आपको केवल ज्ञान नहीं, बल्कि inner peace, devotion, discipline और जीवन का सही मार्ग प्राप्त होगा।
            </p>
            <div>
              <Link to="/join" className="inline-flex items-center justify-center gap-2 bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-orange-600/20 hover:bg-orange-700 hover:scale-[1.02] transition-all min-h-[44px]">
                <span>JOIN HARI PATHSHALA NOW</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 13. CONTACT SECTION */}
      <section className="py-10 sm:py-14 md:py-16 bg-stone-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-white/10 text-orange-400 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-white/10">
            Get In Touch
          </div>
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold mb-8">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white/10 p-5 sm:p-6 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all text-center">
              <MapPin className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold mb-1">मुख्य स्थान</h3>
              <p className="text-stone-300 text-xs sm:text-sm">{address}</p>
            </div>
            <div className="bg-white/10 p-5 sm:p-6 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all text-center">
              <Phone className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold mb-1">संपर्क नंबर</h3>
              <p className="text-stone-300 text-xs sm:text-sm">{contactPhone}</p>
            </div>
            <div className="bg-white/10 p-5 sm:p-6 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all text-center">
              <Mail className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold mb-1">Email</h3>
              <p className="text-stone-300 text-xs sm:text-sm">{contactEmail}</p>
            </div>
          </div>
        </div>
      </section>

      <NewsletterSection />
    </div>
  );
}
