const express = require('express');
const { createOrder, verifyPayment, getPaymentDetails } = require('../controllers/payment');

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/payment/:paymentId', getPaymentDetails);

module.exports = router;
