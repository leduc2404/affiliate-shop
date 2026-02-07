'use client';

import Image from 'next/image';
import { Star, ShoppingCart, Heart, Scale, Bot, Plus } from 'lucide-react';
import { Product } from '@/types';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCompare } from '@/contexts/CompareContext';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
  index: number;
  onProductClick: (product: Product) => void;
  onAskAI?: (product: Product) => void;
}

// Format số bán
function formatSold(sold: string | undefined): string {
  if (!sold) return '0';
  const num = parseInt(sold.replace(/,/g, ''));
  if (num >= 1000) {
    return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}k`;
  }
  return sold;
}

// Parse giá từ string
function parsePrice(price: string | undefined): number {
  if (!price) return 0;
  return parseInt(price.replace(/,/g, '').replace(/\./g, '')) || 0;
}

export default function ProductCard({ product, index, onProductClick, onAskAI }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { addToCart, isInCart } = useCart();
  
  const priceLow = parsePrice(product.price_low);
  const priceHigh = parsePrice(product.price_high);
  const hasDiscount = priceHigh > priceLow && priceLow > 0;
  
  const inWishlist = isInWishlist(product.product_id);
  const inCompare = isInCompare(product.product_id);
  const inCart = isInCart(product.product_id);

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(product.product_id);
    } else {
      addToCompare(product);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAskAI = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAskAI?.(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <motion.div 
      className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onProductClick(product)}
      whileHover={{ y: -2 }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={product.image}
          alt={product.title || 'Product'}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={index < 4}
          fetchPriority={index < 4 ? "high" : "auto"}
        />
        
        {/* Rating Badge */}
        <div className="absolute top-2 left-2 bg-white/95 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-[10px] font-bold text-gray-700">{product.rating || 0}</span>
        </div>

        {/* Sold Badge */}
        <div className="absolute top-2 right-2 bg-orange-500 px-2 py-1 rounded-md shadow-sm flex items-center justify-center">
          <span className="text-[10px] font-bold text-white whitespace-nowrap leading-none" style={{ transform: 'translateY(-0.5px)' }}>Đã bán {formatSold(product.sold)}</span>
        </div>

        {/* Action Buttons - Show on hover */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          className="absolute bottom-2 left-2 right-2 flex justify-center gap-1.5"
        >
          {/* Wishlist Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWishlistToggle}
            className={`p-2 rounded-full shadow-lg backdrop-blur-sm transition-colors ${
              inWishlist 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 text-gray-700 hover:bg-red-50 hover:text-red-500'
            }`}
            title={inWishlist ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </motion.button>

          {/* Compare Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCompareToggle}
            className={`p-2 rounded-full shadow-lg backdrop-blur-sm transition-colors ${
              inCompare 
                ? 'bg-orange-500 text-white' 
                : 'bg-white/90 text-gray-700 hover:bg-orange-50 hover:text-orange-500'
            }`}
            title={inCompare ? 'Bỏ so sánh' : 'Thêm so sánh'}
          >
            <Scale className="w-4 h-4" />
          </motion.button>

          {/* AI Consult Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAskAI}
            className="p-2 rounded-full shadow-lg backdrop-blur-sm bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors"
            title="Hỏi AI tư vấn"
          >
            <Bot className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-2">
        {/* Category */}
        <p className="text-[10px] text-orange-600 font-semibold uppercase tracking-wide mb-0.5">
          {product.phan_loai}
        </p>

        {/* Product Name - Fixed height with proper line clamp */}
        <h3 
          className="text-sm font-medium text-gray-800 leading-tight mb-1.5"
          style={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.4em'
          }}
          title={product.title}
        >
          {product.title}
        </h3>

        {/* Price Section */}
        <div className="flex items-center gap-1 flex-wrap mb-1.5">
          {hasDiscount ? (
            <>
              <span className="text-base font-bold text-red-600">
                {priceLow.toLocaleString('vi-VN')}đ
              </span>
              <span className="text-xs text-gray-400 line-through">
                {priceHigh.toLocaleString('vi-VN')}đ
              </span>
              <span className="text-[10px] font-bold text-white bg-red-500 px-1 py-0.5 rounded">
                -{Math.round(((priceHigh - priceLow) / priceHigh) * 100)}%
              </span>
            </>
          ) : (
            <span className="text-base font-bold text-orange-600">
              {priceLow.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5">
          {/* Buy Button */}
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-md text-white font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Mua
          </a>
          
          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md font-medium text-sm transition-all ${
              inCart
                ? 'bg-green-100 text-green-600 border border-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            {inCart ? '✓' : 'Giỏ'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
