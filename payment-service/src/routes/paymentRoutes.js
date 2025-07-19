const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyPayment } = require('../middleware/verifyPayment');

router.post('/debit', verifyPayment, paymentController.createPaymentOrder);
router.post('/verify', paymentController.verifyPayment);
router.post('/refund', verifyPayment, paymentController.refundPayment);

module.exports = router;