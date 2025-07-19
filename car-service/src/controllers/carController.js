const Car = require('../models/carModel');
const { errorHandler } = require('../utils/logger');

exports.createCar = async (req, res) => {
  try {
    const car = new Car(req.body);
    await car.save();
    res.status(201).json({ car });
  } catch (error) {
    errorHandler(res, error);
  }
};

exports.getCars = async (req, res) => {
  try {
    const { available } = req.query;
    const filter = available ? { available: available === 'true' } : {};
    const cars = await Car.find(filter);
    res.json({ cars });
  } catch (error) {
    errorHandler(res, error);
  }
};

exports.getCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json({ car });
  } catch (error) {
    errorHandler(res, error);
  }
};

exports.updateCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json({ car });
  } catch (error) {
    errorHandler(res, error);
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json({ message: 'Car deleted' });
  } catch (error) {
    errorHandler(res, error);
  }
};