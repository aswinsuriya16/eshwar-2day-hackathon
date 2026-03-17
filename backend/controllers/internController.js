const { WeeklyGoal, Report } = require('../models');

// Get my weekly goals
const getMyGoals = async (req, res) => {
  const goals = await WeeklyGoal.find({ assignedTo: req.user._id })
    .populate('assignedBy', 'name email')
    .sort({ weekStart: -1 });
  res.json(goals);
};

// Submit report (text-editor HTML)
const submitReport = async (req, res) => {
  const { weeklyGoalId, content } = req.body;

  const goal = await WeeklyGoal.findById(weeklyGoalId);
  if (!goal || goal.assignedTo.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  // Prevent duplicate report
  const existing = await Report.findOne({ intern: req.user._id, weeklyGoal: weeklyGoalId });
  if (existing) return res.status(400).json({ message: 'Report already submitted' });

  const report = await Report.create({
    intern: req.user._id,
    weeklyGoal: weeklyGoalId,
    content,
  });

  res.status(201).json(report);
};

// Get my submitted reports
const getMyReports = async (req, res) => {
  const reports = await Report.find({ intern: req.user._id })
    .populate('weeklyGoal', 'title weekStart')
    .sort({ submittedAt: -1 });
  res.json(reports);
};

module.exports = { getMyGoals, submitReport, getMyReports };