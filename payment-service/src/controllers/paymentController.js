const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/paymentModel');
const { errorHandler } = require('../utils/paymentUtils');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createPaymentOrder = async (req, res) => {
  const { bookingId, amount } = req.body;
  try {
    const options = {
      amount: amount * 100, // Convert to paise (Razorpay uses smallest currency unit)
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      payment_capture: 1, // Auto-capture payment
    };

    const order = await razorpay.orders.create(options);
    const payment = new Payment({
      bookingId,
      amount,
      razorpayOrderId: order.id,
      status: 'pending',
    });
    await payment.save();

    res.status(201).json({ order, payment });
  } catch (error) {
    errorHandler(res, error);
  }
};

exports.verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  try {
    const sign = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSignature === razorpaySignature) {
      const payment = await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { razorpayPaymentId, razorpaySignature, status: 'captured' },
        { new: true }
      );
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      res.json({ status: 'ok', payment });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    errorHandler(res, error);
  }
};

exports.refundPayment = async (req, res) => {
  const { razorpayPaymentId, amount } = req.body;
  try {
    const refund = await razorpay.payments.refund(razorpayPaymentId, {
      amount: amount * 100, // Convert to paise
    });
    const payment = await Payment.findOneAndUpdate(
      { razorpayPaymentId },
      { status: 'failed' },
      { new: true }
    );
    res.json({ status: 'refunded', refund, payment });
  } catch (error) {
    errorHandler(res, error);
  }
};