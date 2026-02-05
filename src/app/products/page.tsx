'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import ProductSection from '@/components/ProductSection';
import NavMenu from '@/components/NavMenu';
import { Product } from '@/types';

// Dynamic import TetDecorations to reduce initial bundle and CLS
const TetDecorations = dynamic(() => import('@/components/TetDecorations'), {
  ssr: false,
  loading: () => (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true" />
  )
});

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Fetch products error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/50 via-white to-yellow-50/30 relative">
      <TetDecorations />
      <NavMenu />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ProductSection products={products} loading={loading} />
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 pb-8 text-center border-t border-red-100 pt-8"
        >
          <p className="text-gray-400 text-sm">
            🧧 © 2025 Shop Deals - Chúc Mừng Năm Mới 🧧
          </p>
          <p className="text-gray-300 text-xs mt-2">
            *Các link affiliate giúp chúng tôi nhận hoa hồng khi bạn mua hàng
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

