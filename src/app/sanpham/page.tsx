'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/types';
import SearchBar from '@/components/SearchBar';
import CategoryTabs from '@/components/CategoryTabs';
import ProductCard from '@/components/ProductCard';
import NavMenu from '@/components/NavMenu';
import { Loader2, ShoppingBag } from 'lucide-react';

// Demo products for preview
const demoProducts: Product[] = [
  {
    phan_loai: 'Skincare',
    title: 'Serum Vitamin C Dưỡng Sáng Da Chuyên Sâu 30ml',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop',
    product_id: '1',
    rating: 4.9,
    link: 'https://shopee.vn',
    price_low: '199,000',
    price_high: '350,000',
    sold: '1000',
    id: '1',
    name: 'Serum Vitamin C Dưỡng Sáng Da Chuyên Sâu 30ml',
    image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop',
    affiliate_link: 'https://shopee.vn',
    category: 'Skincare',
    price: 199000,
    old_price: 350000,
    discount_code: 'SERUM50',
    is_hot: true,
    created_at: new Date().toISOString(),
  },
  {
    phan_loai: 'Tech',
    title: 'Tai Nghe Bluetooth Không Dây TWS Pin 24H',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop',
    product_id: '2',
    rating: 4.8,
    link: 'https://shopee.vn',
    price_low: '289,000',
    price_high: '599,000',
    sold: '500',
    id: '2',
    name: 'Tai Nghe Bluetooth Không Dây TWS Pin 24H',
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop',
    affiliate_link: 'https://shopee.vn',
    category: 'Tech',
    price: 289000,
    old_price: 599000,
    discount_code: 'TECH30',
    is_hot: true,
    created_at: new Date().toISOString(),
  },
  {
    phan_loai: 'Đồ gia dụng',
    title: 'Nồi Chiên Không Dầu Đa Năng 5.5L',
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&h=500&fit=crop',
    product_id: '3',
    rating: 4.7,
    link: 'https://shopee.vn',
    price_low: '890,000',
    price_high: '1,500,000',
    sold: '200',
    id: '3',
    name: 'Nồi Chiên Không Dầu Đa Năng 5.5L',
    image_url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&h=500&fit=crop',
    affiliate_link: 'https://shopee.vn',
    category: 'Đồ gia dụng',
    price: 890000,
    old_price: 1500000,
    is_hot: false,
    created_at: new Date().toISOString(),
  },
  {
    phan_loai: 'Skincare',
    title: 'Kem Chống Nắng Kiềm Dầu SPF50+ PA++++',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=500&fit=crop',
    product_id: '4',
    rating: 4.9,
    link: 'https://shopee.vn',
    price_low: '165,000',
    price_high: '280,000',
    sold: '800',
    id: '4',
    name: 'Kem Chống Nắng Kiềm Dầu SPF50+ PA++++',
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=500&fit=crop',
    affiliate_link: 'https://shopee.vn',
    category: 'Skincare',
    price: 165000,
    old_price: 280000,
    discount_code: 'SUN20',
    is_hot: false,
    created_at: new Date().toISOString(),
  },
  {
    phan_loai: 'Tech',
    title: 'Bàn Phím Cơ Gaming RGB 87 Keys',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop',
    product_id: '5',
    rating: 4.8,
    link: 'https://shopee.vn',
    price_low: '650,000',
    price_high: '1,200,000',
    sold: '300',
    id: '5',
    name: 'Bàn Phím Cơ Gaming RGB 87 Keys',
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop',
    affiliate_link: 'https://shopee.vn',
    category: 'Tech',
    price: 650000,
    old_price: 1200000,
    discount_code: 'GAME40',
    is_hot: true,
    created_at: new Date().toISOString(),
  },
  {
    phan_loai: 'Đồ gia dụng',
    title: 'Máy Hút Bụi Cầm Tay Không Dây 120W',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&h=500&fit=crop',
    product_id: '6',
    rating: 4.6,
    link: 'https://shopee.vn',
    price_low: '450,000',
    price_high: '800,000',
    sold: '150',
    id: '6',
    name: 'Máy Hút Bụi Cầm Tay Không Dây 120W',
    image_url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&h=500&fit=crop',
    affiliate_link: 'https://shopee.vn',
    category: 'Đồ gia dụng',
    price: 450000,
    old_price: 800000,
    is_hot: false,
    created_at: new Date().toISOString(),
  },
];

export default function SanPhamPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          setProducts(demoProducts);
        } else {
          setProducts(data);
        }
      } catch {
        setProducts(demoProducts);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.phan_loai || p.category))];
    return cats.filter((c): c is string => Boolean(c));
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productName = product.title || product.name || '';
      const productCategory = product.phan_loai || product.category || '';
      const matchesSearch = productName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === 'Tất cả' || productCategory === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30">
      <NavMenu />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-green-500" />
              Sản phẩm HOT
            </h2>
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </motion.div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
              <p className="text-gray-500">Đang tải sản phẩm...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg">Không tìm thấy sản phẩm nào</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 pb-8 text-center border-t border-gray-100 pt-8"
        >
          <p className="text-gray-400 text-sm">
            © 2024 Shop Deals. Made with ❤️
          </p>
          <p className="text-gray-300 text-xs mt-2">
            *Các link affiliate giúp chúng tôi nhận hoa hồng khi bạn mua hàng
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
