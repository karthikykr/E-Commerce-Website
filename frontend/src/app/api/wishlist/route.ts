import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { products } from '@/data/products';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Mock wishlist storage (in production, use a database)
let userWishlists: Record<string, any[]> = {};

// Helper function to verify JWT token
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

// GET - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userWishlist = userWishlists[user.userId] || [];
    const wishlistWithProducts = userWishlist.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        product
      };
    }).filter(item => item.product); // Filter out products that no longer exist

    return NextResponse.json({
      success: true,
      wishlist: {
        items: wishlistWithProducts,
        totalItems: wishlistWithProducts.length
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    if (!userWishlists[user.userId]) {
      userWishlists[user.userId] = [];
    }

    const existingItem = userWishlists[user.userId].find(item => item.productId === productId);
    
    if (existingItem) {
      return NextResponse.json(
        { success: false, message: 'Item already in wishlist' },
        { status: 400 }
      );
    }

    userWishlists[user.userId].push({
      id: Date.now().toString(),
      productId,
      addedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Item added to wishlist successfully'
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!userWishlists[user.userId]) {
      return NextResponse.json(
        { success: false, message: 'Wishlist not found' },
        { status: 404 }
      );
    }

    const itemIndex = userWishlists[user.userId].findIndex(item => item.productId === productId);
    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Item not found in wishlist' },
        { status: 404 }
      );
    }

    userWishlists[user.userId].splice(itemIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Item removed from wishlist successfully'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
