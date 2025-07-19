const axios = require('axios');
const Booking = require('../models/bookingModel');

exports.checkAvailability = async (req, res, next) => {
  const { carId, startDate, endDate } = req.body;

  try {
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end) || start >= end) {
      return res.status(400).json({ error: 'Invalid start or end date' });
    }

    // Check car availability
    const carResponse = await axios.get(`${process.env.CAR_SERVICE_URL}/cars/view/${carId}`);
    if (!carResponse.data.car || !carResponse.data.car.available) {
      return res.status(400).json({ error: 'Car not available or not found' });
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      carId,
      status: { $ne: 'cancelled' },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({ error: 'Car is booked for the selected dates' });
    }

    next();
  } catch (error) {
    console.error('Check availability error:', error.response?.status, error.response?.data);
    res.status(500).json({ error: 'Failed to check availability' });
  }
};