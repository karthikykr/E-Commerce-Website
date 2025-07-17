# E-Commerce Backend Database Setup Guide

## Prerequisites

1. **MongoDB Installation**
   - Install MongoDB Community Server from [MongoDB Official Website](https://www.mongodb.com/try/download/community)
   - Or install MongoDB Compass (GUI) from [MongoDB Compass](https://www.mongodb.com/products/compass)

2. **Node.js Dependencies**
   - All required dependencies are already listed in `package.json`
   - Run `npm install` to install them

## Database Configuration

### 1. Environment Variables (.env file)

The `.env` file has been created with the following configuration:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ecommerce_db

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d

# Other configurations...
```

### 2. MongoDB Connection

The database connection is handled in `src/config/database.js`:
- Connects to MongoDB using Mongoose
- Handles connection errors gracefully
- Logs successful connections

### 3. Database Models

The following models are available:

#### Core Models:
- **User** (`src/models/User.js`) - User authentication and profiles
- **Product** (`src/models/Product.js`) - Product catalog
- **Category** (`src/models/Category.js`) - Product categories
- **Order** (`src/models/Order.js`) - Order management
- **Cart** (`src/models/Cart.js`) - Shopping cart
- **Wishlist** (`src/models/Wishlist.js`) - User wishlists

#### Additional Models:
- **Coupon** (`src/models/Coupon.js`) - Discount coupons
- **Notification** (`src/models/Notification.js`) - User notifications

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### Product Routes (`/api/products`)
- `GET /` - Get all products (with filtering, sorting, pagination)
- `GET /:id` - Get single product
- `POST /` - Create product (Admin only)
- `PUT /:id` - Update product (Admin only)
- `DELETE /:id` - Delete product (Admin only)

### Category Routes (`/api/categories`)
- `GET /` - Get all categories
- `GET /:id` - Get single category
- `POST /` - Create category (Admin only)
- `PUT /:id` - Update category (Admin only)
- `DELETE /:id` - Delete category (Admin only)

### Order Routes (`/api/orders`)
- `GET /` - Get user orders
- `GET /:id` - Get single order
- `POST /` - Create new order
- `PUT /:id/status` - Update order status

### Cart Routes (`/api/cart`)
- `GET /` - Get user cart
- `POST /add` - Add item to cart
- `PUT /update` - Update cart item
- `DELETE /remove/:productId` - Remove item from cart
- `DELETE /clear` - Clear entire cart

### Wishlist Routes (`/api/wishlist`)
- `GET /` - Get user wishlist
- `POST /add` - Add item to wishlist
- `DELETE /remove/:productId` - Remove item from wishlist

### Review Routes (`/api/reviews`)
- `GET /product/:productId` - Get product reviews
- `POST /product/:productId` - Add product review
- `PUT /:reviewId` - Update review
- `DELETE /:reviewId` - Delete review

### Admin Routes (`/api/admin`)
- Dashboard statistics
- User management
- Order management
- Product management
- Category management

## Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start MongoDB
- Start MongoDB service on your system
- Or use MongoDB Atlas (cloud database)

### 3. Test Database Connection
```bash
node test-connection.js
```

### 4. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 5. Seed Database (Optional)
```bash
npm run seed
```

## Database Features

### User Authentication
- Multiple auth methods: email, mobile, admin ID
- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control (user/admin)

### Product Management
- Comprehensive product schema with images, reviews, ratings
- Category-based organization
- Stock management with low stock alerts
- SEO-friendly slugs and metadata
- Advanced search and filtering

### Order Processing
- Complete order lifecycle management
- Multiple payment methods support
- Order status tracking
- Shipping address management

### Shopping Cart & Wishlist
- Persistent cart across sessions
- Wishlist functionality
- Quantity management

### Review System
- Product reviews and ratings
- Verified purchase reviews
- Average rating calculation

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator
- CORS configuration
- Helmet for security headers
- Rate limiting ready

## Performance Optimizations

- Database indexing for frequently queried fields
- Pagination for large datasets
- Efficient population of related documents
- Virtual fields for calculated values

## Monitoring & Logging

- Morgan for HTTP request logging
- Error handling middleware
- Health check endpoint (`/api/health`)
- Connection status monitoring

## Next Steps

1. Update JWT_SECRET in production
2. Configure email service for notifications
3. Set up payment gateway (Stripe configuration included)
4. Configure file upload for product images
5. Set up proper logging in production
6. Configure backup strategy for MongoDB
