'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  Zap
} from 'lucide-react';

interface MigrationStatus {
  success: boolean;
  oldCollection: {
    name: string;
    count: number;
    readsPerFetch: number;
  };
  newCollection: {
    name: string;
    productCount: number;
    categoryCount: number;
    categories: string[];
    readsPerFetch: number;
  };
  savings: {
    readsReduction: string;
    percentage: string;
  };
}

interface MigrationResult {
  success: boolean;
  message: string;
  stats: {
    total: number;
    categories: number;
    categoriesCreated: string[];
  };
}

export default function MigratePage() {
  const router = useRouter();
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      router.push('/admin/login');
      return;
    }
    fetchStatus();
  }, [router]);

  const fetchStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/migrate');
      const data = await response.json();
      if (data.success) {
        setStatus(data);
      } else {
        setError(data.error || 'Failed to fetch status');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    setMigrating(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('/api/admin/migrate', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setResult(data);
        // Refresh status after migration
        await fetchStatus();
      } else {
        setError(data.error || 'Migration failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href="/admin" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              <span className="text-lg font-semibold text-white">Data Migration</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Migration Result */}
        {result && (
          <div className="mb-6 p-6 bg-green-500/20 border border-green-500/50 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-green-200 font-semibold text-lg">{result.message}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-400">{result.stats.total}</p>
                <p className="text-green-200 text-sm">Sản phẩm đã migrate</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-400">{result.stats.categories}</p>
                <p className="text-green-200 text-sm">Categories tạo mới</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.stats.categoriesCreated.map((cat) => (
                <span key={cat} className="px-2 py-1 bg-green-500/30 text-green-300 text-sm rounded">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Status Display */}
        {status && !loading && (
          <div className="space-y-6">
            {/* Comparison */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Old Collection */}
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Database className="w-4 h-4 text-orange-500" />
                  Collection cũ
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tên:</span>
                    <code className="text-orange-400">{status.oldCollection.name}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Số sản phẩm:</span>
                    <span className="text-white font-bold">{status.oldCollection.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reads/request:</span>
                    <span className="text-red-400 font-bold">{status.oldCollection.readsPerFetch}</span>
                  </div>
                </div>
              </div>

              {/* New Collection */}
              <div className="p-6 bg-gray-800 rounded-xl border border-green-500/50">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  Collection mới
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tên:</span>
                    <code className="text-green-400">{status.newCollection.name}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Số sản phẩm:</span>
                    <span className="text-white font-bold">{status.newCollection.productCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Số categories:</span>
                    <span className="text-white font-bold">{status.newCollection.categoryCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reads/request:</span>
                    <span className="text-green-400 font-bold">{status.newCollection.readsPerFetch}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings */}
            <div className="p-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl border border-blue-500/30">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Tiết kiệm Firebase Reads
              </h3>
              <div className="flex items-center justify-center gap-4 text-2xl">
                <span className="text-red-400 font-bold">{status.oldCollection.readsPerFetch}</span>
                <ArrowRight className="w-6 h-6 text-gray-400" />
                <span className="text-green-400 font-bold">{status.newCollection.readsPerFetch}</span>
                <span className="text-yellow-400 font-bold">({status.savings.percentage} giảm)</span>
              </div>
            </div>

            {/* Categories */}
            {status.newCollection.categories.length > 0 && (
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <h3 className="text-white font-semibold mb-4">Categories đã migrate:</h3>
                <div className="flex flex-wrap gap-2">
                  {status.newCollection.categories.map((cat) => (
                    <span key={cat} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Migration Button */}
            {status.oldCollection.count > 0 && status.newCollection.productCount === 0 && (
              <button
                onClick={runMigration}
                disabled={migrating}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {migrating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang migrate...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Migrate {status.oldCollection.count} sản phẩm
                  </>
                )}
              </button>
            )}

            {/* Already migrated */}
            {status.newCollection.productCount > 0 && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-200">
                  Đã migrate {status.newCollection.productCount} sản phẩm vào {status.newCollection.categoryCount} categories!
                </p>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={fetchStatus}
              className="w-full py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
