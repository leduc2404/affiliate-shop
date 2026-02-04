'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronDown, ChevronLeft, ChevronRight, Filter, X, Sparkles, Tag, SlidersHorizontal, Package } from 'lucide-react';
import ProductCard from './ProductCard';
import SearchBox from './SearchBox';
import { Product } from '@/types';

// Price filter options
const PRICE_OPTIONS = [
  { label: 'Tất cả', value: 0 },
  { label: 'Dưới 100K', value: 100000 },
  { label: '100K - 300K', value: 300000 },
  { label: '300K - 500K', value: 500000 },
  { label: 'Trên 500K', value: 999999999 },
];

// Calculate columns based on screen width
function getColumnsForWidth(width: number): number {
  if (width >= 1280) return 5; // xl
  if (width >= 1024) return 4; // lg
  if (width >= 640) return 3;  // sm
  return 2; // mobile
}

interface ProductSectionProps {
  products: Product[];
  loading: boolean;
}

export default function ProductSection({ products, loading }: ProductSectionProps) {
  const [displayCount, setDisplayCount] = useState(20);
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [priceFilter, setPriceFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryPage, setCategoryPage] = useState(0);
  
  // Mobile responsive states
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  
  // Infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Calculate initial display count based on screen size
  useEffect(() => {
    const calculateInitialCount = () => {
      const width = window.innerWidth;
      const cols = getColumnsForWidth(width);
      // Show enough rows to fill screen + extra for scroll
      const rows = Math.ceil(window.innerHeight / 280) + 2;
      const initialCount = cols * rows;
      setDisplayCount(initialCount);
      setIsDesktop(width >= 1024);
    };
    
    calculateInitialCount();
    window.addEventListener('resize', calculateInitialCount);
    return () => window.removeEventListener('resize', calculateInitialCount);
  }, []);

  // Infinite scroll with IntersectionObserver
  const loadMore = useCallback(() => {
    if (isLoadingMore) return;
    
    const cols = getColumnsForWidth(window.innerWidth);
    const increment = cols * 2; // Load 2 more rows
    
    setIsLoadingMore(true);
    // Small delay for smooth loading feel
    setTimeout(() => {
      setDisplayCount(prev => prev + increment);
      setIsLoadingMore(false);
    }, 100);
  }, [isLoadingMore]);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.phan_loai).filter(Boolean))];
    return ['Tất cả', ...cats];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const priceStr = p.price_low || '0';
      const price = parseInt(priceStr.replace(/,/g, '')) || 0;
      
      const passesCategory = categoryFilter === 'Tất cả' || p.phan_loai === categoryFilter;
      
      // Search filter
      let passesSearch = true;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        passesSearch = p.title.toLowerCase().includes(query) ||
                       p.phan_loai?.toLowerCase().includes(query);
      }
      
      let passesPrice = true;
      if (priceFilter === 100000) {
        passesPrice = price < 100000;
      } else if (priceFilter === 300000) {
        passesPrice = price >= 100000 && price < 300000;
      } else if (priceFilter === 500000) {
        passesPrice = price >= 300000 && price < 500000;
      } else if (priceFilter === 999999999) {
        passesPrice = price >= 500000;
      }
      
      return passesCategory && passesPrice && passesSearch;
    });
  }, [products, categoryFilter, priceFilter, searchQuery]);

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    // Reset display count for new filter
    const cols = getColumnsForWidth(window.innerWidth);
    const rows = Math.ceil(window.innerHeight / 280) + 2;
    setDisplayCount(cols * rows);
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Reset display count for new search
    const cols = getColumnsForWidth(window.innerWidth);
    const rows = Math.ceil(window.innerHeight / 280) + 2;
    setDisplayCount(cols * rows);
  }, []);

  const clearAllFilters = () => {
    setPriceFilter(0);
    setCategoryFilter('Tất cả');
    setSearchQuery('');
  };

  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;
  const hasActiveFilters = priceFilter !== 0 || categoryFilter !== 'Tất cả' || searchQuery !== '';

  // Need to track hasMore in a ref to avoid stale closure in IntersectionObserver
  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, isLoadingMore, filteredProducts.length]);

  // Category pagination
  const CATS_PER_PAGE = 6;
  const maxPage = Math.max(0, Math.ceil(categories.length / CATS_PER_PAGE) - 1);
  const visibleCategories = categories.slice(categoryPage * CATS_PER_PAGE, (categoryPage + 1) * CATS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10 text-orange-500" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center gap-2 text-gray-500"
        >
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span>Đang tải sản phẩm...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tet-themed Header with Search */}
      <div className="relative rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 p-4 md:p-6">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Cherry blossom pattern */}
          <div className="absolute top-2 left-4 text-2xl animate-pulse">🌸</div>
          <div className="absolute top-4 left-20 text-xl opacity-80">🌸</div>
          <div className="absolute top-1 right-8 text-2xl animate-pulse delay-100">🌸</div>
          <div className="absolute bottom-2 right-20 text-xl opacity-80">🌸</div>
          
          {/* Lanterns */}
          <div className="absolute top-0 left-1/4 text-3xl">🏮</div>
          <div className="absolute top-0 right-1/4 text-3xl">🏮</div>
          
          {/* Gold coins decoration */}
          <div className="absolute bottom-1 left-10 text-xl opacity-70">🧧</div>
          <div className="absolute bottom-2 right-12 text-xl opacity-70">🧧</div>
          
          {/* Sparkle overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,215,0,0.15)_0%,transparent_50%)]"></div>
        </div>
        
        <div className="relative z-10">
          {/* Tet greeting */}
          <div className="text-center mb-3">
            <span className="text-yellow-200 text-xs font-medium tracking-wider">🎋 CHÚC MỪNG NĂM MỚI 🎋</span>
          </div>
          
          {/* Search Box */}
          <SearchBox 
            products={products} 
            onSearch={handleSearch}
            placeholder="Tìm kiếm sản phẩm..."
          />
          
          {/* Product count */}
          <div className="text-center mt-3">
            <span className="text-white/90 text-xs">
              ✨ {filteredProducts.length} sản phẩm đang giảm giá ✨
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Toggle Buttons */}
      <div className="flex gap-3 lg:hidden">
        <motion.button
          onClick={() => setShowMobileCategories(!showMobileCategories)}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl"
          whileTap={{ scale: 0.98 }}
        >
          <Tag className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-700">Phân loại</span>
          {categoryFilter !== 'Tất cả' && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">1</span>
          )}
          <motion.div animate={{ rotate: showMobileCategories ? 180 : 0 }}>
            <ChevronDown className="w-4 h-4 text-orange-500" />
          </motion.div>
        </motion.button>
        
        <motion.button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl"
          whileTap={{ scale: 0.98 }}
        >
          <SlidersHorizontal className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">Bộ lọc</span>
          {priceFilter !== 0 && (
            <span className="bg-purple-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">1</span>
          )}
          <motion.div animate={{ rotate: showMobileFilters ? 180 : 0 }}>
            <ChevronDown className="w-4 h-4 text-purple-500" />
          </motion.div>
        </motion.button>
      </div>

      {/* Categories - Mobile Collapsible / Desktop Always Visible */}
      <AnimatePresence>
        {(isDesktop || showMobileCategories) && (
          <motion.div
            initial={!isDesktop ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={!isDesktop ? { height: 0, opacity: 0 } : undefined}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                {categoryPage > 0 && (
                  <button
                    onClick={() => setCategoryPage(p => Math.max(0, p - 1))}
                    className="p-1.5 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                )}
                
                <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide">
                  {visibleCategories.map((cat) => (
                    <motion.button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        categoryFilter === cat
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
                
                {categoryPage < maxPage && (
                  <button
                    onClick={() => setCategoryPage(p => Math.min(maxPage, p + 1))}
                    className="p-1.5 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters - Mobile Collapsible / Desktop Always Visible */}
      <AnimatePresence>
        {(isDesktop || showMobileFilters) && (
          <motion.div
            initial={!isDesktop ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={!isDesktop ? { height: 0, opacity: 0 } : undefined}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Lọc theo giá</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {PRICE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPriceFilter(priceFilter === opt.value ? 0 : opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      priceFilter === opt.value
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Đang lọc:</span>
          
          {categoryFilter !== 'Tất cả' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
              <Tag className="w-3 h-3" />
              {categoryFilter}
              <button onClick={() => setCategoryFilter('Tất cả')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {priceFilter !== 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
              <Filter className="w-3 h-3" />
              {PRICE_OPTIONS.find(o => o.value === priceFilter)?.label}
              <button onClick={() => setPriceFilter(0)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          <button
            onClick={clearAllFilters}
            className="text-xs text-gray-500 hover:text-red-500 underline ml-2"
          >
            Xóa tất cả
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
        <AnimatePresence mode="popLayout">
          {displayedProducts.map((product, index) => (
            <ProductCard key={product.product_id} product={product} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-2">Không tìm thấy sản phẩm</p>
          <button
            onClick={clearAllFilters}
            className="text-sm text-orange-600 hover:underline"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div 
          ref={loadMoreRef} 
          className="flex justify-center py-8"
        >
          {isLoadingMore && (
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          )}
        </div>
      )}
    </div>
  );
}
