'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Ticket, Mail, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Custom Facebook icon
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// Custom TikTok icon
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const socialLinks = [
  {
    name: 'Facebook',
    icon: FacebookIcon,
    href: 'https://facebook.com/shopdeals', // TODO: Update với link thực
    color: 'hover:bg-blue-500 hover:text-white hover:shadow-blue-500/30',
    bgColor: 'bg-blue-500/10 text-blue-500',
  },
  {
    name: 'TikTok',
    icon: TikTokIcon,
    href: 'https://tiktok.com/@shopdeals', // TODO: Update với link thực
    color: 'hover:bg-pink-500 hover:text-white hover:shadow-pink-500/30',
    bgColor: 'bg-pink-500/10 text-pink-500',
  },
  {
    name: 'Email',
    icon: Mail,
    href: 'mailto:contact@shopdeals.vn', // TODO: Update với email thực
    color: 'hover:bg-orange-500 hover:text-white hover:shadow-orange-500/30',
    bgColor: 'bg-orange-500/10 text-orange-500',
  },
];

const quickLinks = [
  { name: 'Sản phẩm HOT', href: '/products', icon: ShoppingBag },
  { name: 'Mã giảm giá', href: '/voucher', icon: Ticket },
];

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="relative mt-16"
    >
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500" />
      
      {/* Main footer content */}
      <div className="bg-gradient-to-b from-gray-50 to-white pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 3-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            
            {/* Column 1: Logo & Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg shadow-orange-500/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-gray-800 text-xl">Shop Deals</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Chuyên săn deal hot với giá tốt nhất từ Shopee, TikTok Shop. 
                Cập nhật mã giảm giá độc quyền hàng ngày!
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Made with</span>
                <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                <span>in Vietnam</span>
              </div>
            </motion.div>

            {/* Column 2: Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-gray-800 text-base flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
                Liên kết nhanh
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.name}>
                      <Link href={link.href}>
                        <motion.span
                          whileHover={{ x: 4 }}
                          className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors text-sm cursor-pointer"
                        >
                          <Icon className="w-4 h-4" />
                          {link.name}
                        </motion.span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Column 3: Contact & Social */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-gray-800 text-base flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
                Kết nối với chúng tôi
              </h3>
              <p className="text-gray-500 text-sm">
                Theo dõi để nhận thông tin deal hot mỗi ngày!
              </p>
              
              {/* Social Icons */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target={social.name !== 'Email' ? '_blank' : undefined}
                      rel={social.name !== 'Email' ? 'noopener noreferrer' : undefined}
                      whileHover={{ scale: 1.1, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 rounded-xl ${social.bgColor} ${social.color} transition-all duration-300 shadow-sm hover:shadow-lg`}
                      title={social.name}
                    >
                      <Icon />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-sm text-center sm:text-left">
                © {new Date().getFullYear()} Shop Deals. Tất cả quyền được bảo lưu.
              </p>
              <p className="text-gray-300 text-xs text-center">
                *Các link affiliate giúp chúng tôi nhận hoa hồng khi bạn mua hàng
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
