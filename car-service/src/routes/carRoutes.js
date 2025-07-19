const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { validateCar } = require('../middleware/validateCar');
const { auth } = require('../middleware/auth');

router.post('/add', auth, validateCar, carController.createCar);
router.get('/viewall', carController.getCars);
router.get('/view/:id', carController.getCar);
router.patch('/update/:id', auth, validateCar, carController.updateCar);
router.delete('/delete/:id', auth, carController.deleteCar);

module.exports = router;