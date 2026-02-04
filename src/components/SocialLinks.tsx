'use client';

import { motion } from 'framer-motion';
import { ShopInfo } from '@/types';

// Custom TikTok icon since Lucide doesn't have one
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Custom Shopee icon
const ShopeeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2C8.74 2 6.1 4.69 6.1 8H4v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8h-2.1C17.9 4.69 15.26 2 12 2zm0 2c2.15 0 3.9 1.79 3.9 4H8.1C8.1 5.79 9.85 4 12 4zm0 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/>
  </svg>
);

import { Facebook, Instagram, Youtube } from 'lucide-react';

interface SocialLinksProps {
  links: ShopInfo['socialLinks'];
}

const socialIcons = {
  tiktok: TikTokIcon,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  shopee: ShopeeIcon,
};

const socialColors = {
  tiktok: 'hover:text-pink-400',
  facebook: 'hover:text-blue-400',
  instagram: 'hover:text-pink-500',
  youtube: 'hover:text-red-500',
  shopee: 'hover:text-orange-500',
};

export default function SocialLinks({ links }: SocialLinksProps) {
  return (
    <div className="flex items-center gap-4">
      {Object.entries(links).map(([platform, url]) => {
        if (!url) return null;
        const IconComponent = socialIcons[platform as keyof typeof socialIcons];
        const colorClass = socialColors[platform as keyof typeof socialColors];
        
        return (
          <motion.a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, y: -2 }}
            whileTap={{ scale: 0.9 }}
            className={`text-white/70 transition-colors duration-300 ${colorClass}`}
          >
            <IconComponent />
          </motion.a>
        );
      })}
    </div>
  );
}
