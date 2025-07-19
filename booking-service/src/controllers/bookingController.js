const axios = require('axios');
const Booking = require('../models/bookingModel');
const { errorHandler } = require('../utils/dateUtils');

exports.createBooking = async (req, res) => {
  const { carId, startDate, endDate } = req.body;
  const { userId } = req.user;

  try {
    // Validate user
    const userResponse = await axios.post(`${process.env.USER_SERVICE_URL}/users/validate`, {
      token: req.headers.authorization.split(' ')[1],
    });
    if (!userResponse.data.user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate car availability
    const carResponse = await axios.get(`${process.env.CAR_SERVICE_URL}/cars/view/${carId}`);
    if (!carResponse.data.car || !carResponse.data.car.available) {
      return res.status(400).json({ error: 'Car not available or not found' });
    }

    // Create booking
    const booking = new Booking({
      userId,
      carId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'pending',
    });
    await booking.save();

    // Attempt to update car availability
    try {
      await axios.patch(
        `${process.env.CAR_SERVICE_URL}/cars/update/${carId}`,
        { available: false },
        { headers: { 'X-Internal-Service': 'booking-service' } }
      );
    } catch (patchError) {
      console.error('Failed to update car availability:', patchError.response?.status, patchError.response?.data);
      // Log the error but continue to return the booking
    }

    // Fetch car details for response
    const car = carResponse.data.car;
    res.status(201).json({ booking: { ...booking.toJSON(), car: { make: car.make, model: car.model } } });
  } catch (error) {
    errorHandler(res, error);
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const filter = role === 'admin' ? {} : { userId };
    const bookings = await Booking.find(filter);

    // Fetch car details for each booking
    const bookingsWithCars = await Promise.all(bookings.map(async (booking) => {
      try {
        const carResponse = await axios.get(`${process.env.CAR_SERVICE_URL}/cars/view/${booking.carId}`);
        const car = carResponse.data.car;
        return { ...booking.toJSON(), car: { make: car.make, model: car.model } };
      } catch (error) {
        console.error('Car fetch error:', error.response?.status, error.response?.data);
        return { ...booking.toJSON(), car: null };
      }
    }));

    res.json({ bookings: bookingsWithCars });
  } catch (error) {
    errorHandler(res, error);
  }
};

exports.getBooking = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (role !== 'admin' && booking.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // Fetch car details
    const carResponse = await axios.get(`${process.env.CAR_SERVICE_URL}/cars/view/${booking.carId}`);
    const car = carResponse.data.car;
    res.json({ booking: { ...booking.toJSON(), car: { make: car.make, model: car.model } } });
  } catch (error) {
    errorHandler(res, error);
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { status } = req.body;

    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use "confirmed" or "cancelled"' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (role !== 'admin' && booking.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // If cancelling, restore car availability
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      try {
        await axios.patch(
          `${process.env.CAR_SERVICE_URL}/cars/update/${booking.carId}`,
          { available: true },
          { headers: { 'X-Internal-Service': 'booking-service' } }
        );
      } catch (patchError) {
        console.error('Failed to restore car availability:', patchError.response?.status, patchError.response?.data);
        // Log the error but continue
      }
    }

    booking.status = status;
    await booking.save();

    // Fetch car details for response
    const carResponse = await axios.get(`${process.env.CAR_SERVICE_URL}/cars/view/${booking.carId}`);
    const car = carResponse.data.car;
    res.json({ booking: { ...booking.toJSON(), car: { make: car.make, model: car.model } } });
  } catch (error) {
    errorHandler(res, error);
  }
};