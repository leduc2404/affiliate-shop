'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingCart, Scale } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';

function parsePrice(price: string | undefined): number {
  if (!price) return 0;
  return parseInt(price.replace(/,/g, '').replace(/\./g, '')) || 0;
}

export default function CompareModal() {
  const { compareList, isCompareModalOpen, closeCompareModal, removeFromCompare, clearCompare } = useCompare();

  if (!isCompareModalOpen || compareList.length === 0) return null;

  // Find best values for highlighting
  const prices = compareList.map(p => parsePrice(p.price_low));
  const minPrice = Math.min(...prices);
  const ratings = compareList.map(p => p.rating || 0);
  const maxRating = Math.max(...ratings);

  return (
    <AnimatePresence>
      {isCompareModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-2 sm:p-4"
          onClick={closeCompareModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
                <h3 className="font-bold text-sm sm:text-lg">So sánh ({compareList.length})</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearCompare}
                  className="px-2 py-1 sm:px-3 sm:py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                >
                  Xóa tất cả
                </button>
                <button 
                  onClick={closeCompareModal}
                  className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Compare Content - Scrollable */}
            <div className="overflow-auto max-h-[calc(90vh-60px)]">
              <div className="p-3 sm:p-4">
                {/* Products Grid */}
                <div className={`grid gap-3 sm:gap-4 ${
                  compareList.length === 2 ? 'grid-cols-2' : 
                  compareList.length === 3 ? 'grid-cols-3' : 
                  'grid-cols-2 sm:grid-cols-4'
                }`}>
                  {compareList.map((product) => (
                    <div key={product.product_id} className="bg-gray-50 rounded-xl p-2 sm:p-3 relative">
                      <button
                        onClick={() => removeFromCompare(product.product_id)}
                        className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      
                      <img 
                        src={product.image} 
                        alt={product.title}
                        className="w-full aspect-square object-cover rounded-lg mb-2"
                      />
                      
                      <h4 className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] mb-2">
                        {product.title}
                      </h4>

                      {/* Price */}
                      <div className="mb-2">
                        <p className="text-[10px] text-gray-500">Giá</p>
                        <p className={`text-sm sm:text-lg font-bold ${parsePrice(product.price_low) === minPrice ? 'text-green-600' : 'text-gray-800'}`}>
                          {parsePrice(product.price_low).toLocaleString('vi-VN')}đ
                        </p>
                        {parsePrice(product.price_low) === minPrice && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Rẻ nhất</span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="mb-2">
                        <p className="text-[10px] text-gray-500">Đánh giá</p>
                        <div className="flex items-center gap-1">
                          <Star className={`w-3 h-3 sm:w-4 sm:h-4 ${(product.rating || 0) === maxRating && maxRating > 0 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                          <span className="text-xs sm:text-sm font-semibold">{product.rating || 0}</span>
                        </div>
                      </div>

                      {/* Sold */}
                      <div className="mb-2">
                        <p className="text-[10px] text-gray-500">Đã bán</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-700">{product.sold || '0'}</p>
                      </div>

                      {/* Category */}
                      <div className="mb-3">
                        <p className="text-[10px] text-gray-500">Danh mục</p>
                        <span className="text-[10px] sm:text-xs font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                          {product.phan_loai}
                        </span>
                      </div>

                      {/* Buy Button */}
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 w-full py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium text-xs sm:text-sm hover:opacity-90 transition-opacity"
                      >
                        <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                        Mua
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
