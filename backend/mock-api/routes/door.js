const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, randomErrorMiddleware } = require('../middleware/common');
const { loadSampleData, generateDoorStatus } = require('../data/sampleData');

const router = express.Router();

// Apply authentication and random error simulation
router.use(authenticateToken);
router.use(randomErrorMiddleware);

// GET /api/door/status - Get current door status
router.get('/status', async (req, res) => {
  try {
    const { door_id } = req.query;
    const data = loadSampleData();

    let doorStatus;
    
    if (Array.isArray(data.doorStatus)) {
      // If doorStatus is an array (new format)
      if (door_id) {
        // Find specific door status
        doorStatus = data.doorStatus.find(status => status.door_id === door_id);
        if (!doorStatus) {
          return res.status(404).json({
            error: 'Door not found',
            code: 'DOOR_NOT_FOUND'
          });
        }
      } else {
        // If no specific door_id, return first door status (for backward compatibility)
        doorStatus = data.doorStatus[0] || null;
      }
    } else {
      // If doorStatus is a single object (old format for backward compatibility)
      doorStatus = data.doorStatus;
    }
    
    if (!doorStatus) {
      return res.status(404).json({
        error: 'Door status not found',
        code: 'DOOR_STATUS_NOT_FOUND'
      });
    }

    // Update door status with some randomness to simulate real-time changes
    const currentStatus = {
      ...doorStatus,
      last_update: new Date().toISOString(),
      battery_level: Math.max(0, doorStatus.battery_level + (Math.random() - 0.5) * 5),
      wifi_strength: Math.max(0, Math.min(100, doorStatus.wifi_strength + (Math.random() - 0.5) * 10))
    };

    res.json({
      success: true,
      data: currentStatus
    });

  } catch (error) {
    console.error('Get door status error:', error);
    res.status(500).json({
      error: 'Failed to get door status',
      message: error.message,
      code: 'DOOR_STATUS_ERROR'
    });
  }
});

// POST /api/door/control - Control door lock/unlock
router.post('/control', async (req, res) => {
  try {
    const { action, method, door_id } = req.body;
    const validActions = ['lock', 'unlock'];
    const validMethods = ['mobile_app', 'face_recognition', 'emergency_code', 'manual'];

    // Validate input
    if (!action || !validActions.includes(action)) {
      return res.status(400).json({
        error: 'Invalid action. Must be "lock" or "unlock"',
        code: 'INVALID_ACTION'
      });
    }

    if (method && !validMethods.includes(method)) {
      return res.status(400).json({
        error: 'Invalid method',
        code: 'INVALID_METHOD',
        valid_methods: validMethods
      });
    }

    const data = loadSampleData();
    
    let doorStatusIndex = -1;
    let doorStatus = null;
    
    if (Array.isArray(data.doorStatus)) {
      // If doorStatus is an array (new format)
      if (door_id) {
        // Find the door by ID in the doorStatus array
        doorStatusIndex = data.doorStatus.findIndex(status => status.door_id === door_id);
        if (doorStatusIndex === -1) {
          return res.status(404).json({
            error: 'Door not found',
            code: 'DOOR_NOT_FOUND'
          });
        }
        doorStatus = data.doorStatus[doorStatusIndex];
      } else {
        // If no door_id specified, use first door (backward compatibility)
        doorStatus = data.doorStatus[0] || null;
        doorStatusIndex = 0;
      }
    } else {
      // If doorStatus is a single object (old format for backward compatibility)
      doorStatus = data.doorStatus;
      doorStatusIndex = 0;
    }
    
    if (!doorStatus) {
      return res.status(404).json({
        error: 'Door not found',
        code: 'DOOR_NOT_FOUND'
      });
    }

    // Check if user has access to this door
    const userDoorAccess = data.userDoorAccess.find(access => 
      access.user_id === req.user.id && access.door_id === doorStatus.door_id
    );
    
    if (!userDoorAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to control this door',
        code: 'ACCESS_DENIED'
      });
    }

    // Simulate some failure scenarios
    const failureRate = 0.05; // 5% failure rate
    if (Math.random() < failureRate) {
      return res.status(422).json({
        error: 'Door control failed',
        message: 'Hardware communication error',
        code: 'HARDWARE_ERROR',
        retry_after: 5
      });
    }

    // Simulate access denied for some users with limited access
    if (req.user.role === 'guest' && action === 'unlock' && Math.random() < 0.3) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Guest users have limited access',
        code: 'ACCESS_DENIED'
      });
    }

    // Update door status
    doorStatus.locked = action === 'lock';
    doorStatus.last_update = new Date().toISOString();

    // Update the door status in the array
    if (doorStatusIndex >= 0 && Array.isArray(data.doorStatus)) {
      data.doorStatus[doorStatusIndex] = doorStatus;
    }

    // Create access log entry
    const logEntry = {
      id: uuidv4(),
      user_id: req.user.id,
      user_name: req.user.name,
      action: action,
      timestamp: new Date().toISOString(),
      success: true,
      method: method || 'mobile_app',
      door_id: doorStatus.door_id,
      door_name: doorStatus.door_name,
      location: doorStatus.location,
      ip_address: req.ip || '192.168.1.100',
      device_info: req.headers['user-agent'] || 'Mobile App'
    };

    data.accessLogs.unshift(logEntry);

    // Limit access logs to last 1000 entries
    if (data.accessLogs.length > 1000) {
      data.accessLogs = data.accessLogs.slice(0, 1000);
    }

    // Generate notification for unlock actions
    if (action === 'unlock') {
      const notification = {
        id: uuidv4(),
        type: 'access_granted',
        message: `${req.user.name} membuka pintu ${doorStatus.door_name} menggunakan ${method || 'aplikasi mobile'}`,
        read: false,
        created_at: new Date().toISOString(),
        priority: 'medium',
        user_id: req.user.id
      };

      data.notifications.unshift(notification);
    }

    res.json({
      success: true,
      message: `Door ${action} successful`,
      data: {
        action: action,
        status: doorStatus,
        timestamp: new Date().toISOString(),
        log_id: logEntry.id
      }
    });

  } catch (error) {
    console.error('Door control error:', error);
    res.status(500).json({
      error: 'Door control failed',
      message: error.message,
      code: 'CONTROL_ERROR'
    });
  }
});

