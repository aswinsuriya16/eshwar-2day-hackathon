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

// "AI" analyse report content (simple heuristic analysis, no external API)
const analyzeReport = async (req, res) => {
  const report = await Report.findById(req.params.id)
    .populate('intern', 'name email')
    .populate('weeklyGoal', 'title expectedMetrics');

  if (!report) return res.status(404).json({ message: 'Report not found' });

  const rawHtml = report.content || '';
  const plainText = rawHtml
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+\n/g, '\n')
    .trim();

  const length = plainText.length;
  const sentences = plainText.split(/[.!?]+/).filter((s) => s && s.trim().length > 0);
  const sentenceCount = sentences.length;

  const hasMetrics =
    /\b\d+\s*(%|percent|hrs|hours|days|tickets|tasks|issues|bugs|users|visits)\b/i.test(
      plainText
    );
  const hasReflection =
    /\b(learned|improved|struggled|challenges?|next time|plan to|planning to)\b/i.test(
      plainText
    );

  const summary =
    length === 0
      ? 'The report appears to be empty or contains no readable content.'
      : length < 400
      ? 'The report is brief. It gives a high-level overview of the work done this week.'
      : length < 1200
      ? 'The report has a moderate level of detail, describing the main tasks and outcomes for the week.'
      : 'The report is quite detailed, covering multiple tasks, outcomes, and reflections over the week.';

  const strengths = [];
  const weaknesses = [];

  if (hasMetrics) {
    strengths.push('Includes concrete metrics or numbers to describe progress.');
  } else {
    weaknesses.push('Could benefit from adding concrete metrics (numbers, percentages, counts).');
  }

  if (hasReflection) {
    strengths.push('Shows reflection on learnings, challenges, or plans for improvement.');
  } else {
    weaknesses.push(
      'Could add more reflection about what was learned, what was hard, and how to improve next week.'
    );
  }

  if (sentenceCount >= 5) {
    strengths.push('Provides enough sentences to understand the weekly narrative.');
  } else {
    weaknesses.push(
      'Very short report; consider expanding with more details on tasks, outcomes, and impact.'
    );
  }

  if (weaknesses.length === 0) {
    weaknesses.push('No major issues detected; the report is generally clear and informative.');
  }

  const suggestions = [
    'Keep reports structured: start with key accomplishments, then challenges, then next steps.',
    'Highlight the impact of your work (e.g. performance improvements, user value, or team benefits).',
  ];

  if (!hasMetrics) {
    suggestions.push('Add at least 2–3 measurable metrics to make progress easier to track.');
  }

  const analysis = {
    intern: {
      name: report.intern?.name,
      email: report.intern?.email,
    },
    goal: {
      title: report.weeklyGoal?.title,
      expectedMetrics: report.weeklyGoal?.expectedMetrics,
    },
    stats: {
      characters: length,
      sentences: sentenceCount,
    },
    summary,
    strengths,
    weaknesses,
    suggestions,
  };

  res.json({ analysis });
};

module.exports = {
  assignGoal,
  getMyInterns,
  getPendingReports,
  approveReport,
  rejectReport,
  analyzeReport,
};