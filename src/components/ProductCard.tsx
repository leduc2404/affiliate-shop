'use client';

import Image from 'next/image';
import { ExternalLink, Star, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  index: number;
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

export default function ProductCard({ product, index }: ProductCardProps) {
  const priceLow = parsePrice(product.price_low);
  const priceHigh = parsePrice(product.price_high);
  const hasDiscount = priceHigh > priceLow && priceLow > 0;

  return (
    <div className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
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

        {/* Buy Button */}
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 w-full py-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-md text-white font-bold text-sm hover:opacity-90 transition-opacity"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Mua ngay
        </a>
      </div>
    </div>
  );
}
