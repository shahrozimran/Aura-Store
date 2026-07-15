const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @route   GET /api/products
// @desc    Get all products (with optional filtering & sorting)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, sort, search } = req.query;
    let query = {};

    // Filtering by category
    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    // Filter by search query (case-insensitive title match)
    if (search) {
      query.title = { $regex: new RegExp(search, 'i') };
    }

    let productsQuery = Product.find(query);

    // Sorting by price
    if (sort) {
      if (sort === 'price-asc') {
        productsQuery = productsQuery.sort({ price: 1 });
      } else if (sort === 'price-desc') {
        productsQuery = productsQuery.sort({ price: -1 });
      }
    } else {
      // Default: sort by newest
      productsQuery = productsQuery.sort({ createdAt: -1 });
    }

    const products = await productsQuery;
    res.json(products);
  } catch (error) {
    console.error('Fetch Products Error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Fetch Product Detail Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error fetching product detail' });
  }
});

module.exports = router;
