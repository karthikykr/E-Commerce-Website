import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { products } from '@/data/products';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Mock cart storage (in production, use a database)
let userCarts: Record<string, any[]> = {};

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

// GET - Get user's cart
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userCart = userCarts[user.userId] || [];
    const cartWithProducts = userCart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        product,
        total: product ? product.price * item.quantity : 0
      };
    });

    const totalAmount = cartWithProducts.reduce((sum, item) => sum + item.total, 0);
    const totalItems = cartWithProducts.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      success: true,
      cart: {
        items: cartWithProducts,
        totalAmount,
        totalItems
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { productId, quantity = 1 } = await request.json();

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

    if (!product.inStock) {
      return NextResponse.json(
        { success: false, message: 'Product is out of stock' },
        { status: 400 }
      );
    }

    if (!userCarts[user.userId]) {
      userCarts[user.userId] = [];
    }

    const existingItemIndex = userCarts[user.userId].findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      const newQuantity = userCarts[user.userId][existingItemIndex].quantity + quantity;
      if (newQuantity > product.stockQuantity) {
        return NextResponse.json(
          { success: false, message: 'Not enough stock available' },
          { status: 400 }
        );
      }
      userCarts[user.userId][existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      if (quantity > product.stockQuantity) {
        return NextResponse.json(
          { success: false, message: 'Not enough stock available' },
          { status: 400 }
        );
      }
      userCarts[user.userId].push({
        id: Date.now().toString(),
        productId,
        quantity,
        addedAt: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Item added to cart successfully'
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { productId, quantity } = await request.json();

    if (!productId || quantity < 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID or quantity' },
        { status: 400 }
      );
    }

    if (!userCarts[user.userId]) {
      return NextResponse.json(
        { success: false, message: 'Cart not found' },
        { status: 404 }
      );
    }

    const itemIndex = userCarts[user.userId].findIndex(item => item.productId === productId);
    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Item not found in cart' },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      userCarts[user.userId].splice(itemIndex, 1);
    } else {
      const product = products.find(p => p.id === productId);
      if (product && quantity > product.stockQuantity) {
        return NextResponse.json(
          { success: false, message: 'Not enough stock available' },
          { status: 400 }
        );
      }
      userCarts[user.userId][itemIndex].quantity = quantity;
    }

    return NextResponse.json({
      success: true,
      message: 'Cart updated successfully'
    });
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
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

    if (!userCarts[user.userId]) {
      return NextResponse.json(
        { success: false, message: 'Cart not found' },
        { status: 404 }
      );
    }

    const itemIndex = userCarts[user.userId].findIndex(item => item.productId === productId);
    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Item not found in cart' },
        { status: 404 }
      );
    }

    userCarts[user.userId].splice(itemIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
