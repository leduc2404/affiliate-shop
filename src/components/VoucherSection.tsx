'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Ticket, ChevronDown, ChevronLeft, ChevronRight, Filter, X, Sparkles, Tag, Percent, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import VoucherCard, { Voucher } from './VoucherCard';

// Filter options
const MIN_ORDER_OPTIONS = [
  { label: 'Tất cả', value: 0, icon: null },
  { label: 'Dưới 100K', value: 100000, icon: null },
  { label: 'Dưới 200K', value: 200000, icon: null },
  { label: 'Dưới 500K', value: 500000, icon: null },
];

const DISCOUNT_OPTIONS = [
  { label: 'Tất cả', value: 0 },
  { label: '10%+', value: 10 },
  { label: '15%+', value: 15 },
  { label: '20%+', value: 20 },
  { label: '30%+', value: 30 },
];

interface VoucherSectionProps {
  vouchers: Voucher[];
  loading: boolean;
}

export default function VoucherSection({ vouchers, loading }: VoucherSectionProps) {
  const [displayCount, setDisplayCount] = useState(9);
  const [minOrderFilter, setMinOrderFilter] = useState(0);
  const [discountFilter, setDiscountFilter] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [categoryPage, setCategoryPage] = useState(0);
  
  // Mobile responsive states
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // Detect screen size for responsive behavior
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };
    
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  const LOAD_INCREMENT = 9;

  // Extract unique categories from vouchers
  const categories = useMemo(() => {
    const cats = [...new Set(vouchers.map(v => v.phan_loai).filter(Boolean))];
    return ['Tất cả', ...cats];
  }, [vouchers]);

  // Extract numeric values for filtering
  const parseMinOrder = (content: string): number => {
    const match = content.match(/tối thiểu\s*([\d,.]+)/i);
    if (match) {
      return parseInt(match[1].replace(/[,.]/g, ''));
    }
    return 0;
  };

  const parseDiscount = (content: string): number => {
    const match = content.match(/Giảm\s*(\d+)%/i);
    return match ? parseInt(match[1]) : 0;
  };

  // Filter vouchers
  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const minOrder = parseMinOrder(v.noi_dung);
      const discount = parseDiscount(v.noi_dung);
      
      const passesCategory = categoryFilter === 'Tất cả' || v.phan_loai === categoryFilter;
      const passesMinOrder = minOrderFilter === 0 || minOrder <= minOrderFilter;
      const passesDiscount = discountFilter === 0 || discount >= discountFilter;
      
      return passesCategory && passesMinOrder && passesDiscount;
    });
  }, [vouchers, categoryFilter, minOrderFilter, discountFilter]);

  const displayedVouchers = filteredVouchers.slice(0, displayCount);
  const hasMore = displayCount < filteredVouchers.length;
  const remainingCount = filteredVouchers.length - displayCount;
  const activeFilters = (minOrderFilter > 0 ? 1 : 0) + (discountFilter > 0 ? 1 : 0);

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + LOAD_INCREMENT, filteredVouchers.length));
  };

  const clearAllFilters = () => {
    setMinOrderFilter(0);
    setDiscountFilter(0);
    setCategoryFilter('Tất cả');
  };

  // Reset display count when category changes
  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    setDisplayCount(9);
  };

  if (loading) {
    return (
      <div className="py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <div className="w-16 h-16 rounded-full border-4 border-green-100 border-t-green-500"></div>
            <Sparkles className="w-6 h-6 text-green-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </motion.div>
          <span className="text-gray-500 font-medium">Đang tải mã giảm giá...</span>
        </div>
      </div>
    );
  }

  if (vouchers.length === 0 && !loading) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-4"
    >
      {/* Hero Header */}
      <div className="relative mb-8 p-6 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl"
            >
              <Ticket className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Mã Giảm Giá HOT 🔥</h1>
              <p className="text-green-100 mt-1">Cập nhật mới nhất mỗi ngày</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <span className="text-white font-bold text-lg">{filteredVouchers.length}</span>
              <span className="text-green-100 ml-1.5 text-sm">mã có sẵn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category & Filters Container */}
      <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden mb-8">
        
        {/* Mobile Toggle Buttons - Only visible on mobile */}
        <div className="lg:hidden p-4 flex gap-3">
          <motion.button
            onClick={() => setShowMobileCategories(!showMobileCategories)}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl font-semibold text-sm transition-all duration-300 ${
              showMobileCategories
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            Phân loại
            {categoryFilter !== 'Tất cả' && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                showMobileCategories ? 'bg-white/20' : 'bg-green-500 text-white'
              }`}>1</span>
            )}
            <motion.div
              animate={{ rotate: showMobileCategories ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
          
          <motion.button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl font-semibold text-sm transition-all duration-300 ${
              showMobileFilters || activeFilters > 0
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Bộ lọc
            {activeFilters > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                showMobileFilters ? 'bg-white/20' : 'bg-purple-500 text-white'
              }`}>{activeFilters}</span>
            )}
            <motion.div
              animate={{ rotate: showMobileFilters ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </div>

        {/* Category Tabs - Desktop always visible, Mobile collapsible */}
        <AnimatePresence>
          {(showMobileCategories || isDesktop) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className={`p-4 border-b border-gray-100 ${showMobileCategories ? 'border-t lg:border-t-0' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <Tag className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-800">Phân loại</span>
                  </div>
                  
                  {/* Navigation arrows */}
                  {categories.length > 8 && (
                    <div className="flex items-center gap-1.5">
                      <motion.button
                        onClick={() => setCategoryPage(prev => Math.max(0, prev - 1))}
                        disabled={categoryPage === 0}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-xl transition-all duration-200 ${
                          categoryPage === 0 
                            ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                            : 'text-gray-600 hover:text-green-600 hover:bg-green-50 bg-gray-100'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </motion.button>
                      
                      <div className="flex gap-1 px-2">
                        {Array.from({ length: Math.ceil(categories.length / 8) }).map((_, i) => (
                          <motion.button
                            key={i}
                            onClick={() => setCategoryPage(i)}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              categoryPage === i 
                                ? 'bg-green-500 w-4' 
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <motion.button
                        onClick={() => setCategoryPage(prev => 
                          Math.min(Math.ceil(categories.length / 8) - 1, prev + 1)
                        )}
                        disabled={(categoryPage + 1) * 8 >= categories.length}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-xl transition-all duration-200 ${
                          (categoryPage + 1) * 8 >= categories.length
                            ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                            : 'text-gray-600 hover:text-green-600 hover:bg-green-50 bg-gray-100'
                        }`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
                
                {/* Category chips */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={categoryPage}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                  >
                    {categories.slice(categoryPage * 8, (categoryPage + 1) * 8).map((cat, idx) => {
                      const isActive = categoryFilter === cat;
                      const count = cat === 'Tất cả' 
                        ? vouchers.length 
                        : vouchers.filter(v => v.phan_loai === cat).length;
                      
                      return (
                        <motion.button
                          key={cat}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04, duration: 0.2 }}
                          onClick={() => handleCategoryChange(cat)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative flex items-center justify-between px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                            isActive
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          <span className="text-sm truncate">{cat}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isActive 
                              ? 'bg-white/25 text-white' 
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {count}
                          </span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters Panel - Desktop always visible, Mobile collapsible */}
        <AnimatePresence>
          {(showMobileFilters || isDesktop) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className={`p-4 bg-gradient-to-b from-gray-50/50 to-white ${showMobileFilters && !showMobileCategories ? 'border-t border-gray-100 lg:border-t-0' : ''}`}>
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Min Order Filter */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700">Đơn tối thiểu</label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {MIN_ORDER_OPTIONS.map(opt => (
                        <motion.button
                          key={opt.value}
                          onClick={() => setMinOrderFilter(opt.value)}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                            minOrderFilter === opt.value
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                              : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50'
                          }`}
                        >
                          {opt.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="hidden lg:block w-px bg-gray-200"></div>

                  {/* Discount Filter */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Percent className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700">Phần trăm giảm</label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {DISCOUNT_OPTIONS.map(opt => (
                        <motion.button
                          key={opt.value}
                          onClick={() => setDiscountFilter(opt.value)}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                            discountFilter === opt.value
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/25'
                              : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50'
                          }`}
                        >
                          {opt.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Active Filters Summary & Clear */}
                <AnimatePresence>
                  {activeFilters > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Filter className="w-4 h-4" />
                        <span>Đang lọc: <strong className="text-gray-700">{filteredVouchers.length}</strong> kết quả</span>
                      </div>
                      <motion.button
                        onClick={clearAllFilters}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Xoá tất cả
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Voucher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {displayedVouchers.map((voucher, index) => (
            <VoucherCard key={voucher.ma + index} voucher={voucher} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredVouchers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Không có mã giảm giá phù hợp</p>
          <button
            onClick={clearAllFilters}
            className="mt-2 text-green-500 text-sm font-medium hover:underline"
          >
            Xoá tất cả bộ lọc
          </button>
        </motion.div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <motion.button
          onClick={loadMore}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full mt-6 py-4 flex items-center justify-center gap-2 text-green-600 font-semibold bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-2xl border border-green-200 transition-all duration-300"
        >
          <ChevronDown className="w-5 h-5" />
          Xem thêm {Math.min(LOAD_INCREMENT, remainingCount)} mã
          <span className="text-gray-400 font-normal">({remainingCount} còn lại)</span>
        </motion.button>
      )}
    </motion.section>
  );
}
