require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./controllers/authController'); // wait, better import routes
// Actually:
const managerRoutes = require('./routes/managerRoutes');
const internRoutes = require('./routes/internRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/managers', managerRoutes);
app.use('/api/interns', internRoutes);

// Auth routes (separate because no role middleware)
const { registerManager, loginManager, registerIntern, loginIntern } = require('./controllers/authController');
app.post('/api/managers/register', registerManager);
app.post('/api/managers/login', loginManager);
app.post('/api/interns/register', registerIntern);
app.post('/api/interns/login', loginIntern);

// CRON
require('./utils/cronJobs');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});