import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'ID token is required' },
        { status: 400 }
      );
    }

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin not configured' },
        { status: 500 }
      );
    }

    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Check if user is admin (optional: check email or custom claims)
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && decodedToken.email !== adminEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Not an admin user' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
      },
    });
  } catch (error: any) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 401 }
    );
  }
}
