/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Star, Heart, Share2, ShoppingCart, 
  Check, CheckCircle, ShieldCheck, Truck, Sparkles, MessageSquare, Send
} from 'lucide-react';
import { 
  db, Product, addToCart, getWishlist, subscribeToWishlist, toggleWishlist 
} from '../lib/db';
import SEO from '../components/SEO';
import ImageWithFallback from '../components/ImageWithFallback';
import { useAuth } from '../lib/auth';

export default function ProductDetails() {
  const { currentUser } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(getWishlist());
  
  // Interaction States
  const [quantity, setQuantity] = useState(1);
  const [isCopied, setIsCopied] = useState(false);
  const [addedNotify, setAddedNotify] = useState(false);
  
  // Reviews form states
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Subscribe to updates for this product and general collection
  useEffect(() => {
    if (!id) return;

    const unsubProducts = db.subscribe('products', (data) => {
      const found = data.find(p => p.id === id);
      if (found) {
        setProduct(found);
        setRelatedProducts(data.filter(p => p.id !== id).slice(0, 3));
      } else {
        setProduct(null);
      }
    });

    const unsubWishlist = subscribeToWishlist((updatedWishlist) => {
      setWishlist(updatedWishlist);
    });

    return () => {
      unsubProducts();
      unsubWishlist();
    };
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center py-20 px-4">
        <SEO title="Product Not Found" description="The requested product was not found." url="/store" />
        <ShoppingBag className="w-16 h-16 text-stone-300 mb-4" />
        <h2 className="font-serif text-2xl font-bold text-stone-800 mb-2">Item Not Found</h2>
        <p className="text-stone-500 mb-6 text-center max-w-sm">The product you are looking for does not exist or has been removed from our listings.</p>
        <Link to="/store" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all">
          Go Back to Store
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedNotify(true);
    setTimeout(() => setAddedNotify(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    if (currentUser) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    db.addReview(product.id, reviewName, reviewRating, reviewComment);
    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 md:py-20 overflow-hidden">
      <SEO 
        title={`${product.name} | Hari Pathshala Store`}
        description={product.description}
        url={`/store/product/${product.id}`}
      />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link to="/store" className="inline-flex items-center gap-2 text-stone-500 hover:text-orange-600 transition-colors mb-8 font-medium text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Spiritual Store</span>
        </Link>

        {/* Main Product Column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 bg-white rounded-[32px] border border-stone-100 shadow-xl p-6 sm:p-8 md:p-12 mb-16">
          
          {/* Column 1: Image Showcase */}
          <div className="space-y-6">
            <div className="aspect-[4/3] bg-stone-50 border border-stone-100 rounded-[24px] overflow-hidden relative shadow-inner">
              <ImageWithFallback 
                src={product.image} 
                alt={product.name}
                priority={true}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-stone-500 hover:text-red-500 transition-all ${isWishlisted ? 'text-red-500 scale-105' : ''}`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
              </button>
            </div>

            {/* Quality Seals */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-stone-50 border border-stone-100 p-3.5 rounded-2xl text-center">
                <ShieldCheck className="w-5 h-5 text-orange-600 mx-auto mb-1.5" />
                <p className="text-[10px] font-black uppercase tracking-wider text-stone-800">100% Pure</p>
                <p className="text-[10px] text-stone-500 mt-0.5">Authentic Sourcing</p>
              </div>
              <div className="bg-stone-50 border border-stone-100 p-3.5 rounded-2xl text-center">
                <Truck className="w-5 h-5 text-orange-600 mx-auto mb-1.5" />
                <p className="text-[10px] font-black uppercase tracking-wider text-stone-800">Fast Shipping</p>
                <p className="text-[10px] text-stone-500 mt-0.5">Secure Packing</p>
              </div>
              <div className="bg-stone-50 border border-stone-100 p-3.5 rounded-2xl text-center">
                <Sparkles className="w-5 h-5 text-orange-600 mx-auto mb-1.5" />
                <p className="text-[10px] font-black uppercase tracking-wider text-stone-800">Blessed</p>
                <p className="text-[10px] text-stone-500 mt-0.5">Spiritual Vibrations</p>
              </div>
            </div>
          </div>

          {/* Column 2: Product Content */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="inline-block bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                {product.category}
              </div>

              <h1 className="font-serif text-[clamp(1.75rem,4vw,2.5rem)] leading-tight font-black text-stone-950 mb-2">
                {product.name}
              </h1>

              {product.hindiName && (
                <p className="font-hindi text-lg md:text-xl text-orange-600 font-bold mb-4">
                  {product.hindiName}
                </p>
              )}

              {/* Rating and review counts */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-stone-300'}`} 
                    />
                  ))}
                </div>
                <span className="font-bold text-stone-700 text-sm">{product.rating}</span>
                <span className="text-stone-300 text-sm">•</span>
                <span className="text-stone-500 text-sm">{product.reviewsCount} verified user reviews</span>
              </div>

              <p className="text-stone-600 text-base leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Key Highlights */}
              <div className="mb-8 space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 mb-3">Key Product Features:</h4>
                {product.details.map((detail, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start text-stone-600 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Buying Action Section */}
            <div className="border-t border-stone-100 pt-6 mt-6">
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-stone-400 text-sm font-semibold uppercase">Pricing:</span>
                <span className="text-3xl font-black text-stone-950">₹{product.price}</span>
                <span className="text-stone-400 text-xs"> (inclusive of all service charges)</span>
              </div>

              {/* Counter and CTA rows */}
              <div className="flex flex-wrap gap-4 items-center">
                {/* Quantity adjuster */}
                <div className="flex items-center bg-stone-50 border border-stone-200 rounded-2xl px-2 py-1">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-stone-900 text-sm">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Main Action buttons */}
                <div className="flex flex-1 gap-3 min-w-[200px]">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-white border-2 border-orange-500 hover:bg-orange-50 text-orange-600 font-bold py-3.5 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-md shadow-orange-100 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                  >
                    <span>Buy Now</span>
                  </button>
                </div>

                {/* Share Link button */}
                <button 
                  onClick={handleShare}
                  className="w-12 h-12 bg-stone-50 border border-stone-200 rounded-2xl hover:bg-stone-100 text-stone-600 transition-colors flex items-center justify-center relative cursor-pointer"
                  title="Share Link"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-600 animate-bounce" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Added to cart notification toast */}
              <AnimatePresence>
                {addedNotify && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 bg-emerald-50 text-emerald-800 border border-emerald-100 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Success! {quantity} item(s) added to your shopping cart basket.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          
          {/* Review List Columns */}
          <div className="lg:col-span-2 bg-white rounded-[28px] border border-stone-100 shadow-lg p-6 sm:p-8">
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
              <MessageSquare className="text-orange-500 w-5 h-5" />
              <span>Verified Customer Feedback</span>
            </h3>

            {product.reviews.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <p className="text-sm">No reviews submitted yet for this spiritual item. Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-stone-100">
                {product.reviews.map((rev) => (
                  <div key={rev.id} className="pt-5 first:pt-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-stone-800 text-sm">{rev.userName}</p>
                      <span className="text-[10px] text-stone-400 font-medium">{rev.date}</span>
                    </div>
                    
                    <div className="flex text-amber-400 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400' : 'text-stone-200'}`} 
                        />
                      ))}
                    </div>

                    <p className="text-stone-600 text-sm leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leave a review Form Column */}
          <div className="lg:col-span-1 bg-white rounded-[28px] border border-stone-100 shadow-lg p-6 sm:p-8 h-fit">
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
              <Sparkles className="text-orange-500 w-4 h-4" />
              <span>Submit Review</span>
            </h3>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Your Name</label>
                <input 
                  type="text" 
                  required
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="e.g. Meera Devi"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setReviewRating(stars)}
                      className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star className={`w-6 h-6 ${stars <= reviewRating ? 'fill-amber-400' : 'text-stone-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Your Commentary</label>
                <textarea 
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How does this item support your spiritual chanting/sadhana?"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-stone-800"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-stone-900 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Review</span>
              </button>

              <AnimatePresence>
                {reviewSuccess && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-[11px] font-semibold text-center mt-3"
                  >
                    Thank you! Your review has been submitted successfully.
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-8 text-center">Suggested Related items</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((prod) => (
                <div key={prod.id} className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      referrerPolicy="no-referrer"
                      className="w-full aspect-[4/3] object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-serif font-bold text-stone-800 text-sm line-clamp-1">{prod.name}</h4>
                    <p className="text-orange-600 font-bold text-xs mt-1">₹{prod.price}</p>
                  </div>
                  <Link 
                    to={`/store/product/${prod.id}`}
                    className="block text-center bg-stone-50 hover:bg-orange-50 text-stone-700 hover:text-orange-600 font-bold text-xs py-2 rounded-xl border border-stone-200 hover:border-orange-200 mt-3 transition-colors"
                  >
                    View Details
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

// Small missing icon import patch
function ShoppingBag(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  );
}
