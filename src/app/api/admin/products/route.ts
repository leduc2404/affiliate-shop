import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Product } from '@/types';

const COLLECTION_NAME = 'products';

// GET: Fetch all products
export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Firebase not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limitParam = parseInt(searchParams.get('limit') || '100');

    let snapshot;
    
    if (category) {
      snapshot = await db.collection(COLLECTION_NAME)
        .where('phan_loai', '==', category)
        .limit(limitParam)
        .get();
    } else {
      snapshot = await db.collection(COLLECTION_NAME)
        .limit(limitParam)
        .get();
    }

    const products: Product[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        phan_loai: data.phan_loai || '',
        title: data.title || '',
        image: data.image || '',
        product_id: doc.id,
        rating: data.rating || 0,
        link: data.link || '',
        price_low: data.price_low || '',
        price_high: data.price_high || '',
        sold: data.sold || '',
      });
    });

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error: any) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Add a single product
export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Firebase not configured' },
        { status: 500 }
      );
    }

    const product: Product = await request.json();

    // Validate required fields
    const requiredFields = ['phan_loai', 'title', 'image', 'link', 'price_low'];
    for (const field of requiredFields) {
      if (!product[field as keyof Product]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Use product_id as document ID if available
    const docId = product.product_id || db.collection(COLLECTION_NAME).doc().id;
    
    await db.collection(COLLECTION_NAME).doc(docId).set({
      ...product,
      product_id: docId,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Product added successfully',
      productId: docId,
    });
  } catch (error: any) {
    console.error('Add product error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update a product
export async function PUT(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Firebase not configured' },
        { status: 500 }
      );
    }

    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await db.collection(COLLECTION_NAME).doc(id).update({
      ...updateData,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a product
export async function DELETE(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Firebase not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await db.collection(COLLECTION_NAME).doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
