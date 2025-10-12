const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, randomErrorMiddleware } = require('../middleware/common');
const { loadSampleData } = require('../data/sampleData');

const router = express.Router();

// Apply authentication and random error simulation
router.use(authenticateToken);
router.use(randomErrorMiddleware);

// GET /api/notifications - Get notifications with filtering
router.get('/', async (req, res) => {
  try {
    const {
      limit = 20,
      offset = 0,
      read,
      type,
      priority,
      date_from,
      date_to,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const data = loadSampleData();
    let notifications = [...data.notifications];

    // Filter by read status
    if (read !== undefined) {
      const readStatus = read === 'true';
      notifications = notifications.filter(notif => notif.read === readStatus);
    }

    // Filter by type
    if (type) {
      const validTypes = ['access_granted', 'access_denied', 'low_battery', 'system_update', 'maintenance_required', 'camera_offline', 'user_created', 'user_deleted', 'photo_captured', 'emergency_access'];
      if (validTypes.includes(type)) {
        notifications = notifications.filter(notif => notif.type === type);
      }
    }

    // Filter by priority
    if (priority) {
      const validPriorities = ['low', 'medium', 'high'];
      if (validPriorities.includes(priority)) {
        notifications = notifications.filter(notif => notif.priority === priority);
      }
    }

    // Filter by date range
    if (date_from) {
      notifications = notifications.filter(notif => new Date(notif.created_at) >= new Date(date_from));
    }

    if (date_to) {
      notifications = notifications.filter(notif => new Date(notif.created_at) <= new Date(date_to));
    }

    // Sort notifications
    notifications.sort((a, b) => {
      let aValue = a[sort_by];
      let bValue = b[sort_by];

      if (sort_by === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sort_order === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const totalNotifications = notifications.length;
    const paginatedNotifications = notifications.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    // Generate statistics
    const stats = {
      total: totalNotifications,
      unread: notifications.filter(n => !n.read).length,
      by_priority: {
        high: notifications.filter(n => n.priority === 'high').length,
        medium: notifications.filter(n => n.priority === 'medium').length,
        low: notifications.filter(n => n.priority === 'low').length
      },
      by_type: {}
    };

    // Count by type
    notifications.forEach(notif => {
      stats.by_type[notif.type] = (stats.by_type[notif.type] || 0) + 1;
    });

    res.json({
      success: true,
      data: paginatedNotifications,
      pagination: {
        total: totalNotifications,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: parseInt(offset) + parseInt(limit) < totalNotifications
      },
      statistics: stats,
      filters: {
        read,
        type,
        priority,
        date_from,
        date_to,
        sort_by,
        sort_order
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Failed to get notifications',
      message: error.message,
      code: 'GET_NOTIFICATIONS_ERROR'
    });
  }
});

// GET /api/notifications/:id - Get specific notification
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = loadSampleData();

    const notification = data.notifications.find(n => n.id === id);

    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found',
        code: 'NOTIFICATION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({
      error: 'Failed to get notification',
      message: error.message,
      code: 'GET_NOTIFICATION_ERROR'
    });
  }
});

// POST /api/notifications/mark-read - Mark notifications as read
router.post('/mark-read', async (req, res) => {
  try {
    const { notification_ids, mark_all = false } = req.body;

    if (!mark_all && (!notification_ids || !Array.isArray(notification_ids))) {
      return res.status(400).json({
        error: 'notification_ids array is required when mark_all is false',
        code: 'MISSING_NOTIFICATION_IDS'
      });
    }

    const data = loadSampleData();
    let updatedCount = 0;

    if (mark_all) {
      // Mark all notifications as read
      data.notifications.forEach(notification => {
        if (!notification.read) {
          notification.read = true;
          updatedCount++;
        }
      });
    } else {
      // Mark specific notifications as read
      notification_ids.forEach(id => {
        const notification = data.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
          notification.read = true;
          updatedCount++;
        }
      });
    }

    res.json({
      success: true,
      message: `${updatedCount} notification(s) marked as read`,
      data: {
        updated_count: updatedCount,
        mark_all: mark_all,
        notification_ids: mark_all ? null : notification_ids
      }
    });

  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      error: 'Failed to mark notifications as read',
      message: error.message,
      code: 'MARK_READ_ERROR'
    });
  }
});

