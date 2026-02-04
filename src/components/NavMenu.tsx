'use client';

import { motion } from 'framer-motion';
import { Ticket, ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { id: 'products', path: '/products', label: 'Sản phẩm', icon: ShoppingBag },
  { id: 'vouchers', path: '/voucher', label: 'Mã giảm giá', icon: Ticket },
];

export default function NavMenu() {
  const pathname = usePathname();
  
  // Determine active tab based on URL
  const getActiveTab = () => {
    if (pathname === '/voucher') return 'vouchers';
    return 'products'; // Default to products for / or /products
  };
  
  const activeTab = getActiveTab();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/products">
            <motion.div 
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg shadow-orange-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-800 text-lg hidden sm:block">
                Shop Deals
              </span>
            </motion.div>
          </Link>


          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <Link key={tab.id} href={tab.path}>
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg shadow-orange-500/25"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon className={`relative w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                    <span className="relative hidden sm:block">{tab.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right side - could add more items */}
          <div className="w-24 hidden sm:block"></div>
        </div>
      </div>
    </motion.nav>
  );
}
