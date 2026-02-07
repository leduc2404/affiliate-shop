'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronDown, ChevronLeft, ChevronRight, Filter, X, Sparkles, Tag, SlidersHorizontal, Package, Search, Wand2 } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
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
  const [categoryPage, setCategoryPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [aiSearchEnabled, setAiSearchEnabled] = useState(false);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const [aiIntent, setAiIntent] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Mobile responsive states
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  
  // Infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  }, []);

  const handleAskAI = useCallback((product: Product) => {
    // Open chatbot with product context - dispatch custom event
    window.dispatchEvent(new CustomEvent('openChatWithProduct', { detail: product }));
  }, []);

  // AI Search function
  const performAiSearch = useCallback(async (query: string) => {
    if (!query.trim() || !aiSearchEnabled) return;
    
    setAiSearching(true);
    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      
      const data = await response.json();
      if (data.keywords) {
        setAiKeywords(data.keywords);
        setAiIntent(data.intent || '');
      }
    } catch (error) {
      console.error('AI Search error:', error);
    } finally {
      setAiSearching(false);
    }
  }, [aiSearchEnabled]);

  // Debounce search query for performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      // Reset display count when search changes
      if (searchQuery !== debouncedSearch) {
        const cols = getColumnsForWidth(window.innerWidth);
        const rows = Math.ceil(window.innerHeight / 280) + 2;
        setDisplayCount(cols * rows);
      }
      
      // Trigger AI search if enabled
      if (aiSearchEnabled && searchQuery.trim()) {
        performAiSearch(searchQuery);
      } else {
        setAiKeywords([]);
        setAiIntent('');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, aiSearchEnabled, performAiSearch]);

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

  // Filter products with search, category, and price
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search filter - check title and phan_loai
      let passesSearch = true;
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase().trim();
        const title = (p.title || '').toLowerCase();
        const category = (p.phan_loai || '').toLowerCase();
        
        // If AI search is enabled and has keywords, use them
        if (aiSearchEnabled && aiKeywords.length > 0) {
          passesSearch = aiKeywords.some(keyword => 
            title.includes(keyword.toLowerCase()) || 
            category.includes(keyword.toLowerCase())
          );
        } else {
          // Regular search
          passesSearch = title.includes(query) || category.includes(query);
        }
      }
      
      const priceStr = p.price_low || '0';
      const price = parseInt(priceStr.replace(/,/g, '')) || 0;
      
      const passesCategory = categoryFilter === 'Tất cả' || p.phan_loai === categoryFilter;
      
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
      
      return passesSearch && passesCategory && passesPrice;
    });
  }, [products, categoryFilter, priceFilter, debouncedSearch, aiSearchEnabled, aiKeywords]);

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    // Reset display count for new filter
    const cols = getColumnsForWidth(window.innerWidth);
    const rows = Math.ceil(window.innerHeight / 280) + 2;
    setDisplayCount(cols * rows);
  };

  const clearAllFilters = () => {
    setPriceFilter(0);
    setCategoryFilter('Tất cả');
    setSearchQuery('');
    setDebouncedSearch('');
    setAiKeywords([]);
    setAiIntent('');
  };

  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;
  const hasActiveFilters = priceFilter !== 0 || categoryFilter !== 'Tất cả' || debouncedSearch !== '';

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
      {/* Search Bar with AI Toggle */}
      <div className="relative">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute left-4 flex items-center pointer-events-none">
              {aiSearching ? (
                <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
              ) : aiSearchEnabled ? (
                <Wand2 className="w-5 h-5 text-purple-500" />
              ) : (
                <Search className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={aiSearchEnabled ? "Tìm thông minh: mặc gì đi biển..." : "Tìm kiếm sản phẩm..."}
              className={`w-full pl-12 pr-12 py-3.5 bg-white border-2 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200 shadow-sm hover:shadow-md ${
                aiSearchEnabled 
                  ? 'border-purple-300 focus:border-purple-400 focus:ring-purple-100' 
                  : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setAiKeywords([]);
                  setAiIntent('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-4 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
          
          {/* AI Search Toggle */}
          <motion.button
            onClick={() => {
              setAiSearchEnabled(!aiSearchEnabled);
              if (!aiSearchEnabled && searchQuery.trim()) {
                performAiSearch(searchQuery);
              } else {
                setAiKeywords([]);
                setAiIntent('');
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl font-medium transition-all whitespace-nowrap ${
              aiSearchEnabled 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30' 
                : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600'
            }`}
          >
            <Wand2 className="w-5 h-5" />
            <span className="hidden sm:inline">AI</span>
          </motion.button>
        </div>
        
        {/* Search results count / AI Intent */}
        {debouncedSearch && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center gap-2 text-sm flex-wrap"
          >
            {aiSearchEnabled && aiIntent ? (
              <>
                <Wand2 className="w-4 h-4 text-purple-500" />
                <span className="text-purple-600 font-medium">AI hiểu: {aiIntent}</span>
                <span className="text-gray-400">•</span>
              </>
            ) : (
              <Sparkles className="w-4 h-4 text-orange-500" />
            )}
            <span className="text-gray-600">
              Tìm thấy <span className="font-semibold text-orange-600">{filteredProducts.length}</span> sản phẩm
              {!aiSearchEnabled && ` cho "${debouncedSearch}"`}
            </span>
            
            {/* AI Keywords Display */}
            {aiSearchEnabled && aiKeywords.length > 0 && (
              <div className="flex gap-1 flex-wrap mt-1 w-full">
                {aiKeywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
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
            <ProductCard key={product.product_id} product={product} index={index} onProductClick={handleProductClick} onAskAI={handleAskAI} />
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

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onAskAI={handleAskAI}
      />
    </div>
  );
}
