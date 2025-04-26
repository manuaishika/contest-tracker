const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['Codeforces', 'CodeChef', 'LeetCode']
  },
  url: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,  // in minutes
    required: true
  },
  contestId: {
    type: String,
    required: true
  },
  // Unique identifier across platforms
  uniqueId: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);

// server/models/Bookmark.js
const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true
  },
  userId: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Compound index to ensure uniqueness
bookmarkSchema.index({ contestId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);

// server/models/Solution.js
const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true
  },
  youtubeUrl: {
    type: String,
    required: true
  },
  // For automatic fetching
  youtubeVideoId: {
    type: String,
    required: false
  },
  addedBy: {
    type: String,
    required: true
  },
  addedManually: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Solution', solutionSchema);