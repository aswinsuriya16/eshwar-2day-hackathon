const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { isManager } = require('../middleware/role');
const {
  assignGoal,
  getMyInterns,
  getPendingReports,
  approveReport,
  rejectReport,
  analyzeReport,
} = require('../controllers/managerController');

router.post('/goals', protect, isManager, assignGoal);
router.get('/interns', protect, isManager, getMyInterns);
router.get('/reports/pending', protect, isManager, getPendingReports);
router.put('/reports/:id/approve', protect, isManager, approveReport);
router.put('/reports/:id/reject', protect, isManager, rejectReport);
router.post('/reports/:id/analyze', protect, isManager, analyzeReport);

module.exports = router;