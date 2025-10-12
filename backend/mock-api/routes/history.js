const express = require('express');
const { authenticateToken, randomErrorMiddleware } = require('../middleware/common');
const { loadSampleData } = require('../data/sampleData');

const router = express.Router();

// Apply authentication and random error simulation
router.use(authenticateToken);
router.use(randomErrorMiddleware);

// GET /api/history/access - Get access history logs
router.get('/access', async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      user_id,
      action,
      success,
      method,
      date_from,
      date_to,
      sort_by = 'timestamp',
      sort_order = 'desc'
    } = req.query;

    const data = loadSampleData();
    let accessLogs = [...data.accessLogs];

    // Filter by user ID
    if (user_id) {
      accessLogs = accessLogs.filter(log => log.user_id === user_id);
    }

    // Filter by action
    if (action) {
      const validActions = ['unlock', 'lock', 'access_denied', 'face_scan', 'manual_unlock', 'emergency_unlock'];
      if (validActions.includes(action)) {
        accessLogs = accessLogs.filter(log => log.action === action);
      }
    }

    // Filter by success status
    if (success !== undefined) {
      const successBool = success === 'true';
      accessLogs = accessLogs.filter(log => log.success === successBool);
    }

    // Filter by method
    if (method) {
      const validMethods = ['face_recognition', 'mobile_app', 'physical_key', 'emergency_code'];
      if (validMethods.includes(method)) {
        accessLogs = accessLogs.filter(log => log.method === method);
      }
    }

    // Filter by date range
    if (date_from) {
      accessLogs = accessLogs.filter(log => new Date(log.timestamp) >= new Date(date_from));
    }

    if (date_to) {
      accessLogs = accessLogs.filter(log => new Date(log.timestamp) <= new Date(date_to));
    }

    // Sort logs
    accessLogs.sort((a, b) => {
      let aValue = a[sort_by];
      let bValue = b[sort_by];

      if (sort_by === 'timestamp') {
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
    const totalLogs = accessLogs.length;
    const paginatedLogs = accessLogs.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    // Generate statistics
    const stats = {
      total_entries: totalLogs,
      successful_access: accessLogs.filter(log => log.success).length,
      failed_access: accessLogs.filter(log => !log.success).length,
      unique_users: [...new Set(accessLogs.map(log => log.user_id))].length,
      methods_used: [...new Set(accessLogs.map(log => log.method))]
    };

    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        total: totalLogs,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: parseInt(offset) + parseInt(limit) < totalLogs
      },
      statistics: stats,
      filters: {
        user_id,
        action,
        success,
        method,
        date_from,
        date_to,
        sort_by,
        sort_order
      }
    });

  } catch (error) {
    console.error('Get access history error:', error);
    res.status(500).json({
      error: 'Failed to get access history',
      message: error.message,
      code: 'ACCESS_HISTORY_ERROR'
    });
  }
});

