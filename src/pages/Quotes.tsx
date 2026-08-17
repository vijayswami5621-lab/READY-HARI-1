/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Sparkles, Filter, BookOpen } from 'lucide-react';
import { Quote, db } from '../lib/db';
import SEO from '../components/SEO';
import QuoteCard from '../components/QuoteCard';

export default function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const unsub = db.subscribeToQuotes((data) => {
      setQuotes(data || []);
    });
    return () => unsub();
  }, []);

  // Unique categories
  const categories = ['all', ...Array.from(new Set(quotes.map((q) => q.category || 'General')))];

  // Filtered Quotes
  const filteredQuotes = quotes.filter((q) => {
    const query = searchQuery.toLowerCase();
    const textContent = q.content || q.quote || q.text || '';
    const matchesSearch =
      textContent.toLowerCase().includes(query) ||
      (q.author || '').toLowerCase().includes(query) ||
      (q.source || '').toLowerCase().includes(query) ||
      (q.explanation || '').toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === 'all' || (q.category || 'General').toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const quotesSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "आध्यात्मिक सुविचार एवं अनमोल वचन | Hari Pathshala",
    "description": "श्रीमद्भगवद्गीता, श्रीरामचरितमानस एवं संतों के दिव्य विचार एवं आध्यात्मिक सूक्तियाँ।",
    "url": "https://haripathshala.online/quotes"
  });

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <SEO
        title="आध्यात्मिक सुविचार एवं अनमोल वचन | Hari Pathshala"
        description="श्रीमद्भगवद्गीता, श्रीरामचरितमानस एवं संतों के दिव्य विचार एवं आध्यात्मिक सूक्तियाँ।"
        url="/quotes"
        schema={quotesSchema}
      />

      {/* Hero Header */}
      <section className="bg-stone-900 text-white py-14 px-4 text-center relative overflow-hidden border-b-4 border-orange-500">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/mandala-pattern.png')]" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-orange-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 mb-3 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Hari Pathshala Quotes</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            आध्यात्मिक सुविचार एवं अनमोल वचन
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-medium">
            नित्य जीवन में शांति, भक्ति एवं ज्ञान का संचार करने वाले दिव्य विचार। अपने मित्रों एवं स्वजनों के साथ सुंदर कार्ड रूप में शेयर करें।
          </p>
        </div>
      </section>

      {/* Filters & Content Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        
        {/* Search & Category Filter Bar */}
        <div className="bg-white border border-stone-200 rounded-[24px] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quotes, authors, source..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <Filter className="w-4 h-4 text-stone-400 shrink-0 hidden sm:block" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat === 'all' ? 'All Quotes' : cat}
              </button>
            ))}
          </div>

        </div>

        {/* Quotes Grid */}
        {filteredQuotes.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-[28px] p-12 text-center my-8 shadow-sm">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-stone-800">कोई सुविचार प्राप्त नहीं हुआ</h3>
            <p className="text-xs text-stone-500 mt-1">कृपया अपना खोज शब्द अथवा फ़िल्टर बदलकर पुनः प्रयास करें।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuotes.map((q) => (
              <QuoteCard key={q.id} quote={q} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
