const express = require('express');
const TypingResult = require('../models/TypingResult');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Save typing test result
router.post('/save', auth, async (req, res) => {
  try {
    const {
      testConfig,
      results,
      typingData,
      metadata,
      sessionId
    } = req.body;

    // Validate required fields
    if (!testConfig || !results) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'testConfig and results are required'
      });
    }

    // Create typing result
    const typingResult = new TypingResult({
      user: req.user ? req.user.id : null,
      sessionId: req.isGuest ? (sessionId || null) : null,
      isGuest: req.isGuest,
      testConfig,
      results,
      typingData: typingData || {},
      metadata: {
        ...metadata,
        userAgent: req.get('User-Agent'),
        testDate: new Date()
      }
    });

    await typingResult.save();

    // Update user statistics if authenticated
    if (req.user) {
      await updateUserStatistics(req.user.id, results);
    }

    res.status(201).json({
      success: true,
      data: {
        id: typingResult._id,
        savedAt: typingResult.createdAt
      },
      message: 'Typing test result saved successfully'
    });
  } catch (error) {
    console.error('Save result error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Could not save typing test result'
    });
  }
});

// Get user's typing history
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, mode, dateFrom, dateTo } = req.query;
    
    let query = {};
    
    if (req.user) {
      query.user = req.user.id;
    } else if (req.query.sessionId) {
      query.sessionId = req.query.sessionId;
      query.isGuest = true;
    } else {
      return res.status(400).json({
        error: 'Authentication required',
        message: 'Please login or provide sessionId for guest access'
      });
    }

    // Add filters
    if (mode) {
      query['testConfig.mode'] = mode;
    }

    if (dateFrom || dateTo) {
      query['metadata.testDate'] = {};
      if (dateFrom) query['metadata.testDate'].$gte = new Date(dateFrom);
      if (dateTo) query['metadata.testDate'].$lte = new Date(dateTo);
    }

    const results = await TypingResult.find(query)
      .sort({ 'metadata.testDate': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'username profileData.firstName profileData.lastName')
      .select('-typingData.keystrokes'); // Exclude detailed keystroke data for performance

    const total = await TypingResult.countDocuments(query);

    res.json({
      success: true,
      data: {
        results,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Could not fetch typing history'
    });
  }
});

// Get detailed result by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await TypingResult.findById(req.params.id)
      .populate('user', 'username profileData.firstName profileData.lastName');

    if (!result) {
      return res.status(404).json({
        error: 'Result not found',
        message: 'Typing test result not found'
      });
    }

    // Check if user has access to this result
    if (result.user && req.user && result.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this result'
      });
    }

    if (result.isGuest && req.query.sessionId !== result.sessionId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Invalid session ID for guest result'
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Result fetch error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Could not fetch typing result'
    });
  }
});

// Get user statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user) {
      query.user = req.user.id;
    } else if (req.query.sessionId) {
      query.sessionId = req.query.sessionId;
      query.isGuest = true;
    } else {
      return res.status(400).json({
        error: 'Authentication required',
        message: 'Please login or provide sessionId for guest access'
      });
    }

    const stats = await TypingResult.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          averageWPM: { $avg: '$results.wpm' },
          averageAccuracy: { $avg: '$results.accuracy' },
          bestWPM: { $max: '$results.wpm' },
          bestAccuracy: { $max: '$results.accuracy' },
          totalTimeTyping: { $sum: '$results.timeElapsed' },
          completedTests: {
            $sum: {
              $cond: [{ $eq: ['$results.completed', true] }, 1, 0]
            }
          }
        }
      }
    ]);

    const recentTests = await TypingResult.find(query)
      .sort({ 'metadata.testDate': -1 })
      .limit(10)
      .select('results testConfig metadata.testDate');

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          totalTests: 0,
          averageWPM: 0,
          averageAccuracy: 0,
          bestWPM: 0,
          bestAccuracy: 0,
          totalTimeTyping: 0,
          completedTests: 0
        },
        recentTests
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Could not fetch typing statistics'
    });
  }
});

// Helper function to update user statistics
async function updateUserStatistics(userId, results) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const currentStats = user.statistics;
    const newTotalTests = currentStats.totalTests + 1;

    // Calculate new averages
    const newAverageWPM = ((currentStats.averageWPM * currentStats.totalTests) + results.wpm) / newTotalTests;
    const newAverageAccuracy = ((currentStats.averageAccuracy * currentStats.totalTests) + results.accuracy) / newTotalTests;

    // Update statistics
    await User.findByIdAndUpdate(userId, {
      'statistics.totalTests': newTotalTests,
      'statistics.totalTimeTyping': currentStats.totalTimeTyping + results.timeElapsed,
      'statistics.averageWPM': Math.round(newAverageWPM * 100) / 100,
      'statistics.averageAccuracy': Math.round(newAverageAccuracy * 100) / 100,
      'statistics.bestWPM': Math.max(currentStats.bestWPM, results.wpm),
      'statistics.bestAccuracy': Math.max(currentStats.bestAccuracy, results.accuracy)
    });
  } catch (error) {
    console.error('Error updating user statistics:', error);
  }
}

module.exports = router;
