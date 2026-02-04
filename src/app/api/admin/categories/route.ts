import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

const COLLECTION_NAME = 'products';

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Firebase not configured', categories: [], total: 0 },
        { status: 200 }
      );
    }

    // Get all products and count by category
    const snapshot = await db.collection(COLLECTION_NAME).get();
    const categoryCount: Record<string, number> = {};
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.phan_loai) {
        categoryCount[data.phan_loai] = (categoryCount[data.phan_loai] || 0) + 1;
      }
    });

    // Convert to array and sort by count
    const categoryStats = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      categories: categoryStats,
      total: snapshot.size,
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, error: error.message, categories: [], total: 0 },
      { status: 500 }
    );
  }
}

