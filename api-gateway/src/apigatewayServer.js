require('dotenv').config();

const express = require('express');
const proxy = require('express-http-proxy');
const app = express();

app.use(express.json());
app.use(require('./routes/gatewayRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(5000, () => console.log('API Gateway running on port 5000'));