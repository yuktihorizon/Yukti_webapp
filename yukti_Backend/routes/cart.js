const express = require('express');
const { addToCart, getCart, removeFromCart } = require('../controllers/cart');

const router = express.Router();

router.post('/', addToCart);
router.get('/', getCart);
router.delete('/:id', removeFromCart);

module.exports = router;
