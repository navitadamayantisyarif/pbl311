const express = require('express');
const { authenticateToken, randomErrorMiddleware } = require('../middleware/common');
const { loadSampleData } = require('../data/sampleData');

const router = express.Router();

// Apply authentication and random error simulation
router.use(authenticateToken);
router.use(randomErrorMiddleware);

// GET /api/history/access - Get access history
router.get('/access', async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      door_id, 
      user_id, 
      start_date, 
      end_date,
      success 
    } = req.query;
    
    const data = loadSampleData();
    
    // Get access logs
    let accessLogs = data.accessLogs || [];
    
    // Apply filters
    if (door_id) {
      accessLogs = accessLogs.filter(log => log.door_id === door_id);
    }
    
    if (user_id) {
      accessLogs = accessLogs.filter(log => log.user_id === user_id);
    }
    
    if (success !== undefined) {
      const successBool = success === 'true';
      accessLogs = accessLogs.filter(log => log.success === successBool);
    }
    
    if (start_date) {
      accessLogs = accessLogs.filter(log => new Date(log.timestamp) >= new Date(start_date));
    }
    
    if (end_date) {
      accessLogs = accessLogs.filter(log => new Date(log.timestamp) <= new Date(end_date));
    }
    
    // Apply pagination
    const totalLogs = accessLogs.length;
    const paginatedLogs = accessLogs.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        total: totalLogs,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: parseInt(offset) + parseInt(limit) < totalLogs
      },
      message: 'Access history retrieved successfully'
    });

  } catch (error) {
    console.error('Get access history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get access history',
      message: error.message,
      code: 'ACCESS_HISTORY_ERROR'
    });
  }
});

// GET /api/history/photos - Get photo history
router.get('/photos', async (req, res) => {
  try {
    const { 
      limit = 20, 
      offset = 0, 
      door_id, 
      user_id, 
      start_date, 
      end_date,
      event_type 
    } = req.query;
    
    const data = loadSampleData();
    
    // Get camera captures
    let captures = data.cameraCaptures || [];
    
    // Apply filters
    if (door_id) {
      captures = captures.filter(capture => capture.door_id === door_id);
    }
    
    if (user_id) {
      captures = captures.filter(capture => capture.user_id === user_id);
    }
    
    if (event_type) {
      captures = captures.filter(capture => capture.event_type === event_type);
    }
    
    if (start_date) {
      captures = captures.filter(capture => new Date(capture.timestamp) >= new Date(start_date));
    }
    
    if (end_date) {
      captures = captures.filter(capture => new Date(capture.timestamp) <= new Date(end_date));
    }
    
    // Apply pagination
    const totalCaptures = captures.length;
    const paginatedCaptures = captures.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      success: true,
      data: paginatedCaptures,
      pagination: {
        total: totalCaptures,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: parseInt(offset) + parseInt(limit) < totalCaptures
      },
      message: 'Photo history retrieved successfully'
    });

  } catch (error) {
    console.error('Get photo history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get photo history',
      message: error.message,
      code: 'PHOTO_HISTORY_ERROR'
    });
  }
});

// GET /api/history/summary - Get history summary (for analytics)
router.get('/summary', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const data = loadSampleData();
    
    // Calculate date range based on period
    const now = new Date();
    let dateFrom;
    
    switch (period) {
      case '24h':
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Filter data by period
    const accessLogs = data.accessLogs.filter(log => new Date(log.timestamp) >= dateFrom);
    const photos = data.cameraCaptures.filter(photo => new Date(photo.timestamp) >= dateFrom);
    
    // Calculate summary
    const summary = {
      total_access: accessLogs.length,
      successful_access: accessLogs.filter(log => log.success).length,
      failed_access: accessLogs.filter(log => !log.success).length,
      total_photos: photos.length,
      unique_users: [...new Set(accessLogs.map(log => log.user_id))].length,
      unique_doors: [...new Set(accessLogs.map(log => log.door_id))].length,
      period,
      date_range: {
        from: dateFrom.toISOString(),
        to: now.toISOString()
      }
    };
    
    res.json({
      success: true,
      data: summary,
      message: 'History summary retrieved successfully'
    });

  } catch (error) {
    console.error('Get history summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get history summary',
      message: error.message,
      code: 'HISTORY_SUMMARY_ERROR'
    });
  }
});

module.exports = router;