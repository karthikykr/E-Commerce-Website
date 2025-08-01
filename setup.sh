#!/bin/bash

# Gruhapaaka E-Commerce Setup Script
# This script sets up the development environment for the project

echo "🏠 Setting up Gruhapaaka E-Commerce Website..."
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v18 or higher) first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install root dependencies
echo ""
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo ""
echo "⚙️ Installing backend dependencies..."
cd backend
if [ ! -f "package.json" ]; then
    echo "❌ Backend package.json not found!"
    exit 1
fi
npm install
cd ..

# Install frontend dependencies
echo ""
echo "🎨 Installing frontend dependencies..."
cd frontend
if [ ! -f "package.json" ]; then
    echo "❌ Frontend package.json not found!"
    exit 1
fi
npm install
cd ..

# Check if .env file exists in backend
echo ""
echo "🔧 Checking environment configuration..."
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Creating template..."
    cat > backend/.env << EOL
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/gruhapaaka

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration (optional)
FRONTEND_URL=http://localhost:3000
EOL
    echo "✅ Created backend/.env template. Please update the values as needed."
else
    echo "✅ Backend .env file exists."
fi

# Check if MongoDB is running (optional check)
echo ""
echo "🗄️ Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
        echo "✅ MongoDB is running and accessible."
    else
        echo "⚠️  MongoDB is not running or not accessible."
        echo "   Please start MongoDB service or update MONGODB_URI in backend/.env"
    fi
elif command -v mongo &> /dev/null; then
    if mongo --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
        echo "✅ MongoDB is running and accessible."
    else
        echo "⚠️  MongoDB is not running or not accessible."
        echo "   Please start MongoDB service or update MONGODB_URI in backend/.env"
    fi
else
    echo "⚠️  MongoDB client not found. Please ensure MongoDB is installed and running."
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your MongoDB URI and JWT secret"
echo "2. Start the development servers:"
echo "   • Backend:  cd backend && npm run dev"
echo "   • Frontend: cd frontend && npm run dev"
echo "   • Or both:  npm run dev (from root directory)"
echo ""
echo "🌐 Access the application:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend:  http://localhost:5000"
echo ""
echo "📚 For more information, see README.md"
echo "================================================"
