import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Try Firebase first
    if (db) {
      try {
        const snapshot = await db.collection('products').get();
        
        if (!snapshot.empty) {
          const products: any[] = [];
          snapshot.forEach((doc) => {
            products.push({ ...doc.data(), id: doc.id });
          });

          return NextResponse.json({
            success: true,
            products,
            count: products.length,
            source: 'firebase',
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

    let allProducts: any[] = [];
    
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