// POST /api/notifications/mark-unread - Mark notifications as unread
router.post('/mark-unread', async (req, res) => {
  try {
    const { notification_ids } = req.body;

    if (!notification_ids || !Array.isArray(notification_ids)) {
      return res.status(400).json({
        error: 'notification_ids array is required',
        code: 'MISSING_NOTIFICATION_IDS'
      });
    }

    const data = loadSampleData();
    let updatedCount = 0;

    notification_ids.forEach(id => {
      const notification = data.notifications.find(n => n.id === id);
      if (notification && notification.read) {
        notification.read = false;
        updatedCount++;
      }
    });

    res.json({
      success: true,
      message: `${updatedCount} notification(s) marked as unread`,
      data: {
        updated_count: updatedCount,
        notification_ids
      }
    });

  } catch (error) {
    console.error('Mark unread error:', error);
    res.status(500).json({
      error: 'Failed to mark notifications as unread',
      message: error.message,
      code: 'MARK_UNREAD_ERROR'
    });
  }
});

// DELETE /api/notifications/:id - Delete specific notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Only admin can delete notifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only admin can delete notifications',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const data = loadSampleData();
    const notificationIndex = data.notifications.findIndex(n => n.id === id);

    if (notificationIndex === -1) {
      return res.status(404).json({
        error: 'Notification not found',
        code: 'NOTIFICATION_NOT_FOUND'
      });
    }

    const notification = data.notifications[notificationIndex];

    // Remove notification
    data.notifications.splice(notificationIndex, 1);

    res.json({
      success: true,
      message: 'Notification deleted successfully',
      data: {
        deleted_notification: {
          id: notification.id,
          type: notification.type,
          created_at: notification.created_at
        }
      }
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: 'Failed to delete notification',
      message: error.message,
      code: 'DELETE_NOTIFICATION_ERROR'
    });
  }
});

// POST /api/notifications - Create new notification (admin only)
router.post('/', async (req, res) => {
  try {
    const { type, message, priority = 'medium', user_id } = req.body;

    // Only admin can create notifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only admin can create notifications',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Validate required fields
    if (!type || !message) {
      return res.status(400).json({
        error: 'Type and message are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Validate type
    const validTypes = ['access_granted', 'access_denied', 'low_battery', 'system_update', 'maintenance_required', 'camera_offline', 'user_created', 'user_deleted', 'photo_captured', 'emergency_access', 'custom'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: 'Invalid notification type',
        code: 'INVALID_TYPE',
        valid_types: validTypes
      });
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        error: 'Invalid priority',
        code: 'INVALID_PRIORITY',
        valid_priorities: validPriorities
      });
    }

    const data = loadSampleData();

    // Validate user_id if provided
    if (user_id) {
      const user = data.users.find(u => u.id === user_id);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
    }

    // Create new notification
    const newNotification = {
      id: uuidv4(),
      type,
      message: message.trim(),
      read: false,
      created_at: new Date().toISOString(),
      priority,
      user_id: user_id || null
    };

    data.notifications.unshift(newNotification);

    // Limit notifications to last 1000
    if (data.notifications.length > 1000) {
      data.notifications = data.notifications.slice(0, 1000);
    }

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: newNotification
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      error: 'Failed to create notification',
      message: error.message,
      code: 'CREATE_NOTIFICATION_ERROR'
    });
  }
});

// GET /api/notifications/unread/count - Get unread notifications count
router.get('/unread/count', async (req, res) => {
  try {
    const data = loadSampleData();
    const unreadCount = data.notifications.filter(n => !n.read).length;

    res.json({
      success: true,
      data: {
        unread_count: unreadCount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: 'Failed to get unread count',
      message: error.message,
      code: 'UNREAD_COUNT_ERROR'
    });
  }
});

// DELETE /api/notifications/clear-all - Clear all notifications (admin only)
router.delete('/clear-all', async (req, res) => {
  try {
    const { older_than_days, priority } = req.query;

    // Only admin can clear all notifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only admin can clear all notifications',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const data = loadSampleData();
    let notificationsToKeep = [...data.notifications];

    // Filter by age if specified
    if (older_than_days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(older_than_days));

      notificationsToKeep = notificationsToKeep.filter(n =>
        new Date(n.created_at) > cutoffDate
      );
    }

    // Filter by priority if specified
    if (priority) {
      const validPriorities = ['low', 'medium', 'high'];
      if (validPriorities.includes(priority)) {
        notificationsToKeep = notificationsToKeep.filter(n => n.priority !== priority);
      }
    }

    const deletedCount = data.notifications.length - notificationsToKeep.length;
    data.notifications = notificationsToKeep;

    res.json({
      success: true,
      message: `${deletedCount} notification(s) cleared`,
      data: {
        deleted_count: deletedCount,
        remaining_count: notificationsToKeep.length,
        filters: {
          older_than_days: older_than_days ? parseInt(older_than_days) : null,
          priority: priority || null
        }
      }
    });

  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({
      error: 'Failed to clear notifications',
      message: error.message,
      code: 'CLEAR_ALL_ERROR'
    });
  }
});

module.exports = router;