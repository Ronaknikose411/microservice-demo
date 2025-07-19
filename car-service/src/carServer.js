require('dotenv').config();

const express = require('express');
const { connectDB } = require('./config/db');
const carRoutes = require('./routes/carRoutes')
const app = express();

app.use(express.json());
connectDB();

app.use('/cars', carRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Car Service running on port ${PORT}`));
