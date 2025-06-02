import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock database - In a real app, you'd use a proper database
const users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@spicehub.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: admin123
    role: 'admin' as const,
    phone: '+1234567890',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Customer User',
    email: 'user@spicehub.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: user123
    role: 'user' as const,
    phone: '+1234567891',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    // Validate input
    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    // Find user by email and role
    const user = users.find(u => u.email === email && u.role === role);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials or role' },
        { status: 401 }
      );
    }

    // For demo purposes, we'll accept both the hashed password and plain text
    const isValidPassword = 
      await bcrypt.compare(password, user.password) ||
      (role === 'admin' && password === 'admin123') ||
      (role === 'user' && password === 'user123');

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
