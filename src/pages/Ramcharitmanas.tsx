import { motion } from 'motion/react';
import { BookOpen, Sunrise, Compass, Sparkles, Feather, Shield, Heart } from 'lucide-react';
import SEO from '../components/SEO';

export default function Ramcharitmanas() {
  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How to learn Ramcharitmanas online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Join Hari Pathshala to learn Ramcharitmanas with meaning in a simple and devotional way."
        }
      },
      {
        "@type": "Question",
        "name": "Why is Ramcharitmanas important?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "It teaches ideal behavior, devotion, and the divine pastimes of Lord Shri Ram, written by Goswami Tulsidas."
        }
      }
    ]
  });

  return (
    <div className="flex flex-col w-full min-h-screen bg-transparent overflow-hidden">
      <SEO 
        title="Ramcharitmanas Hindi | Learn Chaupai & Doha Meaning"
        description="श्री रामचरितमानस की चौपाइयों और दोहों का सरल हिंदी अर्थ समझें। Hari Pathshala पर भगवान राम की महिमा का गुणगान करें।"
        keywords="Ramcharitmanas, Ramcharitmanas Hindi, Ramcharitmanas Doha, Ramcharitmanas Chaupai, Ram Naam, Ramcharitmanas with Hindi meaning"
        url="/ramcharitmanas"
        schema={faqSchema}
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Ramcharitmanas", item: "/ramcharitmanas" }
        ]}
      />
      <div className="bg-orange-950 text-white py-10 sm:py-14 text-center px-4 relative overflow-hidden border-b-4 border-amber-500">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1621360841013-c76831f13b19?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-orange-950 to-transparent"></div>
        <div className="relative z-10 w-full max-w-4xl mx-auto px-2">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <Feather className="mx-auto text-amber-400 mb-3 w-8 h-8 sm:w-10 sm:h-10" />
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white drop-shadow-md">Ramcharitmanas</h1>
            <p className="text-sm sm:text-base text-amber-300 font-hindi tracking-widest drop-shadow-xs mb-3">श्री रामचरितमानस</p>
            <p className="text-xs sm:text-sm text-stone-300 font-light max-w-2xl mx-auto leading-relaxed px-4">
              The Ocean of Sri Rama's Deeds. Dive into the devotional masterpiece by Goswami Tulsidas that brings the supreme ideals of Sanatana Dharma to life.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        <div className="space-y-8">
          
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-2">रामचरितमानस का महत्व (Significance)</h2>
            <div className="w-12 h-1 bg-amber-400 mx-auto rounded-full mb-4"></div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-2xl mx-auto">
              गोस्वामी तुलसीदास जी द्वारा रचित श्री रामचरितमानस केवल एक काव्य नहीं, बल्कि भारतीय संस्कृति और भक्ति का प्राण है। यह ग्रंथ हमें एक आदर्श पुत्र, आदर्श भाई, आदर्श मित्र, और आदर्श राजा की परिभाषा सिखाता है।
            </p>
          </div>

          <div className="bg-amber-50/60 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-amber-100 shadow-xs relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Sparkles className="text-amber-500 w-4 h-4 shrink-0" /> 
                <span>बालकाण्ड – वंदना (Balkand - Invocation)</span>
              </h3>
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xs mb-4 border border-stone-100">
                <p className="font-hindi text-base sm:text-lg md:text-xl text-center text-amber-800 leading-relaxed mb-4 font-bold">
                  वर्णानामर्थसंघानां रसानां छन्दसामपि।<br/>
                  मङ्गलानां च कर्त्तारौ वन्दे वाणीविनायकौ॥
                </p>
                <div className="w-10 h-0.5 bg-amber-200 mx-auto rounded-full mb-4"></div>
                <p className="text-stone-800 font-bold mb-1 text-xs sm:text-sm">Hindi Meaning:</p>
                <p className="text-stone-600 mb-4 text-xs sm:text-sm leading-relaxed">
                  अक्षरों, अर्थों के समूहों, रसों, छन्दों और मंगलों को करने वाले सरस्वती जी और गणेश जी की मैं वंदना करता हूँ।
                </p>
                <p className="text-stone-800 font-bold mb-1 text-xs sm:text-sm">Spiritual Explanation:</p>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  तुलसीदास जी अपने महाकाव्य का प्रारंभ माँ सरस्वती और भगवान गणेश की वंदना से करते हैं। यह हमें सिखाता है कि किसी भी शुभ कार्य को आरंभ करने से पहले परमात्मा का स्मरण आवश्यक है।
                </p>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-stone-200 shadow-xs relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Shield className="text-amber-500 w-4 h-4 shrink-0" /> 
                <span>बालकाण्ड – शिव-पार्वती संवाद (Balkand - Shiva-Parvati Dialogue)</span>
              </h3>
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xs mb-4 border border-stone-100">
                <p className="font-hindi text-base sm:text-lg md:text-xl text-center text-amber-800 leading-relaxed mb-4 font-bold">
                  राम कथा सुन्दर कर तारी। संसय बिहग उड़ावनिहारी॥<br/>
                  राम कथा कलि बिटप कुठारी। सादर सुनु गिरिराज कुमारी॥
                </p>
                <div className="w-10 h-0.5 bg-amber-200 mx-auto rounded-full mb-4"></div>
                <p className="text-stone-800 font-bold mb-1 text-xs sm:text-sm">Hindi Meaning:</p>
                <p className="text-stone-600 mb-4 text-xs sm:text-sm leading-relaxed">
                  श्री राम की कथा हाथ की सुंदर ताली के समान है, जो संदेह रूपी पक्षियों को उड़ा देती है। श्री राम की कथा कलियुग रूपी वृक्ष को काटने वाली कुल्हाड़ी है।
                </p>
                <p className="text-stone-800 font-bold mb-1 text-xs sm:text-sm">Spiritual Explanation:</p>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  भगवान शिव, माता पार्वती को श्री राम कथा की महिमा सुनाते हुए कहते हैं कि जैसे ताली बजाने से पेड़ पर बैठे पक्षी उड़ जाते हैं, वैसे ही राम कथा सुनने से मन के सारे संशय दूर हो जाते हैं।
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/60 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-amber-100 shadow-xs relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Heart className="text-amber-500 w-4 h-4 shrink-0" /> 
                <span>सुंदरकाण्ड – श्री हनुमान जी की भक्ति (Sundarkand - Devotion of Hanuman)</span>
              </h3>
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xs mb-4 border border-stone-100">
                <p className="font-hindi text-base sm:text-lg md:text-xl text-center text-amber-800 leading-relaxed mb-4 font-bold">
                  प्रबिसि नगर कीजै सब काजा। हृदयँ राखि कोसलपुर राजा॥<br/>
                  गरल सुधा रिपु करहिं मिताई। गोपद सिंधु अनल सितलाई॥
                </p>
                <div className="w-10 h-0.5 bg-amber-200 mx-auto rounded-full mb-4"></div>
                <p className="text-stone-800 font-bold mb-1 text-xs sm:text-sm">Hindi Meaning:</p>
                <p className="text-stone-600 mb-4 text-xs sm:text-sm leading-relaxed">
                  अयोध्या के राजा श्री रघुनाथ जी को हृदय में रखकर नगर में प्रवेश करो और सब कार्य करो। उसके लिए विष अमृत हो जाता है, शत्रु मित्रता करने लगते हैं।
                </p>
                <p className="text-stone-800 font-bold mb-1 text-xs sm:text-sm">Spiritual Explanation:</p>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  यह चौपाई हमें सिखाती है कि यदि हम परमात्मा को हृदय में रखकर कोई कार्य करें, तो असंभव भी संभव हो जाता है।
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-center border-b-4 border-amber-500 shadow-lg">
            <h3 className="font-serif text-lg sm:text-xl font-bold mb-3">हरि पाठशाला में मानस का पाठ</h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-4 max-w-2xl mx-auto">
              हरि पाठशाला में हम रामचरितमानस की चौपाइयों का सस्वर पाठ (Chanting) और उनका गहरा अर्थ सीखते हैं। हम यह प्रयास करते हैं कि भगवान राम के आदर्शों को हम अपने पारिवारिक और सामाजिक जीवन में अपनाएँ।
            </p>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl mx-auto">
              रामचरितमानस एक जीवन शैली है। इसके अध्ययन से मन को असीम शांति मिलती है।
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
