require('dotenv').config();

const express = require('express');
const { connectDB } = require('./config/paymentConfig');
const paymentRoutes = require('./routes/paymentRoutes')
const app = express();

app.use(express.json());
connectDB();

app.use('/payments', paymentRoutes);

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
