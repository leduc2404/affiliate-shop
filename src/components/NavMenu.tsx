'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, ShoppingBag, Sparkles, Zap, Crown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Custom Facebook icon
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// Custom TikTok icon
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const tabs = [
  { id: 'products', path: '/products', label: 'Sản phẩm', icon: ShoppingBag, badge: 'HOT' },
  { id: 'vouchers', path: '/voucher', label: 'Mã giảm giá', icon: Ticket, badge: null },
];

const socialLinks = [
  { name: 'Facebook', icon: FacebookIcon, href: 'https://facebook.com/shopdeals', color: 'hover:text-blue-500' },
  { name: 'TikTok', icon: TikTokIcon, href: 'https://tiktok.com/@shopdeals', color: 'hover:text-pink-500' },
];

export default function NavMenu() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Determine active tab based on URL
  const getActiveTab = () => {
    if (pathname === '/voucher') return 'vouchers';
    return 'products';
  };
  
  const activeTab = getActiveTab();

  // Detect scroll for header shrink effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-200/50' 
            : 'bg-white/80 backdrop-blur-xl'
        }`}
      >
        {/* Animated top border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 opacity-80" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'h-14' : 'h-16'
          }`}>
            
            {/* Logo Section */}
            <Link href="/products">
              <motion.div 
                className="flex items-center gap-2.5 cursor-pointer group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated Logo Container */}
                <div className="relative">
                  {/* Glow effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="relative p-2 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl shadow-lg">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </motion.div>
                  </div>
                </div>
                
                {/* Brand Name with gradient */}
                <div className="hidden sm:flex flex-col">
                  <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-lg leading-tight">
                    Shop Deals
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                    Deal HOT mỗi ngày
                  </span>
                </div>
              </motion.div>
            </Link>

            {/* Center: Navigation Tabs */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gradient-to-br from-gray-50 to-gray-100 p-1.5 rounded-2xl border border-gray-200/50 shadow-inner">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <Link key={tab.id} href={tab.path}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                          isActive
                            ? 'text-white'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-xl shadow-lg shadow-orange-500/30"
                            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                          />
                        )}
                        <Icon className={`relative w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                        <span className="relative hidden sm:block">{tab.label}</span>
                        
                        {/* Badge */}
                        {tab.badge && isActive && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="relative ml-1 px-1.5 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-full shadow-sm"
                          >
                            {tab.badge}
                          </motion.span>
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Section: Social Links + Premium Badge */}
            <div className="flex items-center gap-3">
              {/* Social Links */}
              <div className="hidden md:flex items-center gap-1">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-2 rounded-lg text-gray-400 transition-colors ${social.color}`}
                      title={social.name}
                    >
                      <Icon />
                    </motion.a>
                  );
                })}
              </div>
              
              {/* Premium Badge */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full border border-amber-200/50"
              >
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700">Premium Deals</span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Floating promo banner - appears on scroll */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-[56px] left-0 right-0 z-40 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white text-center py-1.5 text-sm font-medium shadow-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              <span>⚡ Flash Sale - Giảm đến 50% hôm nay! ⚡</span>
              <Zap className="w-4 h-4" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
