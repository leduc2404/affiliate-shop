'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Upload, 
  FileJson, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  X,
  FolderOpen
} from 'lucide-react';

interface ValidationResult {
  valid: boolean;
  stats: {
    totalProducts: number;
    categories: string[];
    errors: string[];
    totalErrors: number;
  };
}

interface UploadResult {
  success: boolean;
  message: string;
  stats: {
    total: number;
    success: number;
    failed: number;
  };
}

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<any[] | null>(null);
  const [validating, setValidating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      router.push('/admin/login');
    }
  }, [router]);

  const handleFileSelect = async (selectedFile: File) => {
    setError('');
    setValidation(null);
    setUploadResult(null);

    // Check file type
    if (!selectedFile.name.endsWith('.json')) {
      setError('Chỉ chấp nhận file .json');
      return;
    }

    setFile(selectedFile);

    // Read and parse file
    try {
      const text = await selectedFile.text();
      const data = JSON.parse(text);
      
      if (!Array.isArray(data)) {
        setError('File phải chứa một mảng sản phẩm');
        return;
      }

      setFileContent(data);

      // Validate with backend
      setValidating(true);
      const response = await fetch('/api/admin/upload', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setValidation(result);
    } catch (err: any) {
      setError(`Không thể đọc file: ${err.message}`);
    } finally {
      setValidating(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!fileContent) return;

    setUploading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fileContent),
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadResult(result);
      } else {
        setError(result.error || 'Upload thất bại');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setFileContent(null);
    setValidation(null);
    setUploadResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
              <Upload className="w-5 h-5 text-pink-500" />
              <span className="text-lg font-semibold text-white">Upload JSON</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Result */}
        {uploadResult && (
          <div className="mb-6 p-6 bg-green-500/20 border border-green-500/50 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-green-200 font-semibold text-lg">Upload thành công!</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <p className="text-2xl font-bold text-green-400">{uploadResult.stats.total}</p>
                <p className="text-green-200 text-sm">Tổng</p>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <p className="text-2xl font-bold text-green-400">{uploadResult.stats.success}</p>
                <p className="text-green-200 text-sm">Thành công</p>
              </div>
              <div className="text-center p-3 bg-red-500/10 rounded-lg">
                <p className="text-2xl font-bold text-red-400">{uploadResult.stats.failed}</p>
                <p className="text-red-200 text-sm">Thất bại</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Link 
                href="/admin/products"
                className="flex-1 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors"
              >
                Xem sản phẩm
              </Link>
              <button
                onClick={resetUpload}
                className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Upload thêm
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-200">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Drop Zone */}
        {!uploadResult && (
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
              dragOver 
                ? 'border-pink-500 bg-pink-500/10' 
                : file 
                  ? 'border-green-500 bg-green-500/5' 
                  : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {file ? (
              <div className="space-y-3">
                <FileJson className="w-12 h-12 text-green-500 mx-auto" />
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-gray-400 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Xóa file
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <FolderOpen className="w-12 h-12 text-gray-500 mx-auto" />
                <p className="text-white font-medium">Kéo thả file JSON vào đây</p>
                <p className="text-gray-400 text-sm">hoặc click để chọn file</p>
              </div>
            )}
          </div>
        )}

        {/* Validation Result */}
        {validating && (
          <div className="mt-6 p-6 bg-gray-800 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
              <span className="text-white">Đang kiểm tra file...</span>
            </div>
          </div>
        )}

        {validation && !uploadResult && (
          <div className="mt-6 p-6 bg-gray-800 rounded-xl border border-gray-700">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              {validation.valid ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  File hợp lệ
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  File có lỗi
                </>
              )}
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-purple-400">{validation.stats.totalProducts}</p>
                <p className="text-gray-400 text-sm">Sản phẩm</p>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-pink-400">{validation.stats.categories.length}</p>
                <p className="text-gray-400 text-sm">Danh mục</p>
              </div>
            </div>

            {validation.stats.categories.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Danh mục:</p>
                <div className="flex flex-wrap gap-2">
                  {validation.stats.categories.map((cat) => (
                    <span key={cat} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-sm rounded">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {validation.stats.errors.length > 0 && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm font-medium mb-2">
                  {validation.stats.totalErrors} lỗi được tìm thấy:
                </p>
                <ul className="text-red-300 text-sm space-y-1">
                  {validation.stats.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            {validation.valid && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang upload...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload {validation.stats.totalProducts} sản phẩm
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Instructions */}
        {!file && !uploadResult && (
          <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h4 className="text-white font-medium mb-3">📋 Hướng dẫn</h4>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>1. Chọn file JSON chứa danh sách sản phẩm</li>
              <li>2. Hệ thống sẽ tự động kiểm tra định dạng file</li>
              <li>3. Xem trước thông tin trước khi upload</li>
              <li>4. Click "Upload" để thêm sản phẩm vào database</li>
            </ul>
            <p className="text-gray-500 text-xs mt-4">
              File mẫu: <code className="text-purple-400">E:\SELL AFFLIATE\Thời_Trang_Nam.json</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
