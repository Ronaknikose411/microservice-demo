exports.validateCar = (req, res, next) => {
  const { make, model, year, price } = req.body;
  if (req.method === 'POST' && (!make || !model || !year || !price)) {
    return res.status(400).json({ error: 'Make, model, year, and price are required' });
  }
  if (req.method === 'PATCH' && Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'No fields provided for update' });
  }
  next();
};