import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { products } from '@/data/products';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Mock orders storage (in production, use a database)
let userOrders: Record<string, any[]> = {
  '2': [ // Sample orders for user
    {
      id: 'ORD-001',
      userId: '2',
      items: [
        {
          id: '1',
          productId: '1',
          quantity: 2,
          price: 12.99
        },
        {
          id: '2',
          productId: '3',
          quantity: 1,
          price: 14.99
        }
      ],
      total: 40.97,
      status: 'delivered',
      paymentStatus: 'paid',
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      paymentMethod: 'Credit Card',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      deliveredAt: new Date('2024-01-20')
    },
    {
      id: 'ORD-002',
      userId: '2',
      items: [
        {
          id: '3',
          productId: '2',
          quantity: 1,
          price: 18.99
        }
      ],
      total: 18.99,
      status: 'shipped',
      paymentStatus: 'paid',
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      paymentMethod: 'Credit Card',
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-26')
    }
  ]
};

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

// GET - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const orders = userOrders[user.userId] || [];
    const ordersWithProducts = orders.map(order => ({
      ...order,
      items: order.items.map((item: any) => {
        const product = products.find(p => p.id === item.productId);
        return {
          ...item,
          product
        };
      })
    }));

    // Sort by creation date (newest first)
    ordersWithProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      orders: ordersWithProducts
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { items, shippingAddress, paymentMethod } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order items are required' },
        { status: 400 }
      );
    }

    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: 'Shipping address and payment method are required' },
        { status: 400 }
      );
    }

    // Validate items and calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      if (!product.inStock || product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      });
    }

    const newOrder = {
      id: 'ORD-' + Date.now().toString().substr(-6),
      userId: user.userId,
      items: orderItems,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress,
      paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!userOrders[user.userId]) {
      userOrders[user.userId] = [];
    }

    userOrders[user.userId].push(newOrder);

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update order status (admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { orderId, status, paymentStatus } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Find order across all users
    let orderFound = false;
    for (const userId in userOrders) {
      const orderIndex = userOrders[userId].findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        if (status) userOrders[userId][orderIndex].status = status;
        if (paymentStatus) userOrders[userId][orderIndex].paymentStatus = paymentStatus;
        userOrders[userId][orderIndex].updatedAt = new Date();
        
        if (status === 'delivered') {
          userOrders[userId][orderIndex].deliveredAt = new Date();
        }
        
        orderFound = true;
        break;
      }
    }

    if (!orderFound) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
