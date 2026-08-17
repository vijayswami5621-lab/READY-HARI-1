/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, User, Clock, Search, ArrowRight, BookOpen, Sparkles, X 
} from 'lucide-react';
import { db, Blog } from '../lib/db';
import SEO from '../components/SEO';

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    // Subscribe to realtime changes in our blogs collection
    const unsubBlogs = db.subscribe('blogs', (data) => {
      setBlogs(data);
    });

    return () => {
      unsubBlogs();
    };
  }, []);

  const categories = ['All', ...Array.from(new Set(blogs.map(b => b.category)))];

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(search.toLowerCase()) ||
                          blog.summary.toLowerCase().includes(search.toLowerCase()) ||
                          blog.author.toLowerCase().includes(search.toLowerCase()) ||
                          blog.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Highlight first blog as Featured
  const featuredBlog = filteredBlogs[0];
  const remainingBlogs = filteredBlogs.slice(1);

  return (
    <div className="flex flex-col w-full min-h-screen bg-stone-50 overflow-hidden">
      <SEO 
        title="Spiritual Blog & Articles | Hari Pathshala"
        description="हरि पाठशाला ब्लॉग। सनातन धर्म, गीता रहस्य, राम नाम महिमा, साधना मार्ग एवं संतों के उपदेशों पर गंभीर एवं विचारोत्तेजक लेख।"
        url="/blog"
      />

      {/* Header banner */}
      <div className="bg-stone-900 text-white py-10 sm:py-14 text-center px-4 relative overflow-hidden border-b-4 border-orange-500">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/mandala-pattern.png')]"></div>
        <div className="relative z-10 w-full max-w-4xl mx-auto px-2">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <BookOpen className="mx-auto text-orange-400 mb-3 w-8 h-8 sm:w-10 sm:h-10" />
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white drop-shadow-md">
              Spiritual Blog
            </h1>
            <p className="text-sm sm:text-base text-orange-300 font-hindi tracking-widest drop-shadow-xs mb-3">
              आध्यात्मिक विचार एवं लेख
            </p>
            <p className="text-xs sm:text-sm text-stone-300 font-light max-w-2xl mx-auto leading-relaxed px-4">
              Deep, reflective articles on the Bhagavad Gita, the glory of Ram Naam, practical Sadhana guides, and standard Sanatana theology.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main content container */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        
        {/* Search and Category block */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search articles, wisdom, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-800 transition-all text-sm md:text-base"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-sm text-stone-500 font-medium">
            Showing <strong className="text-stone-800">{filteredBlogs.length}</strong> published articles
          </div>
        </div>

        {/* Categories Row */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-100'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-orange-500 hover:text-orange-600'
              }`}
            >
              {cat === 'All' ? 'All Wisdom' : cat}
            </button>
          ))}
        </div>

        {/* Featured blog presentation (only when there's an article) */}
        {featuredBlog && selectedCategory === 'All' && !search && (
          <div className="mb-16">
            <h2 className="font-serif text-xl font-bold text-stone-850 mb-6 flex items-center gap-1.5 uppercase tracking-wider text-xs font-black">
              <Sparkles className="text-orange-500 w-4 h-4" />
              <span>Featured Reading</span>
            </h2>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-stone-100 rounded-[32px] overflow-hidden shadow-md hover:shadow-xl transition-all group"
            >
              
              {/* Cover Image */}
              <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto overflow-hidden relative">
                <img 
                  src={featuredBlog.coverImage} 
                  alt={featuredBlog.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <span className="bg-orange-600 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                    {featuredBlog.category}
                  </span>
                </div>
              </div>

              {/* Text metadata */}
              <div className="lg:col-span-5 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
                <div>
                  
                  {/* Meta stats */}
                  <div className="flex flex-wrap gap-4 text-xs text-stone-400 mb-4 font-medium">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{featuredBlog.publishDate}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{featuredBlog.readingTime}</span>
                  </div>

                  <Link to={`/blog/${featuredBlog.slug}`} className="block">
                    <h3 className="font-serif text-2xl md:text-3xl font-black text-stone-900 mb-4 hover:text-orange-600 transition-colors leading-tight">
                      {featuredBlog.title}
                    </h3>
                  </Link>

                  <p className="text-stone-600 text-sm leading-relaxed mb-6">
                    {featuredBlog.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                      {featuredBlog.author[0]}
                    </div>
                    <span className="text-xs font-semibold text-stone-700">{featuredBlog.author}</span>
                  </div>

                  <Link 
                    to={`/blog/${featuredBlog.slug}`}
                    className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-bold text-sm"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>

            </motion.div>
          </div>
        )}

        {/* Regular list grid */}
        <div>
          {featuredBlog && selectedCategory === 'All' && !search && (
            <h3 className="font-serif text-xl font-bold text-stone-850 mb-8 border-b border-stone-200 pb-3">More Articles</h3>
          )}

          {filteredBlogs.length === 0 ? (
            <div className="text-center py-20 bg-white/50 border border-dashed border-stone-200 rounded-[32px] px-4">
              <BookOpen className="mx-auto text-stone-300 w-16 h-16 mb-4" />
              <h3 className="font-serif text-xl font-bold text-stone-700 mb-2">No Articles Found</h3>
              <p className="text-stone-500 text-sm max-w-sm mx-auto">We couldn't find any published journals or study materials under this filter. Try another term!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {/* If selected category or search is active, show ALL matching blogs, otherwise show remaining ones */}
                {(selectedCategory !== 'All' || search ? filteredBlogs : remainingBlogs).map((blog) => (
                  <motion.div
                    key={blog.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-md overflow-hidden flex flex-col transition-all group"
                  >
                    
                    {/* Card Image */}
                    <div className="aspect-[16/10] bg-stone-100 overflow-hidden relative">
                      <img 
                        src={blog.coverImage} 
                        alt={blog.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-stone-800 font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-stone-200/50">
                        {blog.category}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        
                        {/* Meta stats */}
                        <div className="flex gap-3 text-[11px] text-stone-400 mb-3.5 font-medium">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{blog.publishDate}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{blog.readingTime}</span>
                        </div>

                        <Link to={`/blog/${blog.slug}`} className="block">
                          <h4 className="font-serif text-lg font-bold text-stone-900 mb-2 hover:text-orange-600 transition-colors leading-snug line-clamp-2">
                            {blog.title}
                          </h4>
                        </Link>

                        <p className="text-stone-500 text-xs leading-relaxed line-clamp-3 mb-6">
                          {blog.summary}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-[10px]">
                            {blog.author[0]}
                          </div>
                          <span className="text-[11px] font-semibold text-stone-600">{blog.author}</span>
                        </div>

                        <Link 
                          to={`/blog/${blog.slug}`}
                          className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold text-xs"
                        >
                          <span>Read</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
