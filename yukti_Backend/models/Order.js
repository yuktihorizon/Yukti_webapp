const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: String,
  items: [
    {
      productId: String,
      quantity: Number,
    }
  ],
  totalAmount: Number,
  paymentMethod: String,
  status: { type: String, default: 'Pending' }
});

module.exports = mongoose.model('Order', orderSchema);
