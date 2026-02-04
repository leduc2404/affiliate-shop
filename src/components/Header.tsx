'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import SocialLinks from './SocialLinks';
import { ShopInfo } from '@/types';

interface HeaderProps {
  shopInfo: ShopInfo;
}

export default function Header({ shopInfo }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="text-center py-8"
    >
      {/* Avatar with gradient border */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="relative inline-block mb-4"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full blur-sm"></div>
        <div className="relative p-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white">
            <Image
              src={shopInfo.avatar}
              alt={shopInfo.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </motion.div>

      {/* Shop Name */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl md:text-3xl font-bold text-gray-800 mb-2"
      >
        {shopInfo.name}
      </motion.h1>

      {/* Bio */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-600 text-sm md:text-base max-w-md mx-auto mb-4 px-4"
      >
        {shopInfo.bio}
      </motion.p>

      {/* Social Links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <SocialLinks links={shopInfo.socialLinks} />
      </motion.div>
    </motion.header>
  );
}
