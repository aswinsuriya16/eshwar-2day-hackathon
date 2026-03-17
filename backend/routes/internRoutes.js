const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { isIntern } = require('../middleware/role');
const { getMyGoals, submitReport, getMyReports } = require('../controllers/internController');

router.get('/goals', protect, isIntern, getMyGoals);
router.post('/reports', protect, isIntern, submitReport);
router.get('/reports', protect, isIntern, getMyReports);

module.exports = router;