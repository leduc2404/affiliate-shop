import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Product } from '@/types';

const COLLECTION_NAME = 'products';

// Product validation schema
const validateProduct = (product: any, index: number): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const requiredFields = ['phan_loai', 'title', 'image', 'link'];

  for (const field of requiredFields) {
    if (!product[field]) {
      errors.push(`Product ${index + 1}: Missing field "${field}"`);
    }
  }

  if (product.rating && (typeof product.rating !== 'number' || product.rating < 0 || product.rating > 5)) {
    errors.push(`Product ${index + 1}: Rating must be a number between 0 and 5`);
  }

  return { valid: errors.length === 0, errors };
};

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Firebase not configured' },
        { status: 500 }
      );
    }

    const contentType = request.headers.get('content-type') || '';

    let products: Product[] = [];

    if (contentType.includes('application/json')) {
      const body = await request.json();
      products = Array.isArray(body) ? body : [body];
    } else {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    if (!products.length) {
      return NextResponse.json(
        { success: false, error: 'No products to upload' },
        { status: 400 }
      );
    }

    // Validate all products first
    const allErrors: string[] = [];
    products.forEach((product, index) => {
      const { valid, errors } = validateProduct(product, index);
      if (!valid) {
        allErrors.push(...errors);
      }
    });

    if (allErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: allErrors.slice(0, 10), // Show first 10 errors
        totalErrors: allErrors.length,
      }, { status: 400 });
    }

    // Batch write to Firestore (max 500 per batch)
    const batchSize = 500;
    let successCount = 0;
    let failedCount = 0;
    const failedProducts: string[] = [];

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = db.batch();
      const chunk = products.slice(i, i + batchSize);

      for (const product of chunk) {
        try {
          const docId = product.product_id || db.collection(COLLECTION_NAME).doc().id;
          const docRef = db.collection(COLLECTION_NAME).doc(docId);
          
          batch.set(docRef, {
            ...product,
            product_id: docId,
            createdAt: new Date().toISOString(),
          });
          successCount++;
        } catch (err) {
          failedCount++;
          failedProducts.push(product.title || 'Unknown');
        }
      }

      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: `Upload completed`,
      stats: {
        total: products.length,
        success: successCount,
        failed: failedCount,
      },
      failedProducts: failedProducts.slice(0, 5),
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Validate JSON file format without uploading
export async function PUT(request: NextRequest) {
  try {
    const products = await request.json();

    if (!Array.isArray(products)) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'File must contain an array of products',
      }, { status: 400 });
    }

    const allErrors: string[] = [];
    const categories = new Set<string>();

    products.forEach((product, index) => {
      const { valid, errors } = validateProduct(product, index);
      if (!valid) {
        allErrors.push(...errors);
      }
      if (product.phan_loai) {
        categories.add(product.phan_loai);
      }
    });

    return NextResponse.json({
      success: true,
      valid: allErrors.length === 0,
      stats: {
        totalProducts: products.length,
        categories: Array.from(categories),
        errors: allErrors.slice(0, 10),
        totalErrors: allErrors.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      valid: false,
      error: `Invalid JSON format: ${error.message}`,
    }, { status: 400 });
  }
}
