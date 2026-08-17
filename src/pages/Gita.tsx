import { motion } from 'motion/react';
import { BookOpen, Sunrise, Compass, Sparkles, Feather, Shield, Heart } from 'lucide-react';
import SEO from '../components/SEO';

export default function Gita() {
  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How to learn Bhagavad Gita online for free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hari Pathshala offers free daily classes and resources to learn the Bhagavad Gita in Hindi."
        }
      },
      {
        "@type": "Question",
        "name": "Why should I read the Bhagavad Gita?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Bhagavad Gita provides profound wisdom on life, duty, devotion, and finding inner peace."
        }
      }
    ]
  });

  return (
    <div className="flex flex-col w-full min-h-screen bg-transparent overflow-hidden">
      <SEO 
        title="Bhagavad Gita Hindi | Free Gita Shlokas & Meaning"
        description="श्रीमद्भगवद्गीता के श्लोकों का सरल हिंदी अर्थ जानें। Hari Pathshala पर भगवान कृष्ण के उपदेशों को समझें और अपने जीवन को सफल बनाएं।"
        keywords="Bhagavad Gita, Bhagavad Gita Hindi, Bhagavad Gita Learning, Gita Shlokas, Krishna Teachings, How to learn Bhagavad Gita, Best website to learn Bhagavad Gita, Benefits of Bhagavad Gita reading"
        url="/gita"
        schema={faqSchema}
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Bhagavad Gita", item: "/gita" }
        ]}
      />
      <div className="bg-stone-900 text-white py-10 sm:py-14 text-center px-4 relative overflow-hidden border-b-4 border-orange-500">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent"></div>
        <div className="relative z-10 w-full max-w-4xl mx-auto px-2">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <BookOpen className="mx-auto text-orange-400 mb-3 w-8 h-8 sm:w-10 sm:h-10" />
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white drop-shadow-md">Bhagavad Gita</h1>
            <p className="text-sm sm:text-base text-orange-300 font-hindi tracking-widest drop-shadow-xs mb-3">श्रीमद्भगवद्गीता</p>
            <p className="text-xs sm:text-sm text-stone-300 font-light max-w-2xl mx-auto leading-relaxed px-4">
              The Divine Song of God. Discover the timeless wisdom of Lord Krishna, bringing peace, purpose, and spiritual awakening to your daily life.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        <div className="space-y-8">
          
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-2">गीता का सार (Essence of Gita)</h2>
            <div className="w-12 h-1 bg-orange-400 mx-auto rounded-full mb-4"></div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-2xl mx-auto">
              श्रीमद्भगवद्गीता केवल एक ग्रंथ नहीं, बल्कि जीवन जीने की एक पूर्ण कला है। कुरुक्षेत्र के युद्ध के मैदान में जब अर्जुन मोह और अज्ञान से घिर गए थे, तब भगवान श्रीकृष्ण ने उन्हें जो दिव्य ज्ञान दिया, वही भगवद्गीता है। यह हमें धर्म, कर्म, और भक्ति का मार्ग दिखाती है।
            </p>
          </div>

          <div className="bg-orange-50/60 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-orange-100 shadow-xs relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Sparkles className="text-orange-500 w-4 h-4 shrink-0" /> 
                <span>अध्याय २, श्लोक ४७ (Chapter 2, Verse 47)</span>
              </h3>
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xs mb-4 border border-stone-100">
                <p className="font-hindi text-base sm:text-lg md:text-xl text-center text-orange-800 leading-relaxed mb-4 font-bold">
                  कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।<br/>
                  मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥
                </p>
                <div className="w-10 h-0.5 bg-orange-200 mx-auto rounded-full mb-4"></div>
                <p className="text-stone-800 font-bold mb-1 text-xs sm:text-sm">Hindi Meaning:</p>
                <p className="text-stone-600 mb-4 text-xs sm:text-sm leading-relaxed">
                  तुम्हारा अधिकार केवल कर्म करने में है, उसके फलों में कभी नहीं। इसलिए तुम कर्मों के फल का हेतु मत बनो, और तुम्हारी अकर्मण्यता (कर्म न करने) में भी आसक्ति न हो।
                </p>
                <p className="text-stone-800 font-bold mb-1 text-xs sm:text-sm">Spiritual Explanation:</p>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  भगवान श्रीकृष्ण अर्जुन से कहते हैं कि मनुष्य का अधिकार केवल अपने कर्तव्यों का पालन करने में है। फल की चिंता करने से मन अशांत होता है और कार्य की गुणवत्ता पर भी प्रभाव पड़ता है। जब हम निष्काम भाव से भगवान को अर्पण करके कर्म करते हैं, तो वही कर्म 'कर्मयोग' बन जाता है।
                </p>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-stone-200 shadow-xs relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Shield className="text-orange-500 w-4 h-4 shrink-0" /> 
                <span>अध्याय ४, श्लोक ७-८ (Chapter 4, Verses 7-8)</span>
              </h3>
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xs mb-4 border border-stone-100">
                <p className="font-hindi text-base sm:text-lg md:text-xl text-center text-orange-800 leading-relaxed mb-4 font-bold">
                  यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।<br/>
                  अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥<br/><br/>
                  परित्राणाय साधूनां विनाशाय च दुष्कृताम्।<br/>
                  धर्मसंस्थापनार्थाय सम्भवामि युगे युगे॥
                </p>
                <div className="w-10 h-0.5 bg-orange-200 mx-auto rounded-full mb-4"></div>
                <p className="text-stone-800 font-bold mb-1 text-xs sm:text-sm">Hindi Meaning:</p>
                <p className="text-stone-600 mb-4 text-xs sm:text-sm leading-relaxed">
                  हे भारत! जब-जब धर्म की हानि और अधर्म की वृद्धि होती है, तब-तब मैं अपने रूप को रचता हूँ अर्थात् साकार रूप से लोगों के सम्मुख प्रकट होता हूँ। साधु पुरुषों का उद्धार करने के लिए, पाप कर्म करने वालों का विनाश करने के लिए और धर्म की भली-भाँति स्थापना करने के लिए मैं युग-युग में प्रकट हुआ करता हूँ।
                </p>
                <p className="text-stone-800 font-bold mb-1 text-xs sm:text-sm">Spiritual Explanation:</p>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  यह भगवान का अपने भक्तों के प्रति प्रेम और संसार की रक्षा का आश्वासन है। जब समाज में बुराई चरम पर होती है, तब परमात्मा स्वयं अवतार लेकर संतुलन स्थापित करते हैं। यह श्लोक हमें आशा देता है कि सत्य और धर्म की हमेशा विजय होती है।
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50/60 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-orange-100 shadow-xs relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Heart className="text-orange-500 w-4 h-4 shrink-0" /> 
                <span>अध्याय १८, श्लोक ६६ (Chapter 18, Verse 66)</span>
              </h3>
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xs mb-4 border border-stone-100">
                <p className="font-hindi text-base sm:text-lg md:text-xl text-center text-orange-800 leading-relaxed mb-4 font-bold">
                  सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।<br/>
                  अहं त्वा सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥
                </p>
                <div className="w-10 h-0.5 bg-orange-200 mx-auto rounded-full mb-4"></div>
                <p className="text-stone-800 font-bold mb-1 text-xs sm:text-sm">Hindi Meaning:</p>
                <p className="text-stone-600 mb-4 text-xs sm:text-sm leading-relaxed">
                  संपूर्ण धर्मों को अर्थात् संपूर्ण आश्रयों को त्यागकर केवल मेरी ही शरण में आ जा। मैं तुझे संपूर्ण पापों से मुक्त कर दूँगा, तू शोक मत कर।
                </p>
                <p className="text-stone-800 font-bold mb-1 text-xs sm:text-sm">Spiritual Explanation:</p>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  यह गीता का चरम उपदेश (Charama Shloka) है। भगवान कहते हैं कि सब प्रकार के धर्म, कर्त्तव्य और सामाजिक नियमों का आश्रय छोड़कर केवल और केवल भगवान के शरणागत हो जाओ। पूर्ण शरणागति ही भगवत् प्राप्ति का सबसे सरल और श्रेष्ठ मार्ग है।
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-center border-b-4 border-orange-500 shadow-lg">
            <h3 className="font-serif text-lg sm:text-xl font-bold mb-3">हरि पाठशाला में गीता अध्ययन</h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-4 max-w-2xl mx-auto">
              हरि पाठशाला में, हम गीता के श्लोकों का केवल अनुवाद नहीं सीखते, बल्कि उसे अपने जीवन में उतारने का प्रयास करते हैं। हमारे दैनिक जीवन की हर समस्या का समाधान गीता के इन दिव्य श्लोकों में निहित है।
            </p>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl mx-auto">
              आइए, हम सब मिलकर इस ज्ञान गंगा में डुबकी लगाएँ और अपने जीवन को भगवान की भक्ति और सेवा में समर्पित करें।
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
