const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, randomErrorMiddleware } = require('../middleware/common');
const { loadSampleData } = require('../data/sampleData');

const router = express.Router();

// Apply authentication and random error simulation
router.use(authenticateToken);
router.use(randomErrorMiddleware);

// GET /api/camera/stream - Get camera stream URL
router.get('/stream', async (req, res) => {
  try {
    const { quality = 'medium' } = req.query;
    const validQualities = ['low', 'medium', 'high'];

    if (!validQualities.includes(quality)) {
      return res.status(400).json({
        error: 'Invalid quality parameter',
        code: 'INVALID_QUALITY',
        valid_qualities: validQualities
      });
    }

    // Simulate camera availability check
    const cameraAvailable = Math.random() > 0.05; // 95% availability

    if (!cameraAvailable) {
      return res.status(503).json({
        error: 'Camera unavailable',
        message: 'Camera is currently offline or under maintenance',
        code: 'CAMERA_OFFLINE',
        retry_after: 60
      });
    }

    // Generate mock stream URLs based on quality
    const streamUrls = {
      low: 'https://mock-stream.smartdoor.com/live/main-door?quality=480p',
      medium: 'https://mock-stream.smartdoor.com/live/main-door?quality=720p',
      high: 'https://mock-stream.smartdoor.com/live/main-door?quality=1080p'
    };

    const streamInfo = {
      stream_url: streamUrls[quality],
      websocket_url: `wss://mock-stream.smartdoor.com/ws/main-door?quality=${quality}`,
      rtsp_url: `rtsp://mock-camera.smartdoor.com:554/stream/${quality}`,
      hls_url: `https://mock-stream.smartdoor.com/hls/main-door/${quality}/playlist.m3u8`,
      quality: quality,
      resolution: quality === 'low' ? '640x480' : quality === 'medium' ? '1280x720' : '1920x1080',
      fps: quality === 'low' ? 15 : quality === 'medium' ? 24 : 30,
      bitrate: quality === 'low' ? '500kbps' : quality === 'medium' ? '2Mbps' : '5Mbps',
      audio_enabled: true,
      night_vision: Math.random() > 0.5,
      motion_detection: true,
      recording_enabled: true,
      expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      status: 'active'
    };

    res.json({
      success: true,
      data: streamInfo
    });

  } catch (error) {
    console.error('Get camera stream error:', error);
    res.status(500).json({
      error: 'Failed to get camera stream',
      message: error.message,
      code: 'STREAM_ERROR'
    });
  }
});

// POST /api/camera/capture - Capture photo from camera
router.post('/capture', async (req, res) => {
  try {
    const { reason = 'manual', quality = 'high' } = req.body;
    const validReasons = ['manual', 'motion_detected', 'face_scan', 'door_access', 'security_check'];
    const validQualities = ['low', 'medium', 'high'];

    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        error: 'Invalid reason parameter',
        code: 'INVALID_REASON',
        valid_reasons: validReasons
      });
    }

    if (!validQualities.includes(quality)) {
      return res.status(400).json({
        error: 'Invalid quality parameter',
        code: 'INVALID_QUALITY',
        valid_qualities: validQualities
      });
    }

    // Simulate capture failure
    const captureSuccess = Math.random() > 0.05; // 95% success rate

    if (!captureSuccess) {
      return res.status(422).json({
        error: 'Photo capture failed',
        message: 'Camera capture error or insufficient lighting',
        code: 'CAPTURE_FAILED',
        retry_after: 5
      });
    }

    const data = loadSampleData();
    const captureId = uuidv4();

    // Generate mock photo URLs
    const photoData = {
      id: captureId,
      user_id: req.user.id,
      user_name: req.user.name,
      timestamp: new Date().toISOString(),
      image_url: `https://picsum.photos/1920/1080?random=${captureId}`,
      thumbnail_url: `https://picsum.photos/320/240?random=${captureId}`,
      event_type: reason,
      quality: quality,
      resolution: quality === 'low' ? '640x480' : quality === 'medium' ? '1280x720' : '1920x1080',
      file_size: Math.floor(Math.random() * 2000) + 500, // 500KB - 2.5MB
      location: 'Main Door Camera',
      metadata: {
        camera_id: 'main-door-001',
        firmware_version: '2.1.3',
        exposure: `1/${Math.floor(Math.random() * 200) + 50}`,
        iso: Math.floor(Math.random() * 800) + 100,
        focal_length: '3.6mm',
        flash: false,
        night_vision: Math.random() > 0.7
      }
    };

    // Add to camera captures
    data.cameraCaptures.unshift(photoData);

    // Limit captures to last 500
    if (data.cameraCaptures.length > 500) {
      data.cameraCaptures = data.cameraCaptures.slice(0, 500);
    }

    // Create notification for manual captures
    if (reason === 'manual') {
      const notification = {
        id: uuidv4(),
        type: 'photo_captured',
        message: `Foto diambil oleh ${req.user.name}`,
        read: false,
        created_at: new Date().toISOString(),
        priority: 'low',
        user_id: req.user.id
      };

      data.notifications.unshift(notification);
    }

    res.status(201).json({
      success: true,
      message: 'Photo captured successfully',
      data: photoData
    });

  } catch (error) {
    console.error('Camera capture error:', error);
    res.status(500).json({
      error: 'Photo capture failed',
      message: error.message,
      code: 'CAPTURE_ERROR'
    });
  }
});

