# 🏠 Gruhapaaka E-Commerce Website

A modern, full-stack e-commerce platform for authentic homemade food products built with Next.js, Node.js, and MongoDB.

## 🌟 Features

### 🛍️ Customer Features
- **Product Browsing**: Browse products by categories with advanced filtering
- **Shopping Cart**: Add/remove items with quantity management
- **Wishlist**: Save favorite products for later
- **User Authentication**: Secure login/signup with JWT tokens
- **Order Management**: Place orders and track order history
- **Responsive Design**: Fully optimized for all device sizes

### 👨‍💼 Admin Features
- **Admin Dashboard**: Comprehensive admin panel
- **Product Management**: Add, edit, delete products with image upload
- **Order Management**: View and update order statuses
- **User Management**: Manage customer accounts
- **Analytics**: Sales and order analytics

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Context** - State management for auth, cart, wishlist

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd E-Commerce-Website
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**

   Create `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/gruhapaaka
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   ```

5. **Start the Application**

   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```
6.   **Format Code**:  
   ```bash 
   cd frontend | backend
   npm run format


7. **Access the Application**
   - 🌐 Frontend: http://localhost:3000
   - 🔧 Backend API: http://localhost:5000

## 📁 Project Structure

```
E-Commerce-Website/
├── 🎨 frontend/              # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Auth, Cart, Wishlist)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── ⚙️ backend/               # Node.js backend application
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utility functions
│   ├── server.js           # Server entry point
│   └── package.json
├── 📚 MOBILE_NAVBAR_ENHANCEMENTS.md  # Mobile responsiveness guide
└── 📖 README.md
```

## 🔐 Authentication System

JWT-based authentication with role-based access control:

### User Roles
- **👤 Customer**: Browse products, manage cart/wishlist, place orders
- **👑 Admin**: Full system access, manage products/orders/users

### Security Features
- Password hashing with bcryptjs
- JWT token authentication
- Protected routes and API endpoints
- Session management

## 🛒 Core Features

### 🛍️ Shopping Cart
- Persistent cart using React Context
- Real-time quantity updates
- Add/remove items functionality
- Cart count indicator
- Session persistence

### ❤️ Wishlist
- Save favorite products
- Quick add/remove from product cards
- Wishlist count indicator
- Easy access from navigation

### 📱 Mobile Responsiveness
- **Mobile-first design approach**
- **Responsive navbar with animated mobile menu**
- **Touch-optimized interface (44px+ touch targets)**
- **Smooth animations and transitions**
- **Consistent experience across all devices**

### 🎨 UI/UX Features
- Modern, clean design with orange/amber theme
- Smooth animations and micro-interactions
- Loading states and error handling
- Accessibility compliance (WCAG guidelines)
- Performance optimized

## 📱 Mobile Features

The application includes comprehensive mobile optimizations:

- ✅ **Responsive Navigation**: Animated hamburger menu with smooth transitions
- ✅ **Touch Targets**: All interactive elements meet 44px minimum size
- ✅ **Mobile Animations**: Custom CSS animations for mobile interactions
- ✅ **Keyboard Support**: ESC key and click-outside functionality
- ✅ **Performance**: GPU-accelerated animations and optimized rendering

## 🔧 Development

### Available Scripts

**Frontend:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

**Backend:**
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

### Code Quality
- **ESLint** - Code linting and style enforcement
- **TypeScript** - Type safety and better developer experience
- **Prettier** - Code formatting (recommended)

## 🚀 Deployment

### Frontend (Vercel - Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables in dashboard
3. Automatic deployment on push to main

### Backend (Railway/Heroku)
1. Create new app on platform
2. Set environment variables
3. Connect MongoDB Atlas for production
4. Deploy from GitHub

### Environment Variables
```env
# Backend
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
NODE_ENV=production

# Frontend (if needed)
NEXT_PUBLIC_API_URL=your-backend-url
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write responsive, mobile-first CSS
- Include proper error handling
- Add appropriate comments and documentation
- Test on multiple devices and browsers

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Next.js** team for the incredible React framework
- **Tailwind CSS** for the utility-first CSS framework
- **MongoDB** for the flexible NoSQL database
- **Vercel** for seamless deployment platform

## 📞 Support & Contact

- 📧 Email: support@gruhapaaka.com
- 🐛 Issues: Create an issue in this repository
- 💬 Discussions: Use GitHub Discussions for questions

---

<div align="center">

**🏠 Gruhapaaka - Authentic Homemade Food Products 🍽️**

*Made with ❤️ for food lovers everywhere*

</div>
