const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');

async function run() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/minimalist-store';
    console.log(`Connecting to database: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected successfully.');

    const orders = await Order.find({});
    console.log(`Found ${orders.length} total orders in the database. Validating product references...`);

    let deletedCount = 0;

    for (const order of orders) {
      let isBroken = false;
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product) {
          console.log(`Order ${order._id} references non-existent product ID ${item.product}.`);
          isBroken = true;
          break;
        }
      }

      if (isBroken) {
        console.log(`Deleting broken order: ${order._id}`);
        await Order.deleteOne({ _id: order._id });
        deletedCount++;
      }
    }

    console.log(`Clean up completed. Removed ${deletedCount} broken orders.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Clean up failed:', error);
    process.exit(1);
  }
}

run();
