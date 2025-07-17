# 🗄️ MongoDB Setup Guide for E-Commerce Website

## Quick Setup Options

### Option 1: MongoDB Community Server (Local Installation)

1. **Download MongoDB**
   - Visit: https://www.mongodb.com/try/download/community
   - Select your Windows version
   - Download the MSI installer

2. **Install MongoDB**
   - Run the downloaded MSI file
   - Choose "Complete" installation
   - Install as a Windows Service (recommended)
   - Install MongoDB Compass (GUI tool)

3. **Start MongoDB Service**
   ```cmd
   # MongoDB should start automatically as a service
   # To manually start/stop:
   net start MongoDB
   net stop MongoDB
   ```

4. **Verify Installation**
   - Open MongoDB Compass
   - Connect to: `mongodb://localhost:27017`
   - You should see the connection successful

### Option 2: MongoDB Atlas (Cloud Database)

1. **Create Free Account**
   - Visit: https://www.mongodb.com/atlas
   - Sign up for free tier (512MB storage)

2. **Create Cluster**
   - Choose "Shared" (free tier)
   - Select region closest to you
   - Create cluster (takes 1-3 minutes)

3. **Setup Database Access**
   - Go to "Database Access"
   - Add new database user
   - Choose username/password authentication
   - Give "Read and write to any database" permissions

4. **Setup Network Access**
   - Go to "Network Access"
   - Add IP Address
   - Choose "Allow access from anywhere" (0.0.0.0/0) for development

5. **Get Connection String**
   - Go to "Clusters"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

6. **Update .env File**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ecommerce_db?retryWrites=true&w=majority
   ```

## Testing Your MongoDB Connection

### Using Our Built-in Tools

1. **Test Connection**
   ```bash
   cd backend
   npm run check-mongodb
   ```

2. **Test Database Operations**
   ```bash
   npm run test-connection
   ```

### Using MongoDB Compass (GUI)

1. **Open MongoDB Compass**
2. **Connect to your database**
   - Local: `mongodb://localhost:27017`
   - Atlas: Use your connection string
3. **Create Database**
   - Database name: `ecommerce_db`
   - Collection name: `users`

## Current Status

✅ **Backend Server**: Running on http://localhost:5000
✅ **Frontend Server**: Running on http://localhost:3000
✅ **API Endpoints**: All configured and ready
⚠️ **MongoDB**: Needs to be installed and connected

## What Happens When You Connect MongoDB

Once MongoDB is connected, your e-commerce website will have:

### 🔐 **User Authentication**
- User registration and login
- Password hashing and security
- JWT token authentication
- User profiles and addresses

### 🛍️ **Product Management**
- Add, edit, delete products
- Product categories
- Image uploads
- Stock management
- Product reviews and ratings

### 🛒 **Shopping Features**
- Shopping cart functionality
- Wishlist management
- Order processing
- Order history and tracking

### 👨‍💼 **Admin Panel**
- Dashboard with statistics
- User management
- Product management
- Order management
- Sales analytics

## Quick Start After MongoDB Setup

1. **Restart Backend Server**
   ```bash
   cd backend
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Seed Sample Data** (Optional)
   ```bash
   npm run seed
   ```

3. **Test API Endpoints**
   ```bash
   npm run test-api
   ```

## Troubleshooting

### MongoDB Connection Issues

1. **Check if MongoDB is running**
   ```cmd
   # For Windows Service
   sc query MongoDB
   
   # Or check Task Manager for mongod.exe
   ```

2. **Check connection string in .env**
   - Make sure MONGODB_URI is correct
   - No extra spaces or characters
   - Password is URL-encoded if using special characters

3. **Firewall Issues**
   - MongoDB uses port 27017
   - Make sure it's not blocked by firewall

4. **Atlas Connection Issues**
   - Check network access settings
   - Verify database user credentials
   - Make sure IP is whitelisted

### Common Errors

- **"MongoNetworkError"**: MongoDB service not running
- **"Authentication failed"**: Wrong username/password
- **"Connection timeout"**: Network/firewall issues
- **"Database not found"**: Database will be created automatically

## Next Steps

1. **Choose your MongoDB option** (Local or Atlas)
2. **Follow the setup steps** above
3. **Update .env file** with correct connection string
4. **Restart the backend server**
5. **Your full e-commerce website will be ready!**

## Support

If you need help with MongoDB setup:
- MongoDB Documentation: https://docs.mongodb.com/
- MongoDB Community Forums: https://community.mongodb.com/
- MongoDB Atlas Support: https://support.mongodb.com/

Your e-commerce website is 95% complete - just add MongoDB and you're ready to go! 🚀
