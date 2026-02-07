'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Scale, X, ChevronUp } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';

export default function CompareBar() {
  const { compareList, removeFromCompare, openCompareModal, clearCompare } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl"
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Products preview */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-orange-600 font-semibold">
                <Scale className="w-5 h-5" />
                <span className="hidden sm:inline">So sánh</span>
                <span className="bg-orange-100 px-2 py-0.5 rounded-full text-sm">{compareList.length}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {compareList.slice(0, 4).map((product) => (
                  <div key={product.product_id} className="relative group">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200 group-hover:border-orange-400 transition-colors"
                    />
                    <button
                      onClick={() => removeFromCompare(product.product_id)}
                      className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {compareList.length < 4 && (
                  <div className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                    +{4 - compareList.length}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={clearCompare}
                className="px-3 py-2 text-gray-600 hover:text-red-600 text-sm font-medium transition-colors"
              >
                Xóa
              </button>
              <motion.button
                onClick={openCompareModal}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={compareList.length < 2}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>So sánh ngay</span>
                <ChevronUp className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
