import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { db, Product, addToCart } from '../lib/db';
import SmartImage from './SmartImage';

export default function HomeProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial products
    const initialProducts = db.getProducts();
    if (initialProducts.length > 0) {
      setProducts(initialProducts);
      setLoading(false);
    }

    // Subscribe to products
    const unsubscribe = db.subscribe('products', (updatedProducts) => {
      setProducts(updatedProducts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    navigate('/checkout');
  };

  // Requirement: Hide section completely if no products in database
  if (!loading && products.length === 0) {
    return null;
  }

  // Display up to 4 products total
  const displayProducts = products.slice(0, 4);

  return (
    <section className="pt-5 pb-8 sm:pt-10 sm:pb-16 bg-stone-50 border-y border-stone-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-orange-100 text-orange-800 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 sm:mb-3 border border-orange-200">
            <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
            <span>Spiritual Store</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-stone-900 tracking-tight">
            Sacred Books & Divine Sadhana Items
          </h2>
          <p className="mt-1.5 sm:mt-3 text-stone-600 text-xs sm:text-base max-w-2xl mx-auto">
            Authentic Srimad Bhagavad Gita, Tulsi Japa Malas, Pure Copper Items & Spiritual Essentials.
          </p>
        </div>

        {/* Skeleton Loaders */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div 
                key={n} 
                className={`bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-3 sm:p-4 shadow-sm animate-pulse space-y-3 ${
                  n > 2 ? 'hidden sm:block' : ''
                }`}
              >
                <div className="w-full aspect-square bg-stone-200 rounded-xl" />
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-200 rounded w-1/2" />
                <div className="h-8 bg-stone-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          /* Mobile: Strictly 2 products per row (grid-cols-2), Desktop: 4 per row */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {displayProducts.map((product, idx) => {
              const discount = product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;

              // Hide 3rd and 4th products on mobile so strictly 2 products show on mobile Home Page
              const isHiddenOnMobile = idx >= 2;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`group bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-0.5 ${
                    isHiddenOnMobile ? 'hidden sm:flex' : 'flex'
                  }`}
                >
                  {/* Image Container */}
                  <Link to={`/store/product/${product.id}`} className="block relative aspect-square bg-stone-100 overflow-hidden">
                    <SmartImage
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-orange-600 text-white text-[9px] sm:text-[11px] font-black px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-sm uppercase tracking-wider">
                        {discount}% OFF
                      </span>
                    )}
                  </Link>

                  {/* Details Container */}
                  <div className="p-2.5 sm:p-5 flex flex-col flex-grow justify-between">
                    <div>
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-1 sm:mb-2">
                        <div className="flex items-center text-amber-500">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-400 stroke-amber-500" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-stone-700">
                          {product.rating || 5.0}
                        </span>
                        {product.reviewsCount !== undefined && (
                          <span className="text-[10px] sm:text-xs text-stone-400">
                            ({product.reviewsCount})
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      <Link to={`/store/product/${product.id}`}>
                        <h3 className="font-serif font-bold text-stone-900 text-xs sm:text-lg leading-tight sm:leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                    </div>

                    {/* Price and Buy Button */}
                    <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm sm:text-xl font-extrabold text-stone-900">
                            ₹{product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleBuyNow(e, product)}
                        className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                      >
                        <span>Buy Now</span>
                        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* View All Products Button */}
        <div className="mt-8 sm:mt-12 text-center flex flex-col items-center">
          <Link
            to="/store"
            className="group inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-xs sm:text-base shadow-md hover:shadow-xl transition-all duration-300 transform active:scale-95"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-2 text-[11px] sm:text-xs text-stone-500 font-medium">
            Explore our full catalog of spiritual literature, japa malas, and deity worship items
          </p>
        </div>

      </div>
    </section>
  );
}

