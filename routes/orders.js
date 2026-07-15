const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in the order' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      return res.status(400).json({ message: 'Please provide full shipping details' });
    }

    let calculatedTotal = 0;
    const processedItems = [];
    const productsToUpdate = [];

    // PASS 1: Verify all products exist and have sufficient stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.product} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.title}. Only ${product.stock} items left.` });
      }

      // Add to processed items with snapshotted fields
      processedItems.push({
        product: product._id,
        title: product.title,
        imageUrl: product.imageUrl,
        quantity: item.quantity,
        price: product.price
      });

      calculatedTotal += product.price * item.quantity;
      
      // Track updated product state for Pass 2
      product.stock -= item.quantity;
      productsToUpdate.push(product);
    }

    // PASS 2: Save the updated stock levels (all-or-nothing check succeeded)
    for (const product of productsToUpdate) {
      await product.save();
    }

    // Save order
    const order = new Order({
      user: req.userId,
      items: processedItems,
      totalAmount: Math.round(calculatedTotal * 100) / 100, // Round to 2 decimal places
      shippingAddress
    });

    await order.save();

    res.status(201).json(order);
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: 'Server error processing order' });
  }
});

// @route   GET /api/orders
// @desc    Get logged-in user's orders
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    const orders = await Order.find({ user: req.userId })
      .populate('items.product', 'title imageUrl')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Fetch Orders Error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

module.exports = router;
