exports.errorHandler = (res, error) => {
  console.error('Payment Error:', error);
  res.status(500).json({ error: error.message || 'Payment processing failed' });
};