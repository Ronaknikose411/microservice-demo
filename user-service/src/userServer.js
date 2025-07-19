require('dotenv').config();

const express = require('express');
const { connectDB } = require('./config/db');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(express.json());
connectDB();

app.use('/users', userRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
