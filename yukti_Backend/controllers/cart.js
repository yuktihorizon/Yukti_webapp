const Cart = require('../models/Cart');

exports.addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const itemIndex = cart.items.findIndex(item => item.productId === productId);

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  await cart.save();
  res.json(cart);
};

exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.query.userId });
  res.json(cart);
};

exports.removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.query.userId });

  cart.items = cart.items.filter(item => item.productId !== req.params.id);

  await cart.save();
  res.json(cart);
};
