const express = require('express');
const { authenticateToken, randomErrorMiddleware } = require('../middleware/common');
const { loadSampleData } = require('../data/sampleData');

const router = express.Router();

// Apply authentication and random error simulation
router.use(authenticateToken);
router.use(randomErrorMiddleware);

// GET /api/notifications - Get notifications
router.get('/', async (req, res) => {
  try {
    const { 
      limit = 20, 
      offset = 0, 
      read, 
      priority, 
      type,
      user_id 
    } = req.query;
    
    const data = loadSampleData();
    
    // Get notifications
    let notifications = data.notifications || [];
    
    // Apply filters
    if (read !== undefined) {
      const readBool = read === 'true';
      notifications = notifications.filter(notif => notif.read === readBool);
    }
    
    if (priority) {
      notifications = notifications.filter(notif => notif.priority === priority);
    }
    
    if (type) {
      notifications = notifications.filter(notif => notif.type === type);
    }
    
    if (user_id) {
      notifications = notifications.filter(notif => notif.user_id === user_id);
    }
    
    // Apply pagination
    const totalNotifications = notifications.length;
    const paginatedNotifications = notifications.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      success: true,
      data: paginatedNotifications,
      pagination: {
        total: totalNotifications,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: parseInt(offset) + parseInt(limit) < totalNotifications
      },
      message: 'Notifications retrieved successfully'
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notifications',
      message: error.message,
      code: 'NOTIFICATIONS_ERROR'
    });
  }
});

// POST /api/notifications/mark-read - Mark notifications as read
router.post('/mark-read', async (req, res) => {
  try {
    const { notification_ids } = req.body;

    if (!notification_ids || !Array.isArray(notification_ids)) {
      return res.status(400).json({
        success: false,
        error: 'Notification IDs array is required',
        code: 'MISSING_NOTIFICATION_IDS'
      });
    }

    // Mock mark as read response
    const result = {
      marked_count: notification_ids.length,
      notification_ids,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: result,
      message: 'Notifications marked as read successfully'
    });

  } catch (error) {
    console.error('Mark notifications as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notifications as read',
      message: error.message,
      code: 'MARK_READ_ERROR'
    });
  }
});

// POST /api/notifications/mark-all-read - Mark all notifications as read
router.post('/mark-all-read', async (req, res) => {
  try {
    const { user_id } = req.body;

    // Mock mark all as read response
    const result = {
      marked_count: Math.floor(Math.random() * 10) + 1, // Random count
      user_id: user_id || 'current_user',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: result,
      message: 'All notifications marked as read successfully'
    });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
      message: error.message,
      code: 'MARK_ALL_READ_ERROR'
    });
  }
});

// GET /api/notifications/unread-count - Get unread notifications count
router.get('/unread-count', async (req, res) => {
  try {
    const { user_id } = req.query;
    const data = loadSampleData();
    
    // Get notifications
    let notifications = data.notifications || [];
    
    // Filter by user_id if provided
    if (user_id) {
      notifications = notifications.filter(notif => notif.user_id === user_id);
    }
    
    // Count unread notifications
    const unreadCount = notifications.filter(notif => !notif.read).length;
    
    res.json({
      success: true,
      data: {
        unread_count: unreadCount,
        user_id: user_id || 'current_user'
      },
      message: 'Unread count retrieved successfully'
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count',
      message: error.message,
      code: 'UNREAD_COUNT_ERROR'
    });
  }
});

// POST /api/notifications - Create new notification
router.post('/', async (req, res) => {
  try {
    const { type, message, priority = 'medium', user_id, door_id } = req.body;

    if (!type || !message) {
      return res.status(400).json({
        success: false,
        error: 'Type and message are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Mock notification creation
    const newNotification = {
      id: `notif_${Date.now()}`,
      type,
      message,
      priority,
      user_id: user_id || null,
      door_id: door_id || null,
      door_name: door_id ? `Door ${door_id}` : null,
      read: false,
      created_at: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: newNotification,
      message: 'Notification created successfully'
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create notification',
      message: error.message,
      code: 'CREATE_NOTIFICATION_ERROR'
    });
  }
});

module.exports = router;