// GET /api/door/logs - Get recent door access logs
router.get('/logs', async (req, res) => {
  try {
    const { limit = 50, offset = 0, user_id, action, date_from, date_to, door_id } = req.query;
    const data = loadSampleData();

    let logs = [...data.accessLogs];

    // Filter by user_id if provided
    if (user_id) {
      logs = logs.filter(log => log.user_id === user_id);
    }

    // Filter by door_id if provided
    if (door_id) {
      logs = logs.filter(log => log.door_id === door_id);
    }

    // Filter by action if provided
    if (action) {
      logs = logs.filter(log => log.action === action);
    }

    // Filter by date range if provided
    if (date_from) {
      logs = logs.filter(log => new Date(log.timestamp) >= new Date(date_from));
    }

    if (date_to) {
      logs = logs.filter(log => new Date(log.timestamp) <= new Date(date_to));
    }

    // Apply pagination
    const totalLogs = logs.length;
    const paginatedLogs = logs.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        total: totalLogs,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: parseInt(offset) + parseInt(limit) < totalLogs
      }
    });

  } catch (error) {
    console.error('Get door logs error:', error);
    res.status(500).json({
      error: 'Failed to get door logs',
      message: error.message,
      code: 'LOGS_ERROR'
    });
  }
});

// POST /api/door/emergency-unlock - Emergency unlock with special code
router.post('/emergency-unlock', async (req, res) => {
  try {
    const { emergency_code, reason } = req.body;

    // Mock emergency code validation
    const validCodes = ['EMERGENCY123', 'ADMIN999', 'OVERRIDE'];

    if (!emergency_code || !validCodes.includes(emergency_code)) {
      return res.status(401).json({
        error: 'Invalid emergency code',
        code: 'INVALID_EMERGENCY_CODE'
      });
    }

    const data = loadSampleData();

    // Force unlock
    data.doorStatus.locked = false;
    data.doorStatus.last_update = new Date().toISOString();

    // Create emergency log entry
    const logEntry = {
      id: uuidv4(),
      user_id: req.user.id,
      user_name: req.user.name,
      action: 'emergency_unlock',
      timestamp: new Date().toISOString(),
      success: true,
      method: 'emergency_code',
      location: 'Main Door',
      ip_address: req.ip || '192.168.1.100',
      device_info: 'Emergency Override',
      notes: reason || 'Emergency unlock performed'
    };

    data.accessLogs.unshift(logEntry);

    // Create high priority notification
    const notification = {
      id: uuidv4(),
      type: 'emergency_access',
      message: `Emergency unlock oleh ${req.user.name}: ${reason || 'No reason provided'}`,
      read: false,
      created_at: new Date().toISOString(),
      priority: 'high',
      user_id: req.user.id
    };

    data.notifications.unshift(notification);

    res.json({
      success: true,
      message: 'Emergency unlock successful',
      data: {
        action: 'emergency_unlock',
        status: data.doorStatus,
        timestamp: new Date().toISOString(),
        log_id: logEntry.id,
        reason: reason || 'Emergency unlock'
      }
    });

  } catch (error) {
    console.error('Emergency unlock error:', error);
    res.status(500).json({
      error: 'Emergency unlock failed',
      message: error.message,
      code: 'EMERGENCY_ERROR'
    });
  }
});

// GET /api/door/user-access - Get doors accessible to the current user
router.get('/user-access', async (req, res) => {
  try {
    const data = loadSampleData();
    
    // Filter doors that the user has access to
    const userDoorAccesses = data.userDoorAccess || [];
    const userDoors = userDoorAccesses.filter(access => access.user_id === req.user.id);
    
    // Get the actual door information for each accessible door
    const accessibleDoors = userDoors.map(userAccess => {
      // Find the corresponding door status
      const doorStatus = data.doorStatus.find(status => status.door_id === userAccess.door_id);
      
      return {
        id: userAccess.door_id,
        name: userAccess.door_name,
        location: userAccess.location,
        locked: doorStatus ? doorStatus.locked : true,
        battery_level: doorStatus ? doorStatus.battery_level : 100,
        last_update: doorStatus ? doorStatus.last_update : new Date().toISOString(),
        camera_active: doorStatus ? doorStatus.camera_active : false,
        wifi_strength: doorStatus ? doorStatus.wifi_strength : 100,
        temperature: doorStatus ? doorStatus.temperature : 25,
        humidity: doorStatus ? doorStatus.humidity : 60,
        firmware_version: doorStatus ? doorStatus.firmware_version : '1.0.0',
        last_maintenance: doorStatus ? doorStatus.last_maintenance : new Date().toISOString(),
        access_level: userAccess.access_level
      };
    });
    
    res.json({
      success: true,
      data: accessibleDoors,
      message: `Found ${accessibleDoors.length} doors for user`
    });
    
  } catch (error) {
    console.error('Get user accessible doors error:', error);
    res.status(500).json({
      error: 'Failed to get user accessible doors',
      message: error.message,
      code: 'USER_ACCESS_ERROR'
    });
  }
});

module.exports = router;