const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { checkAvailability } = require('../middleware/checkAvailability');
const { auth } = require('../middleware/auth');

router.post('/create', auth, checkAvailability, bookingController.createBooking);
router.get('/viewall', auth, bookingController.getBookings);
router.get('/view/:id', auth, bookingController.getBooking);
router.patch('/update/:id', auth, bookingController.updateBookingStatus);

module.exports = router;