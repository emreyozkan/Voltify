# Voltify

Voltify is a modern, full-stack webshop selling technology products. It features a multi-vendor marketplace structure, user authentication, product management, shopping cart, and Stripe payment integration.

## Tech Stack

-   **Frontend**: HTML, CSS (Voltify Theme), JavaScript
-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB Atlas
-   **Payments**: Stripe

## Features

-   User Authentication (Login/Register)
-   Product Search & Filtering
-   Shopping Cart & Checkout
-   Stripe Payments
-   User Profile & Order History
-   Seller Dashboard (Add/Manage Products)
-   Admin Panel (Manage Users)
-   Dark/Light Mode

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory and add the following:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 3. Seed Database

Import sample data (users and products):

```bash
npm run data:import
```

### 4. Run Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Visit `http://localhost:5000` in your browser.

## API Endpoints

-   `GET /api/products` - Get all products
-   `GET /api/products/:id` - Get single product
-   `POST /api/users/login` - Auth user & get token
-   `POST /api/users` - Register a new user
-   `POST /api/orders` - Create new order
-   `GET /api/orders/myorders` - Get logged in user orders
