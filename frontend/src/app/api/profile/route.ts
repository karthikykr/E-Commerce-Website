import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Mock users database (in production, use a proper database)
const users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@spicehub.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'admin' as const,
    phone: '+1234567890',
    address: {
      street: '123 Admin Street',
      city: 'Admin City',
      state: 'AC',
      zipCode: '12345',
      country: 'USA',
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Customer User',
    email: 'user@spicehub.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'user' as const,
    phone: '+1234567891',
    address: {
      street: '456 Customer Avenue',
      city: 'Customer City',
      state: 'CC',
      zipCode: '67890',
      country: 'USA',
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Helper function to verify JWT token
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token =
    authHeader?.replace('Bearer ', '') ||
    request.cookies.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

// GET - Get user profile
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userProfile = users.find((u) => u.id === user.userId);
    if (!userProfile) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data without password
    const { password, ...userWithoutPassword } = userProfile;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { name, phone, address, currentPassword, newPassword } =
      await request.json();

    const userIndex = users.findIndex((u) => u.id === user.userId);
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // If updating password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          {
            success: false,
            message: 'Current password is required to set new password',
          },
          { status: 400 }
        );
      }

      const isValidPassword = await bcrypt.compare(
        currentPassword,
        users[userIndex].password
      );
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          {
            success: false,
            message: 'New password must be at least 6 characters long',
          },
          { status: 400 }
        );
      }

      // Hash new password
      const saltRounds = 10;
      users[userIndex].password = await bcrypt.hash(newPassword, saltRounds);
    }

    // Update other fields
    if (name) users[userIndex].name = name;
    if (phone) users[userIndex].phone = phone;
    if (address) {
      users[userIndex].address = {
        ...users[userIndex].address,
        ...address,
      };
    }

    users[userIndex].updatedAt = new Date();

    // Return updated user data without password
    const { password, ...userWithoutPassword } = users[userIndex];

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user account
export async function DELETE(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Password is required to delete account' },
        { status: 400 }
      );
    }

    const userIndex = users.findIndex((u) => u.id === user.userId);
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      password,
      users[userIndex].password
    );
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Password is incorrect' },
        { status: 400 }
      );
    }

    // Remove user (in production, you might want to soft delete)
    users.splice(userIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
