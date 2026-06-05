const express = require('express');
const { placeOrder, getOrderById } = require('../controllers/order');

const router = express.Router();

router.post('/', placeOrder);
router.get('/:id', getOrderById);

module.exports = router;
