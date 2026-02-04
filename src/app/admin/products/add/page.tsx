'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, Loader2, ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    phan_loai: '',
    title: '',
    image: '',
    product_id: '',
    rating: 5,
    link: '',
    price_low: '',
    price_high: '',
    sold: '',
  });

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      router.push('/admin/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'image') {
      setImagePreview(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rating: parseFloat(formData.rating.toString()),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          phan_loai: formData.phan_loai, // Keep category
          title: '',
          image: '',
          product_id: '',
          rating: 5,
          link: '',
          price_low: '',
          price_high: '',
          sold: '',
        });
        setImagePreview('');
      } else {
        setError(data.error || 'Failed to add product');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
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
            <span className="text-lg font-semibold text-white">Thêm sản phẩm mới</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Messages */}
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-200">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-200">Sản phẩm đã được thêm thành công!</span>
            </div>
          )}

          {/* Image Preview */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <label className="block text-white font-medium mb-3">Hình ảnh</label>
            <div className="flex gap-4">
              <div className="w-32 h-32 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                {imagePreview ? (
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    width={128} 
                    height={128} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-500" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="URL hình ảnh sản phẩm"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="text-gray-500 text-sm mt-2">Dán URL hình ảnh từ Shopee</p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Danh mục *</label>
              <input
                type="text"
                name="phan_loai"
                value={formData.phan_loai}
                onChange={handleChange}
                placeholder="VD: Thời Trang Nam, Điện Tử..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Tên sản phẩm *</label>
              <textarea
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Tên đầy đủ của sản phẩm"
                rows={2}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Link affiliate *</label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="https://s.shopee.vn/..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          {/* Price & Stats */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-medium mb-4">Giá & Thống kê</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Giá thấp *</label>
                <input
                  type="text"
                  name="price_low"
                  value={formData.price_low}
                  onChange={handleChange}
                  placeholder="150,000"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Giá cao</label>
                <input
                  type="text"
                  name="price_high"
                  value={formData.price_high}
                  onChange={handleChange}
                  placeholder="200,000"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Đã bán</label>
                <input
                  type="text"
                  name="sold"
                  value={formData.sold}
                  onChange={handleChange}
                  placeholder="10000"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Rating</label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang thêm...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Thêm sản phẩm
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
