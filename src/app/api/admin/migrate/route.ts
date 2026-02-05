import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

const OLD_COLLECTION = 'products';
const NEW_COLLECTION = 'products_by_category';

// Normalize category name to use as document ID
function normalizeCategoryId(category: string): string {
  return category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// POST: Migrate from old collection to new category-based structure
export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Firebase not configured' },
        { status: 500 }
      );
    }

    // Read all products from old collection
    const oldSnapshot = await db.collection(OLD_COLLECTION).get();
    
    if (oldSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No products to migrate',
        stats: { total: 0, migrated: 0, categories: 0 }
      });
    }

    // Group products by category
    const productsByCategory = new Map<string, any[]>();
    
    oldSnapshot.forEach((doc) => {
      const product: any = { ...doc.data(), id: doc.id };
      const category = product.phan_loai || 'uncategorized';
      
      if (!productsByCategory.has(category)) {
        productsByCategory.set(category, []);
      }
      productsByCategory.get(category)!.push(product);
    });

    // Write to new collection structure
    const batch = db.batch();
    let categoryCount = 0;

    for (const [category, products] of productsByCategory) {
      const categoryId = normalizeCategoryId(category);
      const docRef = db.collection(NEW_COLLECTION).doc(categoryId);
      
      // De-duplicate by product_id
      const uniqueProducts = new Map<string, any>();
      for (const product of products) {
        const id = product.product_id || product.id;
        if (id && !uniqueProducts.has(id)) {
          uniqueProducts.set(id, {
            ...product,
            product_id: id,
          });
        }
      }

      batch.set(docRef, {
        category: category,
        categoryId: categoryId,
        items: Array.from(uniqueProducts.values()),
        count: uniqueProducts.size,
        updatedAt: new Date().toISOString(),
        migratedAt: new Date().toISOString(),
      });
      
      categoryCount++;
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      stats: {
        total: oldSnapshot.size,
        categories: categoryCount,
        categoriesCreated: Array.from(productsByCategory.keys()),
      }
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET: Check migration status
export async function GET() {
  try {
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Firebase not configured' },
        { status: 500 }
      );
    }

    // Count products in old collection
    const oldSnapshot = await db.collection(OLD_COLLECTION).get();
    const oldCount = oldSnapshot.size;

    // Count products in new collection
    const newSnapshot = await db.collection(NEW_COLLECTION).get();
    let newCount = 0;
    const categories: string[] = [];
    
    newSnapshot.forEach((doc) => {
      const data = doc.data();
      newCount += data.count || 0;
      categories.push(data.category);
    });

    return NextResponse.json({
      success: true,
      oldCollection: {
        name: OLD_COLLECTION,
        count: oldCount,
        readsPerFetch: oldCount, // Each fetch = N reads
      },
      newCollection: {
        name: NEW_COLLECTION,
        productCount: newCount,
        categoryCount: newSnapshot.size,
        categories: categories,
        readsPerFetch: newSnapshot.size, // Each fetch = number of categories
      },
      savings: {
        readsReduction: `${oldCount} → ${newSnapshot.size}`,
        percentage: oldCount > 0 ? `${Math.round((1 - newSnapshot.size / oldCount) * 100)}%` : '0%',
      }
    });
  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
