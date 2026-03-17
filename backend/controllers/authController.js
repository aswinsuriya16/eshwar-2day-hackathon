const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Manager, Intern } = require('../models');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ====================== MANAGER AUTH ======================
const registerManager = async (req, res) => {
  const { name, email, password, department, company } = req.body;
  const managerExists = await Manager.findOne({ email });

  if (managerExists) return res.status(400).json({ message: 'Manager already exists' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const manager = await Manager.create({
    name, email, password: hashedPassword, department, company
  });

  res.status(201).json({
    _id: manager._id,
    name: manager.name,
    email: manager.email,
    role: 'manager',
    token: generateToken(manager._id, 'manager')
  });
};

const loginManager = async (req, res) => {
  const { email, password } = req.body;
  const manager = await Manager.findOne({ email });

  if (manager && (await bcrypt.compare(password, manager.password))) {
    res.json({
      _id: manager._id,
      name: manager.name,
      email: manager.email,
      role: 'manager',
      token: generateToken(manager._id, 'manager')
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

// ====================== INTERN AUTH ======================
const registerIntern = async (req, res) => {
  const { name, email, password, managerId, startDate } = req.body;
  const internExists = await Intern.findOne({ email });

  if (internExists) return res.status(400).json({ message: 'Intern already exists' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const intern = await Intern.create({
    name, email, password: hashedPassword, manager: managerId, startDate
  });

  res.status(201).json({
    _id: intern._id,
    name: intern.name,
    email: intern.email,
    role: 'intern',
    token: generateToken(intern._id, 'intern')
  });
};

const loginIntern = async (req, res) => {
  const { email, password } = req.body;
  const intern = await Intern.findOne({ email });

  if (intern && (await bcrypt.compare(password, intern.password))) {
    res.json({
      _id: intern._id,
      name: intern.name,
      email: intern.email,
      role: 'intern',
      token: generateToken(intern._id, 'intern')
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

module.exports = { registerManager, loginManager, registerIntern, loginIntern };