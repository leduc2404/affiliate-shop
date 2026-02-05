import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Product } from '@/types';

const COLLECTION_NAME = 'products_by_category';

// Normalize category name to use as document ID
function normalizeCategoryId(category: string): string {
  return category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Product validation schema
const validateProduct = (product: any, index: number): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const requiredFields = ['phan_loai', 'title', 'image', 'link'];

  for (const field of requiredFields) {
    if (!product[field]) {
      errors.push(`Product ${index + 1}: Missing field "${field}"`);
    }
  }

  // Ensure product has a unique ID
  if (!product.product_id) {
    errors.push(`Product ${index + 1}: Missing "product_id" for duplicate check`);
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
        details: allErrors.slice(0, 10),
        totalErrors: allErrors.length,
      }, { status: 400 });
    }

    // Group products by category
    const productsByCategory = new Map<string, Product[]>();
    
    for (const product of products) {
      const category = product.phan_loai || 'uncategorized';
      if (!productsByCategory.has(category)) {
        productsByCategory.set(category, []);
      }
      productsByCategory.get(category)!.push(product);
    }

    let successCount = 0;
    let duplicateCount = 0;
    let failedCount = 0;
    const categoryStats: Record<string, { added: number; duplicates: number }> = {};

    // Process each category document
    for (const [category, newProducts] of productsByCategory) {
      const categoryId = normalizeCategoryId(category);
      const docRef = db.collection(COLLECTION_NAME).doc(categoryId);

      try {
        // Use transaction to safely read-then-write
        await db.runTransaction(async (transaction) => {
          const docSnap = await transaction.get(docRef);
          
          let existingProducts: Product[] = [];
          let existingIds = new Set<string>();

          if (docSnap.exists) {
            const data = docSnap.data();
            existingProducts = data?.items || [];
            existingIds = new Set(existingProducts.map(p => p.product_id));
          }

          // Filter out duplicates by product_id
          const productsToAdd: Product[] = [];
          let catDuplicates = 0;

          for (const product of newProducts) {
            if (existingIds.has(product.product_id)) {
              catDuplicates++;
              duplicateCount++;
            } else {
              productsToAdd.push({
                ...product,
                createdAt: new Date().toISOString(),
              });
              existingIds.add(product.product_id);
            }
          }

          // Merge new products with existing
          const mergedProducts = [...existingProducts, ...productsToAdd];

          // Update document
          transaction.set(docRef, {
            category: category,
            categoryId: categoryId,
            items: mergedProducts,
            count: mergedProducts.length,
            updatedAt: new Date().toISOString(),
          });

          successCount += productsToAdd.length;
          categoryStats[category] = {
            added: productsToAdd.length,
            duplicates: catDuplicates,
          };
        });
      } catch (err: any) {
        console.error(`Error processing category ${category}:`, err);
        failedCount += newProducts.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Upload completed`,
      stats: {
        total: products.length,
        success: successCount,
        duplicates: duplicateCount,
        failed: failedCount,
      },
      categoryStats,
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
    const productIds = new Set<string>();
    let duplicatesInFile = 0;

    products.forEach((product, index) => {
      const { valid, errors } = validateProduct(product, index);
      if (!valid) {
        allErrors.push(...errors);
      }
      if (product.phan_loai) {
        categories.add(product.phan_loai);
      }
      // Check for duplicates within the file itself
      if (product.product_id) {
        if (productIds.has(product.product_id)) {
          duplicatesInFile++;
        } else {
          productIds.add(product.product_id);
        }
      }
    });

    return NextResponse.json({
      success: true,
      valid: allErrors.length === 0,
      stats: {
        totalProducts: products.length,
        uniqueProducts: productIds.size,
        duplicatesInFile,
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
