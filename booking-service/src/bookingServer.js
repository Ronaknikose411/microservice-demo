require('dotenv').config();

const express = require('express');
const { connectDB } = require('./config/db');
const bookingRoutes = require('./routes/bookingRoutes');
const app = express();

app.use(express.json());
connectDB();

app.use('/bookings', bookingRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Booking Service running on port ${PORT}`));
