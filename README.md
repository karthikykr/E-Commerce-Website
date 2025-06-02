# Ecommerce App

A full-stack ecommerce application with separate frontend (Next.js) and backend (Express.js) services.

## Project Structure

```
ecommerce-app/
├── frontend/          # Next.js frontend application
├── backend/           # Express.js backend API
└── README.md          # This file
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB

## Running the Application

This project is structured with completely separate frontend and backend services. Each service has its own dependencies and can be run independently.

### Frontend (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

### Backend (Express.js)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your environment variables:
   ```bash
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

The backend API will be available at `http://localhost:5000`

## Building for Production

### Frontend
```bash
cd frontend
npm run build
npm start
```

### Backend
```bash
cd backend
npm start
```

## Development Workflow

1. Start MongoDB service on your system
2. Open two terminal windows/tabs
3. In the first terminal, run the backend:
   ```bash
   cd backend
   npm install  # First time only
   npm run dev
   ```
4. In the second terminal, run the frontend:
   ```bash
   cd frontend
   npm install  # First time only
   npm run dev
   ```

Both services will run independently and can be developed separately.
