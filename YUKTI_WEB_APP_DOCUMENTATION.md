# Yukti Web Application - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [Installation & Setup](#installation--setup)
6. [Environment Configuration](#environment-configuration)
7. [API Documentation](#api-documentation)
8. [Frontend Components](#frontend-components)
9. [Database Schema](#database-schema)
10. [Payment Integration](#payment-integration)
11. [Responsive Design](#responsive-design)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**Yukti** is a modern e-commerce platform specializing in furniture and home decor products. The application features a responsive design, secure payment processing, dynamic product management, and an integrated spotlight section for creative profiles.

### Key Highlights
- 🛍️ **E-commerce Platform** with product catalog and shopping cart
- 💳 **Secure Payment Processing** via Razorpay integration
- 📱 **Fully Responsive Design** optimized for all devices
- ⭐ **Creative Spotlight** featuring influencers and creators
- 🔍 **Advanced Search & Filtering** capabilities
- 📧 **Contact Management** system
- 🎨 **Modern UI/UX** with smooth animations

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│   Port: 5173    │    │   Port: 5050    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Directory Structure
```
yukti-git/
├── yukti_Backend/           # Backend API server
│   ├── config/             # Configuration files
│   ├── controllers/        # Business logic
│   ├── models/            # Database schemas
│   ├── routes/            # API endpoints
│   ├── scripts/           # Database seeding
│   └── server.js          # Main server file
├── Yukti_Frontend/         # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS files
│   │   └── assets/        # Images and media
│   └── public/            # Static assets
└── Yukti_Admin/           # Admin panel (separate app)
```

---

## ✨ Features

### 🛍️ E-commerce Features
1. **Product Catalog**
   - Dynamic product listing with categories
   - Product details with image galleries
   - Price and availability tracking
   - Product search and filtering

2. **Shopping Cart**
   - Add/remove products
   - Quantity management
   - Real-time price calculation
   - Persistent cart state

3. **Checkout Process**
   - Multi-step checkout form
   - Dynamic state/city selection
   - Address validation
   - Order summary

4. **Payment Processing**
   - Razorpay integration
   - Secure payment gateway
   - Order confirmation
   - Payment verification

### 🎨 Creative Spotlight
1. **Creator Profiles**
   - Featured influencers and creators
   - Social media integration
   - Profile descriptions and media links
   - Dynamic content management

### 📱 User Experience
1. **Responsive Design**
   - Mobile-first approach
   - Tablet and desktop optimization
   - Touch-friendly interfaces
   - Adaptive layouts

2. **Navigation**
   - Intuitive menu system
   - Breadcrumb navigation
   - Search functionality
   - Quick access to key features

3. **Animations & Interactions**
   - Smooth page transitions
   - Hover effects
   - Loading states
   - Micro-interactions

### 📧 Communication
1. **Contact System**
   - Contact form with validation
   - Message storage and management
   - Email notifications
   - Response tracking

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Framer Motion** - Animation library
- **React Toastify** - Notification system
- **Context API** - State management
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### External Services
- **Cloudinary** - Image storage and optimization
- **Razorpay** - Payment gateway
- **Resend** - Email service

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Git

### Backend Setup
```bash
# Clone the repository
git clone <repository-url>
cd yukti-git/yukti_Backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the server
npm start
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd ../Yukti_Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup
```bash
# Run database seeding scripts
cd yukti_Backend
npm run seed:service
npm run seed:spotlight
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables
```env
# Server Configuration
PORT=5050
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/yukti

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Payment Gateway
RAZOR_PAY_API_KEY=your_razorpay_key
RAZOR_PAY_API_SECRET=your_razorpay_secret

# Image Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service
RESEND_API_KEY=your_resend_key

# Admin Authentication
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin_password
ADMIN_JWT_SECRET=your_jwt_secret
```

### Frontend Environment Variables
```env
# Development Server
VITE_PORT=5173

# API Configuration
VITE_API_BASE_URL=http://localhost:5050/api

# Payment Gateway
VITE_APP_RAZOR_PAY_API_KEY=your_razorpay_key

# Cloudinary
VITE_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Environment
VITE_APP_NODE_ENV=development
```

---

## 📡 API Documentation

### Authentication Endpoints
```
POST /api/admin/login
- Admin authentication
- Returns JWT token
```

### Product Endpoints
```
GET /api/products/getproducts
- Fetch all products
- Supports filtering and pagination

GET /api/products/:id
- Get product by ID

POST /api/products
- Create new product (admin only)

DELETE /api/products/:id
- Delete product (admin only)
```

### Category Endpoints
```
GET /api/category/getcategories
- Fetch all categories

GET /api/category/:id
- Get category by ID
```

### Cart Endpoints
```
POST /api/cart/add
- Add item to cart

GET /api/cart/getcart
- Get cart items

DELETE /api/cart/remove/:id
- Remove item from cart
```

### Order Endpoints
```
POST /api/orders/create
- Create new order

GET /api/orders/:id
- Get order by ID

GET /api/admin/orders
- Get all orders (admin only)
```

### Payment Endpoints
```
POST /api/payment/create-order
- Create Razorpay order

POST /api/payment/verify
- Verify payment signature

GET /api/payment/:paymentId
- Get payment details
```

### Location Endpoints
```
GET /api/location/states
- Get all Indian states

GET /api/location/cities/:state
- Get cities for specific state

GET /api/location/all
- Get all states and cities
```

### Spotlight Endpoints
```
GET /api/spotlight/getSpotlight
- Get all spotlight entries

POST /api/admin/spotlight
- Create spotlight entry (admin only)

DELETE /api/admin/spotlight/:id
- Delete spotlight entry (admin only)
```

### Contact Endpoints
```
POST /api/contact/sendmessage
- Send contact message

GET /api/admin/contacts
- Get all messages (admin only)
```

---

## 🎨 Frontend Components

### Core Components
1. **Navbar** - Main navigation with cart and search
2. **Footer** - Site footer with links and information
3. **ProductCard** - Individual product display
4. **ProductSlider** - Carousel for featured products
5. **CartContext** - Global cart state management
6. **SearchContext** - Search functionality

### Page Components
1. **Home** - Landing page with hero and featured products
2. **Products** - Product catalog with filtering
3. **ProductDetails** - Detailed product view with image modal
4. **Cart** - Shopping cart management
5. **Checkout** - Multi-step checkout process
6. **ThankYou** - Order confirmation page
7. **About** - Company information
8. **Contact** - Contact form
9. **Spotlight** - Creative profiles showcase
10. **Search** - Search results page

### Styling System
- **Global CSS** - Base styles and variables
- **Component CSS** - Specific component styling
- **Tailwind CSS** - Utility classes
- **Responsive Design** - Mobile-first approach

---

## 🗄️ Database Schema

### Product Schema
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: { type: ObjectId, ref: 'Category' },
  images: [String],
  thumbnails: [String],
  specifications: Object,
  dimensions: Object,
  inStock: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Category Schema
```javascript
{
  name: String,
  slug: String,
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```javascript
{
  orderId: String,
  customerName: String,
  customerEmail: String,
  items: [{
    product: { type: ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  subtotal: Number,
  shipping: Number,
  total: Number,
  shippingAddress: {
    address: String,
    apartment: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String
  },
  status: String,
  paymentId: String,
  createdAt: Date
}
```

### Spotlight Schema
```javascript
{
  name: String,
  role: String,
  description: String,
  imageUrl: String,
  mediaUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### ContactMessage Schema
```javascript
{
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  subject: String,
  message: String,
  createdAt: Date
}
```

---

## 💳 Payment Integration

### Razorpay Integration
1. **Order Creation**
   - Generate order on Razorpay
   - Store order details
   - Return order ID to frontend

2. **Payment Processing**
   - Handle payment initiation
   - Process payment verification
   - Update order status

3. **Security Features**
   - Signature verification
   - Payment validation
   - Error handling

### Payment Flow
```
1. User adds items to cart
2. Proceeds to checkout
3. Fills shipping information
4. Creates Razorpay order
5. Completes payment
6. Verifies payment signature
7. Creates order in database
8. Shows confirmation page
```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Design Principles
1. **Mobile-First Approach**
   - Start with mobile design
   - Scale up for larger screens

2. **Fluid Typography**
   - Use `clamp()` for responsive text
   - Maintain readability across devices

3. **Flexible Layouts**
   - CSS Grid and Flexbox
   - Adaptive component sizing

4. **Touch-Friendly**
   - Minimum 44px touch targets
   - Proper spacing for mobile

### Key Responsive Features
- **Hamburger Menu** - Mobile navigation
- **Image Optimization** - Responsive images
- **Form Adaptation** - Mobile-friendly forms
- **Touch Interactions** - Swipe gestures
- **Performance** - Optimized for mobile networks

---

## 🚀 Deployment & Hosting

### Hosting Architecture Analysis

#### Application Structure
- **Frontend**: React SPA (Single Page Application)
- **Backend**: Node.js/Express API server
- **Database**: MongoDB
- **File Storage**: Cloudinary (images)
- **Payment**: Razorpay integration

#### Recommended Hosting Solutions

##### Option 1: Railway (Recommended for Development/Startup)

**Why Railway is Perfect for Yukti:**

✅ **Advantages:**
- **Simple Deployment**: Git-based deployment
- **Automatic Scaling**: Built-in scaling capabilities
- **Database Included**: MongoDB support
- **SSL Certificates**: Automatic HTTPS
- **Cost Effective**: $5-50/month
- **Developer Friendly**: Easy setup and configuration

💰 **Cost Breakdown:**
- **Hobby Plan**: $5/month (512MB RAM)
- **Pro Plan**: $20/month (2GB RAM)
- **Custom**: $50+/month (4GB+ RAM)

🚀 **Railway Setup:**
```bash
# 1. Go to railway.app
# 2. Connect your GitHub account
# 3. Import your repository
# 4. Railway auto-detects your app
# 5. Configure environment variables
# 6. Deploy automatically on git push
```

##### Option 2: AWS (Recommended for Production)

**Why AWS is Best for Production:**

✅ **Advantages:**
- **Scalability**: Auto-scaling for traffic spikes
- **Global CDN**: CloudFront for fast image delivery
- **Database**: MongoDB Atlas integration
- **Security**: Advanced security features
- **Cost Control**: Pay-as-you-use model
- **Monitoring**: CloudWatch for performance tracking

🏗️ **AWS Architecture:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   S3 + CloudFront│◄──►│   EC2/ECS       │◄──►│   MongoDB Atlas │
│   (Static Host) │    │   (API Server)  │    │   (Managed DB)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

💰 **Estimated Monthly Cost:**
- **Small Scale**: $50-150/month
- **Medium Scale**: $200-500/month
- **Large Scale**: $500+/month

🔧 **AWS Setup:**
```bash
# Frontend Deployment
- S3 Bucket for static files
- CloudFront for CDN
- Route 53 for domain management

# Backend Deployment
- EC2 instance or ECS containers
- Application Load Balancer
- Auto Scaling Group

# Database
- MongoDB Atlas (M10 tier)
- Automated backups
- Global distribution
```

##### Option 3: Vercel + Railway (Hybrid Approach)

**Why This Combination Works:**

✅ **Advantages:**
- **Frontend**: Vercel's excellent React hosting
- **Backend**: Railway's simple API hosting
- **Cost Effective**: $0-30/month total
- **Performance**: Global CDN for frontend
- **Easy Setup**: Minimal configuration

💰 **Cost Breakdown:**
- **Vercel**: $0-20/month (Hobby/Pro)
- **Railway**: $5-20/month
- **Total**: $5-40/month

##### Option 4: Hostinger (Budget Option)

**Why Hostinger for Budget:**

✅ **Advantages:**
- **Affordable**: $2-10/month
- **Easy Setup**: cPanel interface
- **Good Support**: 24/7 customer service
- **SSL Included**: Free SSL certificates

❌ **Limitations:**
- **Limited Node.js Support**: Shared hosting limitations
- **No Auto-scaling**: Manual scaling required
- **Performance**: Slower than cloud providers
- **Database**: Limited MongoDB support

### Cost Comparison

| Platform | Monthly Cost | Setup Difficulty | Scalability | Support |
|----------|-------------|------------------|-------------|---------|
| **Railway** | $5-50 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **AWS** | $50-500+ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Vercel + Railway** | $5-40 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Hostinger** | $2-10 | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

### Recommended Deployment Strategy

#### Phase 1: Railway (Current Stage)
**Perfect for startups and MVPs**
- **Cost**: $5-20/month
- **Setup**: 30 minutes
- **Scalability**: Good for 1K-10K users

#### Phase 2: AWS (Growth Stage)
**Enterprise-grade infrastructure**
- **Cost**: $200-500/month
- **Setup**: 2-4 hours
- **Scalability**: 10K-100K+ users

#### Phase 3: Multi-cloud (Enterprise)
**Global distribution and redundancy**
- **Cost**: $1000+/month
- **Setup**: 1-2 days
- **Scalability**: 100K+ users globally

### Production Build

#### Frontend Build
```bash
# Navigate to frontend directory
cd Yukti_Frontend

# Install dependencies
npm install

# Build for production
npm run build

# The build output will be in the 'dist' folder
```

#### Backend Preparation
```bash
# Navigate to backend directory
cd yukti_Backend

# Install production dependencies
npm install --production

# Ensure all environment variables are set
# Test the application
npm start
```

### Environment Setup

#### 1. Database Configuration
- **MongoDB Atlas**: Set up cloud database
- **Connection String**: Update MONGO_URI
- **Backup Strategy**: Enable automated backups
- **Security**: Configure IP whitelist

#### 2. Environment Variables
```env
# Production Environment Variables
NODE_ENV=production
PORT=5050
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/yukti
FRONTEND_URL=https://yourdomain.com

# Payment Gateway
RAZOR_PAY_API_KEY=your_production_razorpay_key
RAZOR_PAY_API_SECRET=your_production_razorpay_secret

# Image Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Email Service
RESEND_API_KEY=your_resend_key

# Admin Authentication
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure_password
ADMIN_JWT_SECRET=your_secure_jwt_secret
```

#### 3. Domain & SSL Configuration
- **Custom Domain**: Point to hosting provider
- **SSL Certificate**: Enable HTTPS
- **DNS Configuration**: Set up A/CNAME records
- **CDN**: Configure Cloudinary for images

#### 4. Performance Optimization
- **Image Optimization**: WebP format, lazy loading
- **Code Splitting**: Route-based code splitting
- **Caching**: Browser and CDN caching
- **Compression**: Gzip compression
- **Minification**: CSS/JS minification

### Railway Deployment Guide

#### Step 1: Prepare Your Application
```bash
# Ensure your package.json has correct scripts
{
  "scripts": {
    "start": "node server.js",
    "build": "npm install"
  }
}
```

#### Step 2: Set Up Railway
1. **Visit**: railway.app
2. **Sign Up**: Using GitHub account
3. **New Project**: Create new project
4. **Connect Repository**: Link your GitHub repo
5. **Auto-Deploy**: Railway detects your app automatically

#### Step 3: Configure Environment Variables
In Railway dashboard, add these variables:
```env
PORT=5050
MONGO_URI=your_mongodb_atlas_uri
RAZOR_PAY_API_KEY=your_razorpay_key
RAZOR_PAY_API_SECRET=your_razorpay_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RESEND_API_KEY=your_resend_key
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
ADMIN_JWT_SECRET=your_jwt_secret
```

#### Step 4: Deploy Frontend (Vercel)
1. **Visit**: vercel.com
2. **Import Project**: Connect GitHub repository
3. **Configure Build**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. **Environment Variables**: Add frontend variables
5. **Deploy**: Automatic deployment on push

### AWS Deployment Guide

#### Step 1: Set Up AWS Account
1. **Create Account**: aws.amazon.com
2. **IAM User**: Create deployment user
3. **Access Keys**: Generate access keys
4. **Billing**: Set up billing alerts

#### Step 2: Frontend Deployment (S3 + CloudFront)
```bash
# Create S3 bucket
aws s3 mb s3://yukti-frontend

# Upload build files
aws s3 sync dist/ s3://yukti-frontend

# Configure static website hosting
aws s3 website s3://yukti-frontend --index-document index.html

# Create CloudFront distribution
# Configure custom domain and SSL
```

#### Step 3: Backend Deployment (EC2)
```bash
# Launch EC2 instance
# Configure security groups
# Install Node.js and PM2
# Deploy application
# Set up load balancer
# Configure auto-scaling
```

#### Step 4: Database Setup (MongoDB Atlas)
1. **Create Cluster**: MongoDB Atlas
2. **Network Access**: Configure IP whitelist
3. **Database Access**: Create user
4. **Connection String**: Update environment variables

### Monitoring & Maintenance

#### Performance Monitoring
- **Frontend**: Lighthouse, WebPageTest
- **Backend**: New Relic, DataDog
- **Database**: MongoDB Atlas monitoring
- **Uptime**: Pingdom, UptimeRobot

#### Security Measures
- **SSL/TLS**: Force HTTPS
- **CORS**: Configure allowed origins
- **Rate Limiting**: Implement API rate limits
- **Input Validation**: Sanitize all inputs
- **Dependencies**: Regular security updates

#### Backup Strategy
- **Database**: Daily automated backups
- **Code**: Git repository backup
- **Files**: Cloudinary backup
- **Configuration**: Environment variables backup

### Migration Strategy

#### From Development to Production
1. **Environment Variables**: Update all production values
2. **Database**: Set up production MongoDB
3. **Domain**: Configure custom domain
4. **SSL**: Enable HTTPS
5. **Testing**: Comprehensive testing
6. **Deployment**: Deploy to production
7. **Monitoring**: Set up monitoring tools

#### Scaling Strategy
1. **Start Small**: Begin with Railway/Vercel
2. **Monitor Growth**: Track user metrics
3. **Optimize Performance**: Identify bottlenecks
4. **Scale Up**: Migrate to AWS when needed
5. **Global Distribution**: Multi-region deployment

---

## 🔧 Troubleshooting

### Common Issues

#### Backend Server Not Starting
```bash
# Check if port is in use
lsof -i :5050

# Kill existing process
pkill -f "node.*server.js"

# Start server from correct directory
cd yukti_Backend && node server.js
```

#### CORS Errors
```bash
# Ensure CORS is configured for all origins
# Check server.js CORS configuration
```

#### Database Connection Issues
```bash
# Verify MongoDB connection string
# Check network connectivity
# Ensure database is running
```

#### Payment Integration Issues
```bash
# Verify Razorpay credentials
# Check environment variables
# Test with Razorpay test mode
```

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development DEBUG=* node server.js
```

### Performance Monitoring
- **Frontend**: React DevTools, Lighthouse
- **Backend**: Node.js profiling, MongoDB monitoring
- **Network**: Chrome DevTools Network tab

---

## 📞 Support

### Development Team
- **Frontend Developer**: React, Vite, Tailwind CSS
- **Backend Developer**: Node.js, Express, MongoDB
- **DevOps**: Deployment, CI/CD, Monitoring

### Contact Information
- **Email**: support@yukti.com
- **Documentation**: This file
- **Repository**: Git repository URL

### Maintenance
- **Regular Updates**: Dependencies and security patches
- **Backup Strategy**: Database and file backups
- **Monitoring**: Performance and error tracking
- **Testing**: Unit tests and integration tests

---

## 📄 License

This project is proprietary software developed for Yukti. All rights reserved.

---

*Last Updated: December 2024*
*Version: 1.0.0*
