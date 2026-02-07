'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingCart, Heart, Share2, Scale, Bot, Copy, Check, Facebook, Tag, Plus } from 'lucide-react';
import { useState } from 'react';
import { Product } from '@/types';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCompare } from '@/contexts/CompareContext';
import { useCart } from '@/contexts/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAskAI?: (product: Product) => void;
}

function parsePrice(price: string | undefined): number {
  if (!price) return 0;
  return parseInt(price.replace(/,/g, '').replace(/\./g, '')) || 0;
}

function formatSold(sold: string | undefined): string {
  if (!sold) return '0';
  const num = parseInt(sold.replace(/,/g, ''));
  if (num >= 1000) {
    return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}k`;
  }
  return sold;
}

export default function ProductDetailModal({ product, isOpen, onClose, onAskAI }: ProductDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { addToCart, isInCart } = useCart();

  if (!product) return null;

  const priceLow = parsePrice(product.price_low);
  const priceHigh = parsePrice(product.price_high);
  const hasDiscount = priceHigh > priceLow && priceLow > 0;
  const inWishlist = isInWishlist(product.product_id);
  const inCompare = isInCompare(product.product_id);
  const inCart = isInCart(product.product_id);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/products?id=${product.product_id}` 
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'zalo':
        url = `https://zalo.me/share/phone?url=${encodedUrl}`;
        break;
    }
    if (url) window.open(url, '_blank', 'width=600,height=400');
  };

  const handleCompareToggle = () => {
    if (inCompare) {
      removeFromCompare(product.product_id);
    } else {
      addToCompare(product);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Fixed position */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full shadow-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Product Image - Compact */}
            <div className="relative bg-gradient-to-b from-gray-100 to-white p-4 pb-0">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-inner">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Badges on image */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                {hasDiscount && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                    -{Math.round(((priceHigh - priceLow) / priceHigh) * 100)}%
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Category & Rating Row */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs text-orange-600 font-semibold bg-orange-50 px-2.5 py-1 rounded-full">
                  <Tag className="w-3 h-3" />
                  {product.phan_loai}
                </span>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-gray-700">{product.rating || 0}</span>
                  </span>
                  <span>Đã bán {formatSold(product.sold)}</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2">
                {product.title}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-red-500">
                  {priceLow.toLocaleString('vi-VN')}đ
                </span>
                {hasDiscount && (
                  <span className="text-lg text-gray-400 line-through">
                    {priceHigh.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>

              {/* Quick Actions - Compact */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${
                    inWishlist 
                      ? 'bg-red-50 text-red-500 border-2 border-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                  <span className="text-sm">{inWishlist ? 'Đã thích' : 'Yêu thích'}</span>
                </button>

                <button
                  onClick={handleCompareToggle}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${
                    inCompare 
                      ? 'bg-orange-50 text-orange-500 border-2 border-orange-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-500'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span className="text-sm">{inCompare ? 'Đã chọn' : 'So sánh'}</span>
                </button>

                <button
                  onClick={() => setShowShare(!showShare)}
                  className="flex items-center justify-center p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-500 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onAskAI?.(product)}
                  className="flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:opacity-90 transition-all shadow-lg shadow-purple-500/30"
                >
                  <Bot className="w-4 h-4" />
                </button>
              </div>

              {/* Share Panel */}
              <AnimatePresence>
                {showShare && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 bg-gray-50 rounded-xl flex gap-2">
                      <button
                        onClick={handleCopy}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                          copied ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span className="text-sm font-medium">{copied ? 'Đã copy' : 'Copy link'}</span>
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        <Facebook className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare('zalo')}
                        className="p-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition-colors font-bold text-sm"
                      >
                        Z
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buy Buttons */}
              <div className="flex gap-3 pt-2">
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold text-base hover:opacity-90 transition-opacity shadow-xl shadow-orange-500/30"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Mua ngay
                </a>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-base transition-all ${
                    inCart
                      ? 'bg-green-100 text-green-600 border-2 border-green-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  {inCart ? '✓ Đã thêm' : 'Giỏ hàng'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
