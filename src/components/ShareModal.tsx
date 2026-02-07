'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Facebook, Share2, Check, Link2 } from 'lucide-react';
import { useState } from 'react';
import { Product } from '@/types';

interface ShareModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

function parsePrice(price: string | undefined): number {
  if (!price) return 0;
  return parseInt(price.replace(/,/g, '').replace(/\./g, '')) || 0;
}

export default function ShareModal({ product, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/products?id=${product.product_id}` 
    : '';
  
  const shareText = `🛒 ${product.title}\n💰 Giá: ${parsePrice(product.price_low).toLocaleString('vi-VN')}đ\n👉 Xem ngay: ${shareUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(product.title)}`;
        break;
      case 'zalo':
        url = `https://zalo.me/share/phone?url=${encodedUrl}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: product.title,
              text: `Xem sản phẩm này: ${product.title}`,
              url: shareUrl
            });
          } catch (error) {
            console.log('Share cancelled');
          }
          return;
        }
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Chia sẻ sản phẩm</h3>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Product Preview */}
            <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50">
              <div className="bg-white rounded-xl p-3 shadow-sm flex gap-3">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">{product.title}</p>
                  <p className="text-lg font-bold text-orange-600 mt-1">
                    {parsePrice(product.price_low).toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-xs text-gray-500">⭐ {product.rating} | Đã bán {product.sold}</p>
                </div>
              </div>
            </div>

            {/* Share Options */}
            <div className="p-4 space-y-3">
              {/* Copy Link */}
              <button
                onClick={handleCopy}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  copied 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
                <span className="font-medium">{copied ? 'Đã sao chép!' : 'Sao chép link'}</span>
              </button>

              {/* Social Share */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                  <span className="font-medium">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('zalo')}
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-400 hover:bg-blue-500 text-white transition-colors"
                >
                  <span className="font-bold text-lg">Z</span>
                  <span className="font-medium">Zalo</span>
                </button>
              </div>

              {/* Native Share (mobile) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={() => handleShare('native')}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-800 hover:bg-gray-900 text-white transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">Chia sẻ khác...</span>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
