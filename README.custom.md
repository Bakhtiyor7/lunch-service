# Lunchlab API

Backend API for Lunchlab, a lunch box service for companies.

## Features

- User registration and login
- Admin product policy settings
- Product listing with user-specific pricing
- Order creation and lookup

## Tech Stack

- Node.js
- NestJS
- MongoDB
- Swagger for API documentation

## Running the Application

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file with the following variables:

   ```
   MONGODB_URI=mongodb://localhost:27017/lunchlab
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the application:

   ```
   npm run start:dev
   ```

## API Documentation

Swagger API documentation is available at: <http://localhost:3000/api>

## API Endpoints

### Auth

- POST /auth/signup - Register a new user
- POST /auth/login - User login

### Products

- POST /products - Get product list with user-specific pricing

### Orders

- POST /orders - Create a new order
- GET /orders?deliveryDate=YYYY-MM-DD - Get order by delivery date

### Admin

- POST /admin/product-policy - Set product policy for a user

## Implementation Details

### User Registration and Login

- User registration with validation
- Password hashing with crypto
- JWT-based authentication

### Product Policies

- Admin can set custom pricing and visibility for products per user
- Products are fetched from external API and modified based on user policies

### Order Management

- Orders can be created with multiple items
- Pricing is calculated based on user-specific product policies
- Orders can be retrieved by delivery date
