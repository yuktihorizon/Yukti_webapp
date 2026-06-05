const Razorpay = require('razorpay');

let razorpay;

// Initialize Razorpay only if environment variables are available
if (process.env.RAZOR_PAY_API_KEY && process.env.RAZOR_PAY_API_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZOR_PAY_API_KEY,
    key_secret: process.env.RAZOR_PAY_API_SECRET,
  });
}

exports.createOrder = async (req, res) => {
  if (!razorpay) {
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  const { amount, currency = 'INR', receipt } = req.body;

  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

exports.verifyPayment = async (req, res) => {
  if (!process.env.RAZOR_PAY_API_SECRET) {
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    // Verify the payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', process.env.RAZOR_PAY_API_SECRET)
      .update(text)
      .digest('hex');

    if (signature === razorpay_signature) {
      // Payment is verified
      res.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    } else {
      res.status(400).json({ error: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

exports.getPaymentDetails = async (req, res) => {
  if (!razorpay) {
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  const { paymentId } = req.params;

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ error: 'Failed to fetch payment details' });
  }
};
