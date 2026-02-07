'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, ShoppingBag, Trash2, Plus, Minus, ExternalLink } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

function parsePrice(price: string | undefined): number {
  if (!price) return 0;
  return parseInt(price.replace(/,/g, '').replace(/\./g, '')) || 0;
}

export default function CartSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();

  return (
    <>
      {/* Cart Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-1/2 translate-y-8 right-0 z-40 bg-gradient-to-l from-orange-500 to-red-500 text-white p-3 rounded-l-xl shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <motion.span
              key={cartCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-white text-orange-500 rounded-full text-xs font-bold flex items-center justify-center"
            >
              {cartCount > 99 ? '99+' : cartCount}
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
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  <h2 className="font-bold text-lg">Giỏ hàng ({cartCount})</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <ShoppingBag className="w-16 h-16 mb-4" />
                    <p className="text-lg font-medium">Giỏ hàng trống</p>
                    <p className="text-sm">Thêm sản phẩm vào giỏ nhé!</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-3">
                    <AnimatePresence mode="popLayout">
                      {cart.map((item) => (
                        <motion.div
                          key={item.product_id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 100, scale: 0.9 }}
                          className="bg-gray-50 rounded-xl p-3 flex gap-3"
                        >
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-800 line-clamp-2">{item.title}</h4>
                            <p className="text-base font-bold text-red-600 mt-1">
                              {parsePrice(item.price_low).toLocaleString('vi-VN')}đ
                            </p>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200">
                                <button
                                  onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                  className="p-1.5 hover:bg-gray-100 rounded-l-lg transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                  className="p-1.5 hover:bg-gray-100 rounded-r-lg transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.product_id)}
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
              {cart.length > 0 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Tổng cộng:</span>
                    <motion.span 
                      key={cartTotal}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-xl font-bold text-red-600"
                    >
                      {cartTotal.toLocaleString('vi-VN')}đ
                    </motion.span>
                  </div>
                  
                  {/* Checkout - Opens all product links */}
                  <div className="flex gap-2">
                    <button
                      onClick={clearCart}
                      className="px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors"
                    >
                      Xóa tất cả
                    </button>
                    <button
                      onClick={() => {
                        // Open all product links
                        cart.forEach(item => {
                          window.open(item.link, '_blank');
                        });
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Mua tất cả
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
