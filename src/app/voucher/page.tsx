'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import VoucherSection from '@/components/VoucherSection';
import NavMenu from '@/components/NavMenu';
import Footer from '@/components/Footer';

// Voucher type
interface Voucher {
  ma: string;
  phan_loai: string;
  noi_dung: string;
  tinh_trang: string;
  logo: string;
  link_voucher: string;
  link_trang_chu: string;
}

export default function VoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchVouchers() {
      try {
        const response = await fetch('/api/vouchers');
        const data = await response.json();
        
        if (data.success) {
          setVouchers(data.vouchers);
        }
      } catch (err) {
        console.error('Fetch vouchers error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchVouchers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30">
      <NavMenu />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <VoucherSection vouchers={vouchers} loading={loading} />
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

