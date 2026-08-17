/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Search, Filter, Star, Heart, Share2, X, 
  ShoppingCart, Plus, Minus, Trash2, Check, ArrowRight, Sparkles 
} from 'lucide-react';
import { 
  db, Product, addToCart, getCart, subscribeToCart, 
  updateCartQuantity, removeFromCart, clearCart,
  getWishlist, subscribeToWishlist, toggleWishlist 
} from '../lib/db';
import SEO from '../components/SEO';
import SmartImage from '../components/SmartImage';
import { useAuth } from '../lib/auth';

export default function Store() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  
  // Shopping Cart & Wishlist state
  const [cartItems, setCartItems] = useState(getCart());
  const [wishlist, setWishlist] = useState<string[]>(getWishlist());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Subscribe to realtime database and cart
  useEffect(() => {
    const unsubProducts = db.subscribe('products', (data) => {
      setProducts(data);
    });

    const unsubCart = subscribeToCart((updatedCart) => {
      setCartItems(updatedCart);
    });

    const unsubWishlist = subscribeToWishlist((updatedWishlist) => {
      setWishlist(updatedWishlist);
    });

    return () => {
      unsubProducts();
      unsubCart();
      unsubWishlist();
    };
  }, []);

  // Filter & Search logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                          (product.hindiName && product.hindiName.includes(search)) ||
                          product.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // featured/default
  });

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const handleShare = (productId: string, productName: string) => {
    const url = `${window.location.origin}/store/product/${productId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(productId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col w-full min-h-screen bg-stone-50 overflow-hidden">
      <SEO 
        title="Hari Pathshala Spiritual Store | Japa Mala, Gita, Ramcharitmanas"
        description="हरि पाठशाला आध्यात्मिक स्टोर। यहाँ से आप प्रामाणिक तुलसी जप माला, श्रीमद्भगवद्गीता, श्रीरामचरितमानस एवं अन्य साधना सामग्री प्राप्त कर सकते हैं।"
        url="/store"
      />

      {/* Header Banner */}
      <div className="bg-orange-950 text-white py-16 md:py-24 text-center px-4 relative overflow-hidden border-b-4 border-orange-500">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/mandala-pattern.png')]"></div>
        <div className="relative z-10 w-full max-w-5xl mx-auto px-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ShoppingBag className="mx-auto text-orange-400 mb-4 w-10 h-10 md:w-12 md:h-12" />
            <h1 className="font-serif text-[clamp(2.25rem,5vw,4rem)] leading-tight font-bold mb-4 text-white drop-shadow-lg">
              Spiritual Store
            </h1>
            <p className="text-[clamp(1.1rem,3.5vw,1.35rem)] text-orange-300 font-hindi tracking-widest drop-shadow-md mb-4">
              हरि पाठशाला आध्यात्मिक भंडार
            </p>
            <p className="text-sm md:text-lg text-stone-300 font-light max-w-2xl mx-auto leading-relaxed px-4">
              Carefully curated scriptures and pure Sadhana utilities to support your spiritual practice and inner growth.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Store Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        
        {/* Search, Filter & Cart Trigger Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search scriptures, malas, diyas..."
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

          {/* Sort & Cart buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2 bg-white px-3 py-2 border border-stone-200 rounded-2xl shadow-sm text-sm">
              <span className="text-stone-500">Sort:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none font-medium text-stone-800 cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Cart Trigger Link */}
            <Link 
              to="/cart"
              className="relative flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 flex"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">My Cart</span>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-md border-2 border-white"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none scroll-smooth">
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
              {cat === 'All' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/50 border border-dashed border-stone-200 rounded-[32px] px-4">
            <ShoppingBag className="mx-auto text-stone-300 w-16 h-16 mb-4" />
            <h3 className="font-serif text-xl font-bold text-stone-700 mb-2">No Products Found</h3>
            <p className="text-stone-500 text-sm max-w-sm mx-auto">We couldn't find any products matching your search or category selection. Try a different query!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const isWishlisted = wishlist.includes(product.id);
                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group bg-white rounded-[24px] border border-stone-100 shadow-sm hover:shadow-md hover:border-orange-200 overflow-hidden flex flex-col transition-all relative"
                  >
                    
                    {/* Product Image Wrapper */}
                    <div className="aspect-[4/3] bg-stone-100 overflow-hidden relative">
                      <SmartImage 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      {/* Floating actions */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <button 
                          onClick={() => toggleWishlist(product.id)}
                          className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center text-stone-500 hover:text-red-500 transition-colors"
                          title="Add to Wishlist"
                        >
                          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                        <button 
                          onClick={() => handleShare(product.id, product.name)}
                          className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center text-stone-500 hover:text-orange-500 transition-colors relative"
                          title="Share Product"
                        >
                          {copiedId === product.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-5 flex-grow flex flex-col">
                      <div className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">
                        {product.category}
                      </div>
                      
                      <Link to={`/store/product/${product.id}`} className="hover:text-orange-600 transition-colors block">
                        <h3 className="font-serif font-bold text-stone-800 text-lg leading-tight mb-1 group-hover:text-orange-600">
                          {product.name}
                        </h3>
                      </Link>
                      
                      {product.hindiName && (
                        <p className="font-hindi text-stone-500 text-sm mb-3">
                          {product.hindiName}
                        </p>
                      )}

                      {/* Rating & Review Summary */}
                      <div className="flex items-center gap-1.5 mb-4">
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-stone-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-stone-600">{product.rating}</span>
                        <span className="text-stone-300 text-xs">•</span>
                        <span className="text-xs text-stone-400">{product.reviewsCount} reviews</span>
                      </div>

                      {/* Price & Action Row */}
                      <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          <p className="text-stone-400 text-[10px] uppercase font-bold tracking-wider leading-none">Price</p>
                          <p className="text-xl font-black text-stone-950 mt-1">₹{product.price}</p>
                        </div>

                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => addToCart(product, 1)}
                            className="bg-stone-50 hover:bg-orange-50 text-stone-800 hover:text-orange-600 p-2.5 rounded-xl border border-stone-200 hover:border-orange-200 transition-colors cursor-pointer"
                            title="Add to Cart"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addToCart(product, 1);
                              if (currentUser) {
                                navigate('/checkout');
                              } else {
                                navigate('/login', { state: { from: '/checkout' } });
                              }
                            }}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer hover:scale-[1.02]"
                          >
                            <span>Buy Now</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>


    </div>
  );
}
