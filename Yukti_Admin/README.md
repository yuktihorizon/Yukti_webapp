# Yukti Admin Panel

A comprehensive admin panel for managing Yukti's e-commerce platform.

## Features

- **Authentication**: Secure JWT-based login system
- **Dashboard**: Overview with key metrics and quick navigation
- **Spotlight Management**: Add, edit, and delete creative spotlight entries
- **Product Management**: Create, edit, and delete products with image uploads
- **Order Management**: View and track customer orders with status filtering
- **Contact Management**: Read and search customer messages
- **Responsive Design**: Works on desktop and mobile devices

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5050/api
   ```

3. **Backend Setup**:
   Ensure the backend has these environment variables:
   ```env
   ADMIN_EMAIL=your-admin-email@example.com
   ADMIN_PASSWORD=your-admin-password
   ADMIN_JWT_SECRET=your-jwt-secret
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Access Admin Panel**:
   Open http://localhost:5175 in your browser

## Usage

### Login
- Use the admin credentials configured in your backend environment variables
- JWT token is automatically stored and used for API requests

### Dashboard
- View key metrics: total products, spotlight entries, contact messages, orders
- Quick navigation to all management sections

### Spotlight Management
- Add new creative profiles with images and social media links
- Edit existing entries
- Delete entries
- View all spotlight entries in a responsive grid

### Product Management
- Create new products with multiple images
- Select from existing categories
- Filter products by category
- Delete products
- View product details including pricing and descriptions

### Order Management
- View all customer orders with detailed information
- Search orders by customer name, email, or order ID
- Filter by order status (pending, processing, shipped, delivered, cancelled)
- View order items, pricing breakdown, and shipping addresses

### Contact Management
- Read customer messages from the contact form
- Search messages by name, email, subject, or content
- View message details including contact information and timestamps

## API Endpoints

The admin panel uses these backend endpoints:

- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/contacts` - Get contact messages
- `GET /api/admin/orders` - Get all orders
- `POST /api/admin/spotlight` - Create spotlight entry
- `DELETE /api/admin/spotlight/:id` - Delete spotlight entry
- `POST /api/admin/products` - Create product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/spotlight/getSpotlight` - Get spotlight entries
- `GET /api/products/getproducts` - Get all products
- `GET /api/category/getcategories` - Get product categories

## Security

- All admin routes require JWT authentication
- Tokens are automatically included in API requests
- Logout clears stored tokens
- Protected routes redirect to login if not authenticated

## Development

- Built with React 18 and Vite
- Uses React Router for navigation
- Axios for API communication
- Inline styles for simplicity (can be migrated to CSS modules or styled-components)

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting service

3. Update the `VITE_API_BASE_URL` environment variable to point to your production backend

## Support

For issues or questions, check the backend logs and ensure all environment variables are properly configured.