// GET /api/history/photos - Get photo capture history
router.get('/photos', async (req, res) => {
  try {
    const {
      limit = 20,
      offset = 0,
      user_id,
      event_type,
      date_from,
      date_to,
      sort_by = 'timestamp',
      sort_order = 'desc'
    } = req.query;

    const data = loadSampleData();
    let photoHistory = [...data.cameraCaptures];

    // Filter by user ID
    if (user_id) {
      photoHistory = photoHistory.filter(photo => photo.user_id === user_id);
    }

    // Filter by event type
    if (event_type) {
      const validEvents = ['motion_detected', 'face_scan', 'manual_capture', 'access_attempt'];
      if (validEvents.includes(event_type)) {
        photoHistory = photoHistory.filter(photo => photo.event_type === event_type);
      }
    }

    // Filter by date range
    if (date_from) {
      photoHistory = photoHistory.filter(photo => new Date(photo.timestamp) >= new Date(date_from));
    }

    if (date_to) {
      photoHistory = photoHistory.filter(photo => new Date(photo.timestamp) <= new Date(date_to));
    }

    // Sort photos
    photoHistory.sort((a, b) => {
      let aValue = a[sort_by];
      let bValue = b[sort_by];

      if (sort_by === 'timestamp') {
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
    const totalPhotos = photoHistory.length;
    const paginatedPhotos = photoHistory.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    // Generate statistics
    const stats = {
      total_photos: totalPhotos,
      event_types: [...new Set(photoHistory.map(photo => photo.event_type))].map(type => ({
        type,
        count: photoHistory.filter(photo => photo.event_type === type).length
      })),
      photos_with_users: photoHistory.filter(photo => photo.user_id).length,
      photos_without_users: photoHistory.filter(photo => !photo.user_id).length,
      average_file_size: Math.round(photoHistory.reduce((sum, photo) => sum + (photo.file_size || 0), 0) / totalPhotos)
    };

    res.json({
      success: true,
      data: paginatedPhotos,
      pagination: {
        total: totalPhotos,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: parseInt(offset) + parseInt(limit) < totalPhotos
      },
      statistics: stats,
      filters: {
        user_id,
        event_type,
        date_from,
        date_to,
        sort_by,
        sort_order
      }
    });

  } catch (error) {
    console.error('Get photo history error:', error);
    res.status(500).json({
      error: 'Failed to get photo history',
      message: error.message,
      code: 'PHOTO_HISTORY_ERROR'
    });
  }
});

// GET /api/history/summary - Get summary statistics
router.get('/summary', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const validPeriods = ['24h', '7d', '30d', '90d'];

    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        error: 'Invalid period',
        code: 'INVALID_PERIOD',
        valid_periods: validPeriods
      });
    }

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
    }

    // Filter data by period
    const accessLogs = data.accessLogs.filter(log => new Date(log.timestamp) >= dateFrom);
    const photos = data.cameraCaptures.filter(photo => new Date(photo.timestamp) >= dateFrom);

    // Calculate access statistics
    const accessStats = {
      total_attempts: accessLogs.length,
      successful_access: accessLogs.filter(log => log.success && log.action === 'unlock').length,
      failed_attempts: accessLogs.filter(log => !log.success).length,
      unique_users: [...new Set(accessLogs.map(log => log.user_id))].length,
      most_active_user: null,
      peak_hours: [],
      methods_breakdown: {}
    };

    // Find most active user
    const userActivity = {};
    accessLogs.forEach(log => {
      userActivity[log.user_id] = (userActivity[log.user_id] || 0) + 1;
    });

    const mostActiveUserId = Object.keys(userActivity).reduce((a, b) =>
      userActivity[a] > userActivity[b] ? a : b, null
    );

    if (mostActiveUserId) {
      const user = data.users.find(u => u.id === mostActiveUserId);
      accessStats.most_active_user = {
        id: mostActiveUserId,
        name: user ? user.name : 'Unknown',
        access_count: userActivity[mostActiveUserId]
      };
    }

    // Calculate peak hours
    const hourActivity = {};
    accessLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourActivity[hour] = (hourActivity[hour] || 0) + 1;
    });

    accessStats.peak_hours = Object.keys(hourActivity)
      .sort((a, b) => hourActivity[b] - hourActivity[a])
      .slice(0, 3)
      .map(hour => ({
        hour: parseInt(hour),
        count: hourActivity[hour]
      }));

    // Methods breakdown
    accessLogs.forEach(log => {
      accessStats.methods_breakdown[log.method] = (accessStats.methods_breakdown[log.method] || 0) + 1;
    });

    // Calculate photo statistics
    const photoStats = {
      total_photos: photos.length,
      motion_detected: photos.filter(p => p.event_type === 'motion_detected').length,
      face_scans: photos.filter(p => p.event_type === 'face_scan').length,
      manual_captures: photos.filter(p => p.event_type === 'manual_capture').length,
      access_attempts: photos.filter(p => p.event_type === 'access_attempt').length,
      identified_users: photos.filter(p => p.user_id).length,
      unidentified_captures: photos.filter(p => !p.user_id).length
    };

    // System health
    const systemHealth = {
      door_status: data.doorStatus.locked ? 'locked' : 'unlocked',
      battery_level: data.doorStatus.battery_level,
      camera_online: data.doorStatus.camera_active,
      wifi_strength: data.doorStatus.wifi_strength,
      last_activity: accessLogs.length > 0 ? accessLogs[0].timestamp : null,
      unread_notifications: data.notifications.filter(n => !n.read).length
    };

    res.json({
      success: true,
      data: {
        period,
        date_range: {
          from: dateFrom.toISOString(),
          to: now.toISOString()
        },
        access_statistics: accessStats,
        photo_statistics: photoStats,
        system_health: systemHealth
      }
    });

  } catch (error) {
    console.error('Get history summary error:', error);
    res.status(500).json({
      error: 'Failed to get history summary',
      message: error.message,
      code: 'SUMMARY_ERROR'
    });
  }
});

