const jwt = require('jsonwebtoken');
const axios = require('axios');

exports.protect = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Gateway Token:', token); // Debug
    console.log('Gateway JWT_SECRET:', process.env.JWT_SECRET); // Debug
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify JWT locally
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Gateway Decoded:', decoded); // Debug

    // Validate token with user-service
    const response = await axios.post(`${process.env.USER_SERVICE_URL}/users/validate`, { token });
    const { user } = response.data;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Attach user info to request for downstream services
    req.user = { userId: user._id, role: user.role };
    req.headers['X-User-Id'] = user._id; // Forward user ID
    req.headers['X-User-Role'] = user.role; // Forward role
    next();
  } catch (error) {
    console.error('Gateway auth error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Authentication error' });
  }
};