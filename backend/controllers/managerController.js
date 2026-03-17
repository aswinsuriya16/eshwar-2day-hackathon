const { WeeklyGoal, Intern, Report } = require('../models');

// Assign weekly goal
const assignGoal = async (req, res) => {
  const { title, description, assignedTo, weekStart, deadline, priority, expectedMetrics } = req.body;

  const intern = await Intern.findById(assignedTo);
  if (!intern || intern.manager.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized for this intern' });
  }

  const goal = await WeeklyGoal.create({
    title,
    description,
    assignedTo,
    assignedBy: req.user._id,
    weekStart,
    weekEnd: new Date(new Date(weekStart).getTime() + 7 * 24 * 60 * 60 * 1000),
    deadline,
    priority,
    expectedMetrics,
  });

  res.status(201).json(goal);
};

// Get all my interns
const getMyInterns = async (req, res) => {
  const interns = await Intern.find({ manager: req.user._id }).select('-password');
  res.json(interns);
};

// Get pending reports for dashboard
const getPendingReports = async (req, res) => {
  const reports = await Report.find({ status: 'pending' })
    .populate('intern', 'name email')
    .populate('weeklyGoal', 'title weekStart')
    .sort({ submittedAt: -1 });

  res.json(reports);
};

// Approve report
const approveReport = async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });

  report.status = 'approved';
  report.reviewedBy = req.user._id;
  report.reviewedAt = Date.now();
  report.feedback = req.body.feedback || '';
  report.rating = req.body.rating;

  await report.save();
  res.json({ message: 'Report approved', report });
};

// Reject report
const rejectReport = async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });

  report.status = 'rejected';
  report.reviewedBy = req.user._id;
  report.reviewedAt = Date.now();
  report.feedback = req.body.feedback;

  await report.save();
  res.json({ message: 'Report rejected', report });
};

module.exports = { assignGoal, getMyInterns, getPendingReports, approveReport, rejectReport };