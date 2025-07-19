exports.verifyPayment = (req, res, next) => {
  const { bookingId, amount } = req.body;
  if (!bookingId || amount <= 0) {
    return res.status(400).json({ error: 'Invalid booking ID or amount' });
  }
  next();
};