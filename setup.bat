@echo off
echo 🏠 Setting up Gruhapaaka E-Commerce Website...
echo ================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js (v18 or higher) first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm version:
npm --version

REM Install root dependencies
echo.
echo 📦 Installing root dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

REM Install backend dependencies
echo.
echo ⚙️ Installing backend dependencies...
cd backend
if not exist "package.json" (
    echo ❌ Backend package.json not found!
    pause
    exit /b 1
)
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

REM Install frontend dependencies
echo.
echo 🎨 Installing frontend dependencies...
cd frontend
if not exist "package.json" (
    echo ❌ Frontend package.json not found!
    pause
    exit /b 1
)
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

REM Check if .env file exists in backend
echo.
echo 🔧 Checking environment configuration...
if not exist "backend\.env" (
    echo ⚠️  Backend .env file not found. Creating template...
    (
        echo # MongoDB Configuration
        echo MONGODB_URI=mongodb://localhost:27017/gruhapaaka
        echo.
        echo # JWT Secret ^(change this in production^)
        echo JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
        echo.
        echo # Server Configuration
        echo PORT=5000
        echo NODE_ENV=development
        echo.
        echo # CORS Configuration ^(optional^)
        echo FRONTEND_URL=http://localhost:3000
    ) > backend\.env
    echo ✅ Created backend/.env template. Please update the values as needed.
) else (
    echo ✅ Backend .env file exists.
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Update backend/.env with your MongoDB URI and JWT secret
echo 2. Start the development servers:
echo    • Backend:  cd backend ^&^& npm run dev
echo    • Frontend: cd frontend ^&^& npm run dev
echo    • Or both:  npm run dev ^(from root directory^)
echo.
echo 🌐 Access the application:
echo    • Frontend: http://localhost:3000
echo    • Backend:  http://localhost:5000
echo.
echo 📚 For more information, see README.md
echo ================================================
pause
