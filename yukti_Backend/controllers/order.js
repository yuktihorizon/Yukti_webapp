const Order = require('../models/Order');

exports.placeOrder = async (req, res) => {
  try {
    console.log('Incoming order request:', req.body); // ✅ Add this

    const { userId, items, totalAmount, paymentMethod } = req.body;

    if (!userId || !items?.length || !totalAmount || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const order = new Order({
      userId,
      items,
      totalAmount,
      paymentMethod,
      status: 'Pending'
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder); // ✅ ensure response is sent
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error while fetching order.' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};
