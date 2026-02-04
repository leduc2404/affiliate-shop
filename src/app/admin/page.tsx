'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  Upload, 
  FolderOpen, 
  LogOut, 
  Plus,
  Loader2,
  TrendingUp
} from 'lucide-react';

interface CategoryStat {
  name: string;
  count: number;
}

interface DashboardData {
  totalProducts: number;
  categories: CategoryStat[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({ totalProducts: 0, categories: [] });
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    // Check auth
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      router.push('/admin/login');
      return;
    }
    setUser(JSON.parse(adminUser));

    // Fetch dashboard data
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const result = await response.json();
      
      if (result.success) {
        setData({
          totalProducts: result.total,
          categories: result.categories,
        });
      }
    } catch (error) {
      console.error('Fetch dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-6 h-6 text-purple-500" />
              <span className="text-xl font-bold text-white">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/products/add"
            className="group bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 hover:from-purple-500 hover:to-purple-700 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Thêm sản phẩm</h3>
                <p className="text-purple-200 text-sm">Thêm từng sản phẩm</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/upload"
            className="group bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl p-6 hover:from-pink-500 hover:to-pink-700 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Upload JSON</h3>
                <p className="text-pink-200 text-sm">Upload file hàng loạt</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="group bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-6 hover:from-indigo-500 hover:to-indigo-700 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Quản lý sản phẩm</h3>
                <p className="text-indigo-200 text-sm">Xem, sửa, xóa</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Products */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Tổng sản phẩm</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-4xl font-bold text-white mb-2">{data.totalProducts.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Sản phẩm trong database</p>
          </div>

          {/* Categories */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Danh mục</h3>
              <FolderOpen className="w-5 h-5 text-purple-500" />
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {data.categories.length === 0 ? (
                <p className="text-gray-500 text-sm">Chưa có danh mục nào</p>
              ) : (
                data.categories.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <span className="text-gray-300">{cat.name}</span>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-lg">
                      {cat.count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm text-center">
            💡 Tip: Bạn có thể upload file JSON từ thư mục <code className="text-purple-400">E:\SELL AFFLIATE</code> để thêm sản phẩm hàng loạt
          </p>
        </div>
      </div>
    </div>
  );
}
