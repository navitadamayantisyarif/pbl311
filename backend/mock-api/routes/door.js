const express = require('express');
const { authenticateToken, randomErrorMiddleware } = require('../middleware/common');
const { loadSampleData } = require('../data/sampleData');

const router = express.Router();

// Apply authentication and random error simulation
router.use(authenticateToken);
router.use(randomErrorMiddleware);

// GET /api/door/status - Get door status
router.get('/status', async (req, res) => {
  try {
    const data = loadSampleData();
    
    // Get door statuses
    const doorStatuses = data.doorStatus || [];
    
    res.json({
      success: true,
      data: doorStatuses,
      message: 'Door status retrieved successfully'
    });

  } catch (error) {
    console.error('Get door status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get door status',
      message: error.message,
      code: 'DOOR_STATUS_ERROR'
    });
  }
});

// POST /api/door/control - Control door (lock/unlock)
router.post('/control', async (req, res) => {
  try {
    const { door_id, action } = req.body;

    if (!door_id || !action) {
      return res.status(400).json({
        success: false,
        error: 'Door ID and action are required',
        code: 'MISSING_PARAMETERS'
      });
    }

    const validActions = ['lock', 'unlock'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Must be lock or unlock',
        code: 'INVALID_ACTION'
      });
    }

    // Mock door control response
    const result = {
      door_id,
      action,
      success: true,
      timestamp: new Date().toISOString(),
      message: `Door ${action}ed successfully`
    };

    res.json({
      success: true,
      data: result,
      message: `Door ${action}ed successfully`
    });

  } catch (error) {
    console.error('Door control error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to control door',
      message: error.message,
      code: 'DOOR_CONTROL_ERROR'
    });
  }
});

// GET /api/door/user-access - Get doors accessible by user
router.get('/user-access', async (req, res) => {
  try {
    const data = loadSampleData();
    
    // Get user-door access relationships
    const userDoorAccess = data.userDoorAccess || [];
    
    res.json({
      success: true,
      data: userDoorAccess,
      message: 'User door access retrieved successfully'
    });

  } catch (error) {
    console.error('Get user door access error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user door access',
      message: error.message,
      code: 'USER_ACCESS_ERROR'
    });
  }
});

// GET /api/door/logs - Get door access logs
router.get('/logs', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const data = loadSampleData();
    
    // Get access logs
    let accessLogs = data.accessLogs || [];
    
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
      message: 'Door logs retrieved successfully'
    });

  } catch (error) {
    console.error('Get door logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get door logs',
      message: error.message,
      code: 'DOOR_LOGS_ERROR'
    });
  }
});

// POST /api/door/emergency-unlock - Emergency unlock
router.post('/emergency-unlock', async (req, res) => {
  try {
    const { door_id } = req.body;

    if (!door_id) {
      return res.status(400).json({
        success: false,
        error: 'Door ID is required',
        code: 'MISSING_DOOR_ID'
      });
    }

    // Mock emergency unlock response
    const result = {
      door_id,
      action: 'emergency_unlock',
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Emergency unlock activated successfully'
    };

    res.json({
      success: true,
      data: result,
      message: 'Emergency unlock activated successfully'
    });

  } catch (error) {
    console.error('Emergency unlock error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to emergency unlock',
      message: error.message,
      code: 'EMERGENCY_UNLOCK_ERROR'
    });
  }
});

module.exports = router;