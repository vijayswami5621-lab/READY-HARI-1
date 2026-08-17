import { motion } from 'motion/react';
import { BookOpen, Sunrise, Compass, Sparkles, Feather, Shield, Heart } from 'lucide-react';
import SEO from '../components/SEO';

export default function Sanskrit() {
  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How to learn Sanskrit online for free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Join Hari Pathshala's online classes to learn Sanskrit pronunciation, grammar, and shlokas for free."
        }
      },
      {
        "@type": "Question",
        "name": "Why is Sanskrit called Devabhasha?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sanskrit is known as the language of the Gods. All major Hindu scriptures, including Vedas and Gita, are written in it."
        }
      }
    ]
  });

  return (
    <div className="flex flex-col w-full min-h-screen bg-transparent overflow-hidden">
      <SEO 
        title="Learn Sanskrit Online Free | Devabhasha Classes"
        description="संस्कृत भाषा सीखें - देवभाषा। Hari Pathshala में निःशुल्क ऑनलाइन संस्कृत कक्षाएं, श्लोक उच्चारण और व्याकरण सीखें।"
        keywords="Sanskrit Learning, Sanskrit Classes, Learn Sanskrit online free, Devabhasha, Shloka Learning"
        url="/sanskrit"
        schema={faqSchema}
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Sanskrit Learning", item: "/sanskrit" }
        ]}
      />
      <div className="bg-red-950 text-white py-10 sm:py-14 text-center px-4 relative overflow-hidden border-b-4 border-orange-500">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1590845947376-28be3e6e5eb1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-red-950 to-transparent"></div>
        <div className="relative z-10 w-full max-w-4xl mx-auto px-2">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <Sunrise className="mx-auto text-orange-400 mb-3 w-8 h-8 sm:w-10 sm:h-10" />
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white drop-shadow-md">Sanskrit Learning</h1>
            <p className="text-sm sm:text-base text-orange-300 font-hindi tracking-widest drop-shadow-xs mb-3">संस्कृत भाषा शिक्षण</p>
            <p className="text-xs sm:text-sm text-stone-300 font-light max-w-2xl mx-auto leading-relaxed px-4">
              The Language of the Gods (Devabhasha). Connect directly with ancient scriptures, mantras, and the pure sound vibrations of Sanatana Dharma.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        <div className="space-y-8">
          
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-2">संस्कृत क्यों सीखें? (Why Learn Sanskrit?)</h2>
            <div className="w-12 h-1 bg-red-400 mx-auto rounded-full mb-4"></div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-2xl mx-auto">
              संस्कृत (Sanskrit) विश्व की सबसे प्राचीन और वैज्ञानिक भाषा है। इसे 'देवभाषा' अर्थात् देवताओं की भाषा कहा गया है। हमारे सभी वेद, पुराण, उपनिषद, भगवद्गीता, रामायण और महाभारत मूल रूप से संस्कृत में ही रचे गए हैं।
            </p>
          </div>

          <div className="bg-red-50/60 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-red-100 shadow-xs relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Sparkles className="text-red-500 w-4 h-4 shrink-0" /> 
                <span>सुभाषितम् (Subhashitam - Words of Wisdom)</span>
              </h3>
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xs mb-4 border border-stone-100">
                <p className="font-hindi text-base sm:text-lg md:text-xl text-center text-red-800 leading-relaxed mb-4 font-bold">
                  विद्या ददाति विनयम्, विनयाद् याति पात्रताम्।<br/>
                  पात्रत्वात् धनमाप्नोति, धनात् धर्मं ततः सुखम्॥
                </p>
                <div className="w-10 h-0.5 bg-red-200 mx-auto rounded-full mb-4"></div>
                <p className="text-stone-800 font-bold mb-1 text-xs sm:text-sm">Hindi Meaning:</p>
                <p className="text-stone-600 mb-4 text-xs sm:text-sm leading-relaxed">
                  विद्या विनय (नम्रता) देती है, विनय से पात्रता (योग्यता) आती है, योग्यता से धन प्राप्त होता है, धन से धर्म होता है, और धर्म से सुख प्राप्त होता है।
                </p>
                <p className="text-stone-800 font-bold mb-1 text-xs sm:text-sm">Spiritual Explanation:</p>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  यह सुभाषित शिक्षा के वास्तविक उद्देश्य को स्पष्ट करता है। सच्ची शिक्षा वह नहीं जो अहंकार बढ़ाए, बल्कि वह है जो मनुष्य को विनम्र बनाए।
                </p>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-stone-200 shadow-xs relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Shield className="text-red-500 w-4 h-4 shrink-0" /> 
                <span>परोपकार का महत्व (Importance of Benevolence)</span>
              </h3>
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xs mb-4 border border-stone-100">
                <p className="font-hindi text-base sm:text-lg md:text-xl text-center text-red-800 leading-relaxed mb-4 font-bold">
                  परोपकाराय फलन्ति वृक्षाः परोपकाराय वहन्ति नद्यः।<br/>
                  परोपकाराय दुहन्ति गावः परोपकारार्थमिदं शरीरम्॥
                </p>
                <div className="w-10 h-0.5 bg-red-200 mx-auto rounded-full mb-4"></div>
                <p className="text-stone-800 font-bold mb-1 text-xs sm:text-sm">Hindi Meaning:</p>
                <p className="text-stone-600 mb-4 text-xs sm:text-sm leading-relaxed">
                  वृक्ष परोपकार के लिए फल देते हैं, नदियाँ परोपकार के लिए बहती हैं, गायें परोपकार के लिए दूध देती हैं, (उसी प्रकार) यह शरीर भी परोपकार के लिए ही है।
                </p>
                <p className="text-stone-800 font-bold mb-1 text-xs sm:text-sm">Spiritual Explanation:</p>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  प्रकृति का हर कण निस्वार्थ भाव से दूसरों की सेवा कर रहा है। यह श्लोक हमें सिखाता है कि मानव जीवन का परम उद्देश्य भी दूसरों की भलाई करना है।
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50/60 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-red-100 shadow-xs relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Heart className="text-red-500 w-4 h-4 shrink-0" /> 
                <span>सत्संगति (The Good Company)</span>
              </h3>
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xs mb-4 border border-stone-100">
                <p className="font-hindi text-base sm:text-lg md:text-xl text-center text-red-800 leading-relaxed mb-4 font-bold">
                  सत्संगतिः कथय किं न करोति पुंसाम्।
                </p>
                <div className="w-10 h-0.5 bg-red-200 mx-auto rounded-full mb-4"></div>
                <p className="text-stone-800 font-bold mb-1 text-xs sm:text-sm">Hindi Meaning:</p>
                <p className="text-stone-600 mb-4 text-xs sm:text-sm leading-relaxed">
                  बताओ, सत्संगति (अच्छे लोगों का साथ) मनुष्य के लिए क्या नहीं करती? (अर्थात् सब कुछ करती है)।
                </p>
                <p className="text-stone-800 font-bold mb-1 text-xs sm:text-sm">Spiritual Explanation:</p>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  अच्छे और आध्यात्मिक लोगों की संगति से हमारी बुद्धि शुद्ध होती है, पाप नष्ट होते हैं, और मन में ईश्वर के प्रति प्रेम जागृत होता है।
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-center border-b-4 border-red-500 shadow-lg">
            <h3 className="font-serif text-lg sm:text-xl font-bold mb-3">हरि पाठशाला में संस्कृत शिक्षण</h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-4 max-w-2xl mx-auto">
              हरि पाठशाला में हम संस्कृत को रटते नहीं हैं, बल्कि उसे अनुभव करते हैं। हम शुरुआत मूलभूत व्याकरण और सरल वाक्यों से करते हैं, और धीरे-धीरे श्लोक उच्चारण और उनके अर्थ की ओर बढ़ते हैं।
            </p>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl mx-auto">
              यहाँ आप सरल संस्कृत संभाषण (Spoken Sanskrit), श्लोक पाठ, और वैदिक मंत्रों का शुद्ध उच्चारण सीखते हैं।
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
