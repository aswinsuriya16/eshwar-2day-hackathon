const jwt = require('jsonwebtoken');
const { Manager, Intern } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'manager') {
      req.user = await Manager.findById(decoded.id).select('-password');
      req.role = 'manager';
    } else if (decoded.role === 'intern') {
      req.user = await Intern.findById(decoded.id).select('-password');
      req.role = 'intern';
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = protect;