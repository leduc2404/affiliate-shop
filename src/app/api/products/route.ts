import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import fs from 'fs';
import path from 'path';
import { Product } from '@/types';

const COLLECTION_NAME = 'products_by_category';

// Cache for products to reduce Firebase reads
let productsCache: {
  data: Product[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    // Check cache first
    if (productsCache && Date.now() - productsCache.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        products: productsCache.data,
        count: productsCache.data.length,
        source: 'cache',
      });
    }

    // Try Firebase first - read from category documents
    if (db) {
      try {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        
        if (!snapshot.empty) {
          const allProducts: any[] = [];
          
          // Each document contains an array of products for that category
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.items && Array.isArray(data.items)) {
              allProducts.push(...data.items);
            }
          });

          // Sort by createdAt descending
          allProducts.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });

          // Update cache
          productsCache = {
            data: allProducts,
            timestamp: Date.now(),
          };

          return NextResponse.json({
            success: true,
            products: allProducts,
            count: allProducts.length,
            source: 'firebase',
            categories: snapshot.size, // Number of category documents read
          });
        }
      } catch (firebaseError) {
        console.log('Firebase fetch failed, falling back to local files:', firebaseError);
      }
    }

    // Fallback to local JSON files
    const dataDir = path.join(process.cwd(), '..');
    
    const skipFiles = ['package.json', 'package-lock.json', 'tsconfig.json', 'shopee_cookies.json'];
    
    const files = fs.readdirSync(dataDir).filter(file => {
      return file.endsWith('.json') && !skipFiles.includes(file.toLowerCase());
    });

    let allProducts: Product[] = [];
    
    for (const file of files) {
      try {
        const filePath = path.join(dataDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const products = JSON.parse(content);
        
        if (Array.isArray(products)) {
          allProducts = [...allProducts, ...products];
        }
      } catch (err) {
        console.error(`Error reading ${file}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      products: allProducts,
      count: allProducts.length,
      source: 'local',
    });
  } catch (error) {
    console.error('Error loading products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load products' },
      { status: 500 }
    );
  }
}
