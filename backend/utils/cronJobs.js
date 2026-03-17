const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { WeeklyGoal, Report } = require('../models');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Run every Monday at 9:00 AM
cron.schedule('0 9 * * 1', async () => {
  console.log('🔄 Running weekly notification job...');

  const goals = await WeeklyGoal.find({
    deadline: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
  }).populate('assignedTo');

  for (const goal of goals) {
    const reportExists = await Report.findOne({ weeklyGoal: goal._id });

    if (!reportExists) {
      // Notify Intern
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: goal.assignedTo.email,
        subject: `Reminder: Submit your report for ${goal.title}`,
        html: `<p>Hi ${goal.assignedTo.name},<br>Your weekly goal is due soon. Please submit your report before ${goal.deadline.toDateString()}.</p>`
      });

      // Notify Manager
      const manager = await goal.assignedTo.manager; // populated via ref
      // (You can add manager email notification similarly)
    }
  }
});

console.log('✅ CRON job scheduled (weekly reminders)');