// GET /api/history/timeline - Get timeline view of events
router.get('/timeline', async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      date_from,
      date_to,
      event_types = 'all'
    } = req.query;

    const data = loadSampleData();
    let timelineEvents = [];

    // Add access logs to timeline
    data.accessLogs.forEach(log => {
      timelineEvents.push({
        id: log.id,
        type: 'access',
        timestamp: log.timestamp,
        title: `${log.action.charAt(0).toUpperCase() + log.action.slice(1)} attempt`,
        description: `${log.user_name} ${log.success ? 'successfully' : 'failed to'} ${log.action} using ${log.method}`,
        user: {
          id: log.user_id,
          name: log.user_name
        },
        success: log.success,
        method: log.method,
        icon: log.success ? '🔓' : '❌',
        priority: log.success ? 'normal' : 'high'
      });
    });

    // Add photo captures to timeline
    data.cameraCaptures.forEach(photo => {
      timelineEvents.push({
        id: photo.id,
        type: 'photo',
        timestamp: photo.timestamp,
        title: `Photo captured - ${photo.event_type.replace('_', ' ')}`,
        description: photo.user_id ?
          `Photo captured of ${photo.user_name}` :
          'Unidentified person captured',
        user: photo.user_id ? {
          id: photo.user_id,
          name: photo.user_name
        } : null,
        image_url: photo.thumbnail_url,
        event_type: photo.event_type,
        icon: '📷',
        priority: 'normal'
      });
    });

    // Add notifications to timeline (high priority only)
    data.notifications
      .filter(notif => notif.priority === 'high')
      .forEach(notif => {
        timelineEvents.push({
          id: notif.id,
          type: 'notification',
          timestamp: notif.created_at,
          title: notif.type.replace('_', ' ').toUpperCase(),
          description: notif.message,
          user: notif.user_id ? {
            id: notif.user_id,
            name: data.users.find(u => u.id === notif.user_id)?.name || 'Unknown'
          } : null,
          notification_type: notif.type,
          icon: '🚨',
          priority: notif.priority
        });
      });

    // Filter by event types
    if (event_types !== 'all') {
      const allowedTypes = event_types.split(',');
      timelineEvents = timelineEvents.filter(event => allowedTypes.includes(event.type));
    }

    // Filter by date range
    if (date_from) {
      timelineEvents = timelineEvents.filter(event => new Date(event.timestamp) >= new Date(date_from));
    }

    if (date_to) {
      timelineEvents = timelineEvents.filter(event => new Date(event.timestamp) <= new Date(date_to));
    }

    // Sort by timestamp (newest first)
    timelineEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const totalEvents = timelineEvents.length;
    const paginatedEvents = timelineEvents.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      data: paginatedEvents,
      pagination: {
        total: totalEvents,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: parseInt(offset) + parseInt(limit) < totalEvents
      },
      filters: {
        event_types,
        date_from,
        date_to
      }
    });

  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({
      error: 'Failed to get timeline',
      message: error.message,
      code: 'TIMELINE_ERROR'
    });
  }
});

module.exports = router;