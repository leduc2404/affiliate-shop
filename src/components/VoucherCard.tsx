'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Ticket, Copy, Check, Clock } from 'lucide-react';

export interface Voucher {
  ma: string;
  phan_loai: string;
  noi_dung: string;
  tinh_trang: string;
  logo: string;
  link_voucher: string;
  link_trang_chu: string;
}

interface VoucherCardProps {
  voucher: Voucher;
  index: number;
}

// Extract discount info from content
function extractDiscountInfo(content: string): { 
  percent: string; 
  maxDiscount: string;
  minOrder: string;
} {
  const percentMatch = content.match(/Giảm\s*(\d+)%/i);
  const amountMatch = content.match(/Giảm\s*([\d,.]+)đ/i);
  const maxMatch = content.match(/tối đa\s*([\d,.]+)/i);
  const minMatch = content.match(/tối thiểu\s*([\d,.]+)/i);

  return {
    percent: percentMatch ? `${percentMatch[1]}%` : (amountMatch ? `${amountMatch[1]}đ` : ''),
    maxDiscount: maxMatch ? `${maxMatch[1]}đ` : '',
    minOrder: minMatch ? `${minMatch[1]}đ` : '',
  };
}

// Extract remaining percentage from status
function extractRemaining(status: string): string {
  const match = status.match(/(\d+)%/);
  return match ? match[1] : '';
}

export default function VoucherCard({ voucher, index }: VoucherCardProps) {
  const [copied, setCopied] = useState(false);
  const { percent, maxDiscount, minOrder } = extractDiscountInfo(voucher.noi_dung);
  const category = voucher.phan_loai;
  const remaining = extractRemaining(voucher.tinh_trang);

  const copyCode = async () => {
    await navigator.clipboard.writeText(voucher.ma);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      className="relative bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
    >
      {/* Ticket notches */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-gray-50 rounded-full"></div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 bg-gray-50 rounded-full"></div>

      <div className="flex">
        {/* Left - Logo */}
        <div className="flex-shrink-0 w-20 bg-gray-50 p-3 flex flex-col items-center justify-center border-r border-dashed border-gray-200">
          <div 
            className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center shadow-sm"
            style={{ backgroundColor: '#EE4D2D' }}
          >
            {voucher.logo ? (
              <Image
                src={voucher.logo}
                alt={category || 'Voucher'}
                width={56}
                height={56}
                className="object-contain"
              />
            ) : (
              <Ticket className="w-6 h-6 text-white" />
            )}
          </div>
          {category && (
            <p className="mt-1.5 text-[9px] text-center text-gray-500 font-medium truncate w-full" title={category}>
              {category.length > 8 ? category.slice(0, 8) + '...' : category}
            </p>
          )}
        </div>

        {/* Right - Content */}
        <div className="flex-1 p-3">
          {/* Discount */}
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-xs font-medium text-gray-400">Giảm</span>
            <span className="text-2xl font-black text-green-600">{percent || '?'}</span>
          </div>

          {/* Details - Clean inline */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
            {minOrder && (
              <span>• ĐH tối thiểu: <b className="text-gray-700">{minOrder}</b></span>
            )}
            {maxDiscount && (
              <span>• Tối đa: <b className="text-orange-600">{maxDiscount}</b></span>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-2">
            <Clock className="w-3 h-3" />
            <span>{voucher.tinh_trang}</span>
          </div>

          {/* Code */}
          <button
            onClick={copyCode}
            className="w-full mb-2.5 py-2 px-2.5 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-between hover:border-green-400 hover:bg-green-50 transition-colors"
          >
            <span className="text-sm font-mono font-bold text-gray-600 truncate">{voucher.ma}</span>
            <div className="flex items-center gap-1 text-gray-400 flex-shrink-0 ml-2">
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span className="text-[10px]">{copied ? 'Đã copy' : 'Copy'}</span>
            </div>
          </button>

          {/* Buttons */}
          <div className="flex gap-2">
            <a
              href={voucher.link_voucher}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 text-center text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
            >
              Xem Voucher
            </a>
            <a
              href={voucher.link_trang_chu}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 text-center text-xs font-bold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
            >
              Mua Ngay
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
