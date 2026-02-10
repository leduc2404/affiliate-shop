'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import ProductSection from '@/components/ProductSection';
import ProductDetailModal from '@/components/ProductDetailModal';
import NavMenu from '@/components/NavMenu';
import Footer from '@/components/Footer';
import { Product } from '@/types';

// Dynamic import TetDecorations to reduce initial bundle and CLS
const TetDecorations = dynamic(() => import('@/components/TetDecorations'), {
  ssr: false,
  loading: () => (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true" />
  )
});

function ProductsPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const searchParams = useSearchParams();
  
  // State for URL-triggered popup
  const [urlProduct, setUrlProduct] = useState<Product | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);

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

  // Check URL for product ID and show popup
  useEffect(() => {
    const productId = searchParams.get('id');
    if (productId && products.length > 0) {
      const product = products.find(p => p.product_id === productId);
      if (product) {
        setUrlProduct(product);
        setShowUrlModal(true);
      }
    }
  }, [searchParams, products]);

  const handleCloseUrlModal = useCallback(() => {
    setShowUrlModal(false);
    // Clear URL param when closing
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      window.history.replaceState({}, '', url.pathname);
    }
  }, []);

  const handleAskAI = useCallback((product: Product) => {
    window.dispatchEvent(new CustomEvent('openChatWithProduct', { detail: product }));
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
      </div>

      <Footer />

      {/* URL-triggered Product Modal */}
      <ProductDetailModal
        product={urlProduct}
        isOpen={showUrlModal}
        onClose={handleCloseUrlModal}
        onAskAI={handleAskAI}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50/50 via-white to-yellow-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
