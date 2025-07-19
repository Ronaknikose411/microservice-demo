exports.services = {
  userService: process.env.USER_SERVICE_URL || 'http://localhost:5001',
  carService: process.env.CAR_SERVICE_URL || 'http://localhost:5002',
  bookingService: process.env.BOOKING_SERVICE_URL || 'http://localhost:5003',
  paymentService: process.env.PAYMENT_SERVICE_URL || 'http://localhost:5004',
};