// GET /api/camera/captures - Get captured photos with filtering
router.get('/captures', async (req, res) => {
  try {
    const {
      limit = 20,
      offset = 0,
      event_type,
      user_id,
      date_from,
      date_to,
      sort_by = 'timestamp',
      sort_order = 'desc'
    } = req.query;

    const data = loadSampleData();
    let captures = [...data.cameraCaptures];

    // Filter by event type
    if (event_type) {
      captures = captures.filter(capture => capture.event_type === event_type);
    }

    // Filter by user ID
    if (user_id) {
      captures = captures.filter(capture => capture.user_id === user_id);
    }

    // Filter by date range
    if (date_from) {
      captures = captures.filter(capture => new Date(capture.timestamp) >= new Date(date_from));
    }

    if (date_to) {
      captures = captures.filter(capture => new Date(capture.timestamp) <= new Date(date_to));
    }

    // Sort captures
    captures.sort((a, b) => {
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
      filters: {
        event_type,
        user_id,
        date_from,
        date_to,
        sort_by,
        sort_order
      }
    });

  } catch (error) {
    console.error('Get camera captures error:', error);
    res.status(500).json({
      error: 'Failed to get camera captures',
      message: error.message,
      code: 'GET_CAPTURES_ERROR'
    });
  }
});

// GET /api/camera/captures/:id - Get specific capture
router.get('/captures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = loadSampleData();

    const capture = data.cameraCaptures.find(c => c.id === id);

    if (!capture) {
      return res.status(404).json({
        error: 'Capture not found',
        code: 'CAPTURE_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: capture
    });

  } catch (error) {
    console.error('Get capture error:', error);
    res.status(500).json({
      error: 'Failed to get capture',
      message: error.message,
      code: 'GET_CAPTURE_ERROR'
    });
  }
});

// DELETE /api/camera/captures/:id - Delete specific capture
router.delete('/captures/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Only admin can delete captures
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only admin can delete captures',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const data = loadSampleData();
    const captureIndex = data.cameraCaptures.findIndex(c => c.id === id);

    if (captureIndex === -1) {
      return res.status(404).json({
        error: 'Capture not found',
        code: 'CAPTURE_NOT_FOUND'
      });
    }

    const capture = data.cameraCaptures[captureIndex];

    // Remove capture
    data.cameraCaptures.splice(captureIndex, 1);

    res.json({
      success: true,
      message: 'Capture deleted successfully',
      data: {
        deleted_capture: {
          id: capture.id,
          timestamp: capture.timestamp,
          event_type: capture.event_type
        }
      }
    });

  } catch (error) {
    console.error('Delete capture error:', error);
    res.status(500).json({
      error: 'Failed to delete capture',
      message: error.message,
      code: 'DELETE_CAPTURE_ERROR'
    });
  }
});

// GET /api/camera/status - Get camera system status
router.get('/status', async (req, res) => {
  try {
    const cameraStatus = {
      online: Math.random() > 0.05, // 95% uptime
      resolution: '1920x1080',
      fps: 30,
      recording: Math.random() > 0.2, // 80% recording
      night_vision: Math.random() > 0.5,
      motion_detection: true,
      audio_recording: true,
      storage: {
        total_gb: 1000,
        used_gb: Math.floor(Math.random() * 800) + 100,
        available_gb: Math.floor(Math.random() * 200) + 100
      },
      network: {
        ip_address: '192.168.1.150',
        wifi_strength: Math.floor(Math.random() * 40) + 60, // 60-100%
        bandwidth_usage: Math.floor(Math.random() * 5) + 1 // 1-6 Mbps
      },
      firmware_version: '2.1.3',
      last_maintenance: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      temperature: Math.floor(Math.random() * 15) + 30 // 30-45°C
    };

    res.json({
      success: true,
      data: cameraStatus
    });

  } catch (error) {
    console.error('Get camera status error:', error);
    res.status(500).json({
      error: 'Failed to get camera status',
      message: error.message,
      code: 'CAMERA_STATUS_ERROR'
    });
  }
});

module.exports = router;