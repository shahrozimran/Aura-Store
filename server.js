require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./db');
const Product = require('./models/Product');
const seedDB = require('./seed');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// Fallback to index.html for undefined routes (for front-end SPA routing if needed, otherwise served directly)
app.use((req, res, next) => {
  // If request is for an API endpoint, return 404
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  // Otherwise serve public/index.html
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Setup Port
const PORT = process.env.PORT || 5000;

// Connect to Database and start server
async function startServer() {
  try {
    // Connect to database (either memory server or real mongo)
    await connectDB();

    // Check if database needs seeding
    const productCount = await Product.countDocuments();
    if (productCount < 41) {
      console.log('Database contains less than 41 products (or needs refresh). Re-seeding database...');
      await seedDB();
    } else {
      console.log('Database already has all 40+ products. Skipping seeding.');
    }

    // Start server listening
    app.listen(PORT, () => {
      console.log(`Server running in development mode on port ${PORT}`);
      console.log(`Open http://localhost:${PORT} in your browser to view the application.`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
