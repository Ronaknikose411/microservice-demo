const jwt = require('jsonwebtoken');
const axios = require('axios');

exports.auth = async (req, res, next) => {
  try {
    // Allow internal calls from booking-service
    if (req.header('X-Internal-Service') === 'booking-service') {
      req.user = { role: 'internal' };
      return next();
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token:', token); // Debug
    console.log('JWT_SECRET:', process.env.JWT_SECRET); // Debug
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify JWT locally
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded:', decoded); // Debug

    // Validate token with user-service
    const response = await axios.post(`${process.env.USER_SERVICE_URL}/users/validate`, { token });
    const { user } = response.data;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = { userId: user._id, role: user.role };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Authentication error' });
  }
};