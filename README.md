# Minimalist E-Commerce Store

A premium, full-stack e-commerce application designed with modern, clean aesthetics (glassmorphism, subtle micro-animations, and responsive layout) built using Node.js, Express, MongoDB, and Vanilla HTML/CSS/JS.

---

## 🌟 Key Features

*   **Premium Visual Experience**: Crafted with HSL-tailored colors, smooth gradients, modern typography (Google Fonts Outfit/Inter), and response hover state micro-animations.
*   **Complete Authentication System**: Registration, login, and profile fetching secured using JSON Web Tokens (JWT) and bcrypt password hashing.
*   **Dynamic Product Catalog**: 40 premium products seeded across four curated categories:
    *   *Furniture* (Lounge Chairs, Travertine Tables, Ash wood Credenzas)
    *   *Decor* (Wabi-sabi Ceramic Vases, Concrete Bookends, Sculptures)
    *   *Lighting* (Brass Penders, Opal Globe Floor Lamps, Rechargeable LED Lamps)
    *   *Textiles* (European Linen throws, Waffle Towels, Belgian Flax duvet sets)
*   **Shopping Cart Management**: Add/remove products, modify item quantities, and get real-time price calculations.
*   **Checkout & Order Processing**: Collects shipping addresses, validates cart totals, creates persistent order entries in MongoDB, and deducts catalog inventory.
*   **Order History Dashboard**: Displays tracking history and statuses (`Pending`, `Processing`, `Shipped`, `Delivered`) for logged-in users.

---

## 🛠️ Tech Stack

*   **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+, Fetch API, Dynamic DOM Manipulation).
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB Community Server (v7.0.x) connected via Mongoose (ODM).
*   **Authentication**: JSON Web Tokens (`jsonwebtoken`), Password encryption (`bcryptjs`).

---

## 📁 Project Structure

```text
├── middleware/
│   └── auth.js             # JWT verification middleware
├── models/
│   ├── User.js             # Mongoose Schema for User accounts (pre-save bcrypt hashing)
│   ├── Product.js          # Mongoose Schema for Products & Reviews
│   └── Order.js            # Mongoose Schema for Checkout Orders & Shipping Address
├── public/                 # Static Frontend Web Assets
│   ├── css/
│   │   └── style.css       # Unified design token system & layout styles
│   ├── js/
│   │   ├── api.js          # Unified API handler client (sets Authorization headers)
│   │   ├── app.js          # Home catalog, filters, and rendering logic
│   │   ├── auth.js         # Register / Login submission logic
│   │   ├── cart.js         # Cart storage in localStorage & checkout redirection
│   │   ├── checkout.js     # Checkout form collection and shipping submission
│   │   └── product.js      # Individual product view page with reviews rendering
│   ├── auth.html           # Login / Register View
│   ├── cart.html           # Shopping Cart View
│   ├── checkout.html       # Shipping / Payment Form View
│   ├── index.html          # Homepage Store Catalog
│   ├── orders.html         # User Order History Dashboard
│   ├── privacy.html        # Privacy Policy static page
│   ├── product.html        # Product Detailed View page
│   └── terms.html          # Terms of Service static page
├── routes/                 # REST API Endpoints
│   ├── auth.js             # User Auth routes (/register, /login, /me)
│   ├── products.js         # Product retrieval routes
│   └── orders.js           # Order creation & history retrieval routes
├── .env                    # Environment configuration file
├── db.js                   # Mongoose Database connection setup
├── package.json            # Node project configuration & dependencies
├── server.js               # Entry point of the Express Server
└── start-mongo.bat         # Helper shortcut script to run MongoDB locally
```

---

## ⚙️ Prerequisites

Make sure you have the following installed on your system:
1.  **Node.js** (v18.x or higher) -> [Download Node.js](https://nodejs.org/)
2.  **MongoDB Community Server** (v7.0.x) -> [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)
    *   *Note: During MongoDB installation, make sure to **uncheck** the box that says "Install MongoDB as a Service" to avoid Windows permission errors.*

---

## 🚀 Installation & Setup

Follow these steps to set up and run the application locally:

### Step 1: Install Dependencies
Open your terminal (PowerShell or CMD) in the project directory and run:
```bash
npm install
```

### Step 2: Start MongoDB
1.  Double-click the **`start-mongo.bat`** file located in the root of the project folder.
2.  A terminal window will open showing that the MongoDB database has started using the path `C:\data\db`.
3.  **Keep this window open** while running and interacting with the project.

### Step 3: Configure Environment Variables
Verify that your **`.env`** file contains the following variables (this tells the app to connect to your running local MongoDB instance):
```env
PORT=5000
JWT_SECRET=minimalist_store_secret_jwt_key_2026
MONGODB_URI=mongodb://localhost:27017/minimalist-store
```

### Step 4: Run the Development Server
Open another terminal in your project directory and run:
```bash
npm run dev
```
The server will start and output the following connection logs:
```text
MongoDB Connected: localhost
Database Name: minimalist-store
Connected to database. Ready to handle requests.
Server running in development mode on port 5000
Open http://localhost:5000 in your browser to view the application.
```

---

## 🔑 Account Access

All user accounts, profiles, and order histories are self-managed. To test checkout flows and view order history:
1. Navigate to the **Login / Register** page.
2. Select **Register** to create a new user account.
3. Once registered, you will be logged in automatically and can place orders or access your personalized order history dashboard.

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth`)
*   `POST /register` - Registers a new user. Expects `{ username, email, password }`. Returns JWT token and user info.
*   `POST /login` - Authenticates user. Expects `{ email, password }`. Returns JWT token and user info.
*   `GET /me` - Returns logged-in user profile (private route, requires Bearer Token in Header).

### Products (`/api/products`)
*   `GET /` - Fetches all 40 products.
*   `GET /:id` - Fetches single product details including features and reviews.

### Orders (`/api/orders`)
*   `POST /` - Places a new checkout order (private route, requires Bearer Token in Header). Expects `{ items, totalAmount, shippingAddress }`.
*   `GET /` - Returns order history for current user (private route, requires Bearer Token in Header).
