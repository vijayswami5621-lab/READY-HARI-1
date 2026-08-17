/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Calendar, User, Clock, Share2, Copy, Check, BookOpen, BookMarked, Sparkles 
} from 'lucide-react';
import { db, Blog } from '../lib/db';
import SEO from '../components/SEO';

export default function BlogDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const unsubBlogs = db.subscribe('blogs', (data) => {
      const found = data.find(b => b.slug === slug);
      if (found) {
        setBlog(found);
        setRelatedBlogs(data.filter(b => b.slug !== slug).slice(0, 3));
      } else {
        setBlog(null);
      }
    });

    return () => {
      unsubBlogs();
    };
  }, [slug]);

  if (!blog) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center py-20 px-4">
        <SEO title="Article Not Found | Hari Pathshala" description="The requested spiritual article was not found." url="/blog" />
        <BookOpen className="w-16 h-16 text-stone-300 mb-4" />
        <h2 className="font-serif text-2xl font-bold text-stone-800 mb-2">Article Not Found</h2>
        <p className="text-stone-500 mb-6 text-center max-w-sm">The article you are trying to read does not exist, is saved as a draft, or has been removed.</p>
        <Link to="/blog" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all">
          Go back to Blogs
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const coverImageUrl = blog.coverImage || blog.imageUrl || 'https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=1200';
  const authorName = blog.author || 'Hari Pathshala';
  const displayCategory = blog.category || 'सनातन धर्म';
  const displayReadingTime = blog.readingTime || '5 min read';

  // Article Schema
  const articleSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.summary,
    "image": coverImageUrl,
    "author": {
      "@type": "Organization",
      "name": "Hari Pathshala"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Hari Pathshala",
      "logo": {
        "@type": "ImageObject",
        "url": "https://haripathshala.online/logo.png"
      }
    },
    "datePublished": blog.publishDate,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://haripathshala.online/blog/${blog.slug}`
    }
  });

  return (
    <div className="min-h-screen bg-stone-50 py-8 md:py-16 overflow-hidden">
      <SEO 
        title={`${blog.title} | Hari Pathshala`}
        description={blog.summary || `${blog.title} - पढ़ें हरि पाठशाला पर सनातन धर्म एवं अध्यात्म का पावन लेख।`}
        url={`/blog/${blog.slug}`}
        schema={articleSchema}
      />

      <div className="w-full max-w-[850px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/blog" className="inline-flex items-center gap-2 text-stone-600 hover:text-orange-600 transition-colors font-bold text-sm bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-2xs">
            <ArrowLeft className="w-4 h-4" />
            <span>लेख सूची पर लौटें</span>
          </Link>

          {/* Quick Share Link */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-all text-xs font-bold shadow-sm cursor-pointer active:scale-95"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Share2 className="w-3.5 h-3.5 text-white" />}
            <span>{isCopied ? 'Link Copied!' : 'Copy Article Link'}</span>
          </button>
        </div>

        {/* Main Article Container */}
        <article className="bg-white rounded-[28px] border border-stone-200/80 shadow-md overflow-hidden mb-12">
          
          {/* Article Header Details */}
          <div className="p-6 sm:p-10 md:p-12 pb-6 border-b border-stone-100">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-block bg-orange-100 text-orange-800 font-bold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-orange-200">
                {displayCategory}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl leading-tight md:leading-snug font-black text-stone-950 mb-6">
              {blog.title}
            </h1>

            {/* Author & Publish Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-stone-500 text-xs sm:text-sm pt-4 border-t border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shadow-sm text-sm shrink-0">
                  {authorName[0]}
                </div>
                <div>
                  <p className="text-stone-900 font-bold leading-tight">{authorName}</p>
                  <p className="text-[11px] text-stone-400">Hari Pathshala Editorial</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-stone-500 font-medium text-xs">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-orange-500" /> {blog.publishDate}</span>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-orange-500" /> {displayReadingTime}</span>
              </div>
            </div>
          </div>

          {/* Hero Cover Image */}
          <div className="w-full aspect-[16/9] max-h-[420px] bg-stone-100 overflow-hidden relative border-b border-stone-100">
            <img 
              src={coverImageUrl} 
              alt={blog.title} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=1200';
              }}
            />
          </div>

          {/* Parsed Rich Markdown Content */}
          <div className="p-6 sm:p-10 md:p-12 text-stone-800 text-base md:text-[18px] leading-[1.85] font-hindi">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="font-serif text-2xl md:text-3xl font-black text-stone-950 mt-8 mb-4 border-b-2 border-orange-200 pb-2 leading-snug">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-serif text-xl md:text-2xl font-bold text-stone-900 mt-8 mb-3 leading-snug text-orange-950">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-serif text-lg md:text-xl font-bold text-stone-850 mt-6 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-stone-800 text-base md:text-[18px] leading-[1.85] mb-5 font-hindi">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-stone-950 bg-orange-50/60 px-1 rounded">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-stone-900 font-medium">{children}</em>
                ),
                blockquote: ({ children }) => (
                  <div className="my-6 pl-5 pr-4 py-4 border-l-4 border-orange-500 bg-orange-50/60 rounded-r-2xl text-stone-850 italic font-serif text-base sm:text-lg leading-relaxed shadow-2xs">
                    {children}
                  </div>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 mb-6 text-stone-800 pl-2">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-6 text-stone-800 pl-2">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="mb-1.5 leading-relaxed font-hindi">{children}</li>
                ),
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeText = String(children).replace(/\n$/, '');
                  const isSanskrit = match?.[1] === 'sanskrit' || match?.[1] === 'shloka' || codeText.includes('॥') || codeText.includes('||');

                  if (isSanskrit || (!inline && codeText.length > 5)) {
                    return (
                      <div className="my-8 p-6 sm:p-8 bg-gradient-to-br from-amber-50 via-orange-50/80 to-amber-100/70 border-2 border-amber-300 rounded-[24px] shadow-sm text-center relative overflow-hidden">
                        <div className="text-orange-600 text-2xl mb-2 flex justify-center items-center gap-2">
                          <span>🪔</span>
                        </div>
                        <p className="font-hindi text-xl sm:text-2xl font-bold text-amber-950 leading-relaxed tracking-wide drop-shadow-2xs whitespace-pre-line">
                          {codeText}
                        </p>
                        <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4 rounded-full" />
                      </div>
                    );
                  }
                  return (
                    <code className="bg-amber-100/80 text-amber-900 font-mono text-sm px-2 py-0.5 rounded border border-amber-200" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {blog.content}
            </ReactMarkdown>

            {/* Scripture References Widget */}
            {blog.scriptureReferences && blog.scriptureReferences.length > 0 && (
              <div className="mt-10 bg-orange-50/60 p-6 sm:p-8 rounded-[24px] border border-orange-200/80 relative overflow-hidden">
                <div className="absolute right-4 bottom-4 text-orange-200/50 text-7xl select-none font-bold pointer-events-none">📜</div>
                <div className="relative z-10">
                  <h4 className="font-serif text-stone-900 font-bold text-base mb-3 flex items-center gap-2">
                    <BookMarked className="text-orange-600 w-5 h-5" />
                    <span>शास्त्र सन्दर्भ एवं प्रमाण (Scripture References)</span>
                  </h4>
                  <ul className="space-y-2">
                    {blog.scriptureReferences.map((ref, idx) => (
                      <li key={idx} className="flex gap-2 items-start text-sm text-stone-800">
                        <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span className="font-medium">{ref}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Article Footer CTA */}
            <div className="mt-12 pt-8 border-t border-stone-200 text-center bg-stone-50 p-6 rounded-2xl border border-stone-200">
              <p className="font-serif text-lg font-bold text-stone-900 mb-2">
                श्री सीताराम - हरि पाठशाला
              </p>
              <p className="text-xs text-stone-600 mb-4 max-w-md mx-auto">
                यदि आपको यह लेख ज्ञानवर्धक एवं प्रेरणादायी लगा, तो इसे अपने मित्रों एवं परिजनों के साथ साझा करें।
              </p>
              <button
                onClick={handleShare}
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{isCopied ? 'Link Copied!' : 'Share Article Link'}</span>
              </button>
            </div>

          </div>

        </article>

        {/* Related Blogs section */}
        {relatedBlogs.length > 0 && (
          <div className="pt-8 border-t border-stone-200">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-6 text-center">
              अन्य पावन लेख (Suggested Spiritual Reading)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <img 
                      src={b.coverImage || b.imageUrl || 'https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=1200'} 
                      alt={b.title} 
                      referrerPolicy="no-referrer"
                      className="w-full aspect-[16/10] object-cover rounded-xl mb-4"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=1200';
                      }}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">{b.category || 'Spiritual'}</span>
                    <h4 className="font-serif font-bold text-stone-900 text-sm mt-3 line-clamp-2 leading-snug">{b.title}</h4>
                  </div>
                  <Link 
                    to={`/blog/${b.slug}`}
                    className="block text-center bg-stone-50 hover:bg-orange-600 text-stone-700 hover:text-white font-bold text-xs py-2.5 rounded-xl border border-stone-200 hover:border-orange-600 mt-4 transition-colors"
                  >
                    Read Article
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
