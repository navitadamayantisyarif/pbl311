const express = require('express');
const { authenticateToken, randomErrorMiddleware } = require('../middleware/common');
const { loadSampleData } = require('../data/sampleData');

const router = express.Router();

// Apply authentication and random error simulation
router.use(authenticateToken);
router.use(randomErrorMiddleware);

// GET /api/camera/stream - Get camera stream URL
router.get('/stream', async (req, res) => {
  try {
    const { door_id } = req.query;

    if (!door_id) {
      return res.status(400).json({
        success: false,
        error: 'Door ID is required',
        code: 'MISSING_DOOR_ID'
      });
    }

    // Mock camera stream response
    const streamData = {
      door_id,
      stream_url: `rtsp://mock-camera-server.com/stream/${door_id}`,
      status: 'active',
      resolution: '1920x1080',
      fps: 30,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: streamData,
      message: 'Camera stream retrieved successfully'
    });

  } catch (error) {
    console.error('Get camera stream error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get camera stream',
      message: error.message,
      code: 'CAMERA_STREAM_ERROR'
    });
  }
});

// POST /api/camera/capture - Capture photo
router.post('/capture', async (req, res) => {
  try {
    const { door_id, trigger_type = 'manual' } = req.body;

    if (!door_id) {
      return res.status(400).json({
        success: false,
        error: 'Door ID is required',
        code: 'MISSING_DOOR_ID'
      });
    }

    // Mock camera capture response
    const captureData = {
      id: `capture_${Date.now()}`,
      door_id,
      trigger_type,
      image_url: `https://picsum.photos/640/480?random=${Date.now()}`,
      thumbnail_url: `https://picsum.photos/160/120?random=${Date.now()}`,
      timestamp: new Date().toISOString(),
      confidence_score: Math.random() * 0.3 + 0.7, // 70-100% confidence
      location: `Door ${door_id} Camera`
    };

    res.json({
      success: true,
      data: captureData,
      message: 'Photo captured successfully'
    });

  } catch (error) {
    console.error('Camera capture error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to capture photo',
      message: error.message,
      code: 'CAMERA_CAPTURE_ERROR'
    });
  }
});

// GET /api/camera/photos - Get camera photos
router.get('/photos', async (req, res) => {
  try {
    const { door_id, limit = 20, offset = 0 } = req.query;
    const data = loadSampleData();
    
    // Get camera captures
    let captures = data.cameraCaptures || [];
    
    // Filter by door_id if provided
    if (door_id) {
      captures = captures.filter(capture => capture.door_id === door_id);
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
      message: 'Camera photos retrieved successfully'
    });

  } catch (error) {
    console.error('Get camera photos error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get camera photos',
      message: error.message,
      code: 'CAMERA_PHOTOS_ERROR'
    });
  }
});

// GET /api/camera/status - Get camera status
router.get('/status', async (req, res) => {
  try {
    const { door_id } = req.query;
    const data = loadSampleData();
    
    // Get door statuses to check camera status
    const doorStatuses = data.doorStatus || [];
    
    let cameraStatuses = doorStatuses.map(door => ({
      door_id: door.door_id,
      door_name: door.door_name,
      location: door.location,
      camera_active: door.camera_active,
      last_update: door.last_update
    }));
    
    // Filter by door_id if provided
    if (door_id) {
      cameraStatuses = cameraStatuses.filter(status => status.door_id === door_id);
    }
    
    res.json({
      success: true,
      data: cameraStatuses,
      message: 'Camera status retrieved successfully'
    });

  } catch (error) {
    console.error('Get camera status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get camera status',
      message: error.message,
      code: 'CAMERA_STATUS_ERROR'
    });
  }
});

module.exports = router;