const Contest = require('../models/Contest');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { 
  fetchCodeforcesContests 
} = require('../services/contestFetchers/codeforcesService');
const { 
  fetchCodechefContests 
} = require('../services/contestFetchers/codechefService');
const { 
  fetchLeetcodeContests 
} = require('../services/contestFetchers/leetcodeService');

/**
 * @desc    Get all contests
 * @route   GET /api/contests
 * @access  Public
 */
exports.getContests = asyncHandler(async (req, res, next) => {
  const {
    platform,
    status,
    search,
    sort = 'startTime',
    limit = 100,
    page = 1
  } = req.query;
  
  // Build query
  const query = {};
  
  // Filter by platform
  if (platform) {
    const platforms = platform.split(',');
    if (platforms.length > 0) {
      query.platform = { $in: platforms };
    }
  }
  
  // Filter by status
  if (status) {
    const now = new Date();
    
    if (status === 'upcoming') {
      query.startTime = { $gt: now };
    } else if (status === 'ongoing') {
      query.startTime = { $lte: now };
      query.endTime = { $gte: now };
    } else if (status === 'past') {
      query.endTime = { $lt: now };
    }
  }
  
  // Search by name
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  
  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const contests = await Contest.find(query)
    .sort({ [sort]: sort === 'startTime' ? 1 : -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Contest.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: contests.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    },
    data: contests
  });
});

/**
 * @desc    Get contest by ID
 * @route   GET /api/contests/:id
 * @access  Public
 */
exports.getContest = asyncHandler(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  
  if (!contest) {
    return next(new ErrorResponse(`Contest not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: contest
  });
});

/**
 * @desc    Manually fetch contests from all platforms
 * @route   POST /api/contests/fetch
 * @access  Private (Admin)
 */
exports.fetchContests = asyncHandler(async (req, res, next) => {
  const results = {
    codeforces: { status: 'pending' },
    codechef: { status: 'pending' },
    leetcode: { status: 'pending' }
  };
  
  try {
    // Fetch contests from all platforms concurrently
    const [codeforces, codechef, leetcode] = await Promise.allSettled([
      fetchCodeforcesContests(),
      fetchCodechefContests(),
      fetchLeetcodeContests()
    ]);
    
    // Process Codeforces results
    if (codeforces.status === 'fulfilled') {
      results.codeforces = {
        status: 'success',
        count: codeforces.value.length
      };
    } else {
      results.codeforces = {
        status: 'error',
        message: codeforces.reason.message
      };
    }
    
    // Process CodeChef results
    if (codechef.status === 'fulfilled') {
      results.codechef = {
        status: 'success',
        count: codechef.value.length
      };
    } else {
      results.codechef = {
        status: 'error',
        message: codechef.reason.message
      };
    }
    
    // Process LeetCode results
    if (leetcode.status === 'fulfilled') {
      results.leetcode = {
        status: 'success',
        count: leetcode.value.length
      };
    } else {
      results.leetcode = {
        status: 'error',
        message: leetcode.reason.message
      };
    }
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    return next(new ErrorResponse('Error fetching contests', 500));
  }
});

// server/controllers/bookmarkController.js
const Bookmark = require('../models/Bookmark');
const Contest = require('../models/Contest');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get all bookmarks for a user
 * @route   GET /api/bookmarks
 * @access  Private
 */
exports.getBookmarks = asyncHandler(async (req, res, next) => {
  const { userId } = req.query;
  
  if (!userId) {
    return next(new ErrorResponse('User ID is required', 400));
  }
  
  const bookmarks = await Bookmark.find({ userId })
    .populate('contestId');
  
  res.status(200).json({
    success: true,
    count: bookmarks.length,
    data: bookmarks
  });
});

/**
 * @desc    Add bookmark
 * @route   POST /api/bookmarks
 * @access  Private
 */
exports.addBookmark = asyncHandler(async (req, res, next) => {
  const { userId, contestId } = req.body;
  
  if (!userId || !contestId) {
    return next(new ErrorResponse('User ID and Contest ID are required', 400));
  }
  
  // Check if contest exists
  const contest = await Contest.findById(contestId);
  
  if (!contest) {
    return next(new ErrorResponse(`Contest not found with id of ${contestId}`, 404));
  }
  
  // Check if bookmark already exists
  const existingBookmark = await Bookmark.findOne({
    userId,
    contestId
  });
  
  if (existingBookmark) {
    return next(new ErrorResponse('Contest already bookmarked', 400));
  }
  
  // Create bookmark
  const bookmark = await Bookmark.create({
    userId,
    contestId
  });
  
  res.status(201).json({
    success: true,
    data: bookmark
  });
});

/**
 * @desc    Remove bookmark
 * @route   DELETE /api/bookmarks/:id
 * @access  Private
 */
exports.removeBookmark = asyncHandler(async (req, res, next) => {
  const bookmark = await Bookmark.findById(req.params.id);
  
  if (!bookmark) {
    return next(new ErrorResponse(`Bookmark not found with id of ${req.params.id}`, 404));
  }
  
  // Check if user owns the bookmark
  if (bookmark.userId !== req.query.userId) {
    return next(new ErrorResponse('Not authorized to delete this bookmark', 401));
  }
  
  await bookmark.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// server/controllers/solutionController.js
const Solution = require('../models/Solution');
const Contest = require('../models/Contest');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { fetchAndMatchAllSolutions } = require('../services/youtube/youtubeService');

/**
 * @desc    Get solution for a contest
 * @route   GET /api/solutions/contest/:contestId
 * @access  Public
 */
exports.getSolutionByContest = asyncHandler(async (req, res, next) => {
  const solution = await Solution.findOne({ contestId: req.params.contestId });
  
  if (!solution) {
    return next(new ErrorResponse(`No solution found for contest with id ${req.params.contestId}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: solution
  });
});

/**
 * @desc    Get all solutions
 * @route   GET /api/solutions
 * @access  Public
 */
exports.getSolutions = asyncHandler(async (req, res, next) => {
  const { platform, limit = 50, page = 1 } = req.query;
  
  // Build query
  const query = {};