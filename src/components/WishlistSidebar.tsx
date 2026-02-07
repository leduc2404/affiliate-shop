'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingCart, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

function parsePrice(price: string | undefined): number {
  if (!price) return 0;
  return parseInt(price.replace(/,/g, '').replace(/\./g, '')) || 0;
}

export default function WishlistSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { wishlist, removeFromWishlist, clearWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product: any) => {
    addToCart(product);
    removeFromWishlist(product.product_id);
  };

  return (
    <>
      {/* Wishlist Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-1/2 -translate-y-1/2 right-0 z-40 bg-gradient-to-l from-red-500 to-pink-500 text-white p-3 rounded-l-xl shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="relative">
          <Heart className="w-5 h-5 fill-current" />
          {wishlistCount > 0 && (
            <motion.span
              key={wishlistCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-white text-red-500 rounded-full text-xs font-bold flex items-center justify-center"
            >
              {wishlistCount}
            </motion.span>
          )}
        </div>
      </motion.button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-500 to-pink-500 text-white">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-current" />
                  <h2 className="font-bold text-lg">Yêu thích ({wishlistCount})</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="h-[calc(100vh-140px)] overflow-y-auto">
                {wishlist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <ShoppingBag className="w-16 h-16 mb-4" />
                    <p className="text-lg font-medium">Chưa có sản phẩm</p>
                    <p className="text-sm">Thêm sản phẩm yêu thích nhé!</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-3">
                    <AnimatePresence mode="popLayout">
                      {wishlist.map((product) => (
                        <motion.div
                          key={product.product_id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 100, scale: 0.9 }}
                          className="bg-gray-50 rounded-xl p-3 flex gap-3"
                        >
                          <img 
                            src={product.image} 
                            alt={product.title}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-800 line-clamp-2">{product.title}</h4>
                            <p className="text-base font-bold text-red-600 mt-1">
                              {parsePrice(product.price_low).toLocaleString('vi-VN')}đ
                            </p>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-xs font-medium hover:opacity-90"
                              >
                                <ShoppingCart className="w-3 h-3" />
                                Thêm giỏ
                              </button>
                              <button
                                onClick={() => removeFromWishlist(product.product_id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer */}
              {wishlist.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
                  <button
                    onClick={clearWishlist}
                    className="w-full py-2.5 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors"
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
