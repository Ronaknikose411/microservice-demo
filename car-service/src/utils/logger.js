exports.errorHandler = (res, error) => {
  console.error('Error:', error);
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  if (error.name === 'MongoError' && error.code === 11000) {
    return res.status(400).json({ error: 'Duplicate key error' });
  }
  res.status(500).json({ error: error.message || 'Server error' });
};