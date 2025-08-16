import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// In-memory storage for demo purposes
const userCarts: { [userId: string]: any[] } = {};

// DELETE - Clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Clear the user's cart
    userCarts[user.userId] = [];

    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart: {
          items: [],
          totalItems: 0,
          totalAmount: 0
        }
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
