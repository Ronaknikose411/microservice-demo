const express = require('express');
const proxy = require('express-http-proxy');
const { protect } = require('../middleware/authGateway');
const { services } = require('../config/serviceRegistry');

const router = express.Router();

router.use('/users', proxy(services.userService));
router.use('/bookings', protect, proxy(services.bookingService));
router.use('/cars', proxy(services.carService));
router.use('/payments', protect, proxy(services.paymentService));

module.exports = router;