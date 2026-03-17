const mongoose = require('mongoose');

//Manager Schema
const managerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    department: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String, // URL to uploaded image
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups
managerSchema.index({ email: 1 });

//Intern Schema
const internSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast manager lookups
internSchema.index({ manager: 1, email: 1 });


//Weekly Goal Schema
const weeklyGoalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Intern',
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
      required: true,
    },
    weekStart: {
      type: Date,
      required: true,
    },
    weekEnd: {
      type: Date,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one goal per intern per week (prevents duplicate weekly assignments)
weeklyGoalSchema.index(
  { assignedTo: 1, weekStart: 1 },
  { unique: true }
);


//Report Schema
const reportSchema = new mongoose.Schema(
  {
    intern: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Intern',
      required: true,
    },
    weeklyGoal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WeeklyGoal',
      required: true,
    },
    content: {
      type: String,
      required: true,
      // This will store HTML from the text editor (Quill, TinyMCE, etc.)
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
    },
    reviewedAt: {
      type: Date,
    },
    feedback: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only ONE report per intern per weekly goal
reportSchema.index(
  { intern: 1, weeklyGoal: 1 },
  { unique: true }
);

const Manager = mongoose.model('Manager', managerSchema);
const Intern = mongoose.model('Intern', internSchema);
const WeeklyGoal = mongoose.model('WeeklyGoal', weeklyGoalSchema);
const Report = mongoose.model('Report', reportSchema);

module.exports = {
  Manager,
  Intern,
  WeeklyGoal,
  Report,
};