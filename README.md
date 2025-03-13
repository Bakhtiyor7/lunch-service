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

   !!! Please make sure that MongoDB is installed in your machine!

   - This application will create the necessary MongoDB schema automatically
   - Please make sure to install the MongoDB before running the app!

   ### MongoDB Installation

#### Windows

1. Download the MongoDB Community Server from the [official website](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the installation wizard
3. Choose "Complete" installation
4. Check the box to install MongoDB Compass (optional but helpful GUI)
5. Complete the installation
6. MongoDB should start automatically as a Windows service

#### macOS

Using Homebrew:

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community
```

#### Linux (Ubuntu)

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create a list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Reload local package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod

# Verify MongoDB has started
sudo systemctl status mongod
```

#### Verify Installation

To verify MongoDB is running correctly:

1. Open a terminal or command prompt
2. Connect to MongoDB by typing: `mongosh`
3. You should see the MongoDB shell connect to localhost:27017

If you encounter any issues, please refer to the [official MongoDB documentation](https://www.mongodb.com/docs/manual/installation/).

4. Start the application:

   ```
   npm run start:dev
   ```

   - Application runs on port 3000

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

### Unit Testing

- run "npm test" to start unit testing
