'use strict';

const db = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const path = require('path');

/**
 * Get Camera Stream
 * GET /api/camera/stream
 * Get camera stream URL for a specific door
 */
async function getCameraStream(req, res, next) {
  try {
    const doorId = parseInt(req.query.door_id);
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (!doorId) {
      return res.status(400).json({
        success: false,
        error: 'Door ID is required',
        code: 'MISSING_DOOR_ID'
      });
    }

    // Check if door exists
    const door = await db.DoorStatus.findByPk(doorId);
    if (!door) {
      return res.status(404).json({
        success: false,
        error: 'Door not found',
        code: 'DOOR_NOT_FOUND'
      });
    }

    // Check if user has access to this door (admin can access all doors)
    const isAdmin = userRole === 'admin';
    if (!isAdmin) {
      const doorAccess = await db.DoorUser.findOne({
        where: {
          user_id: userId,
          door_id: doorId
        }
      });

      if (!doorAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this door camera',
          code: 'ACCESS_DENIED'
        });
      }
    }

    // Check if camera is active
    if (!door.camera_active) {
      return res.status(400).json({
        success: false,
        error: 'Camera is not active for this door',
        code: 'CAMERA_INACTIVE'
      });
    }

    // Generate stream URL (in production, this would come from camera management system)
    const streamUrl = process.env.CAMERA_STREAM_BASE_URL 
      ? `${process.env.CAMERA_STREAM_BASE_URL}/stream/${doorId}`
      : `rtsp://camera-server.example.com/stream/${doorId}`;

    const streamData = {
      door_id: doorId,
      stream_url: streamUrl,
      status: door.camera_active ? 'active' : 'inactive',
      resolution: '1920x1080', // Could be stored in door settings or camera config
      fps: 30,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: streamData,
      message: 'Camera stream retrieved successfully'
    });

  } catch (error) {
    logger.error('Get camera stream error:', error);
    next(error);
  }
}

/**
 * Capture Photo
 * POST /api/camera/capture
 * Capture a photo from door camera and save to database
 */
async function capturePhoto(req, res, next) {
  try {
    const doorId = parseInt(req.body.door_id);
    const userId = req.user.userId;
    const userRole = req.user.role;
    const triggerType = req.body.trigger_type || 'manual';

    if (!doorId) {
      return res.status(400).json({
        success: false,
        error: 'Door ID is required',
        code: 'MISSING_DOOR_ID'
      });
    }

    // Check if door exists
    const door = await db.DoorStatus.findByPk(doorId);
    if (!door) {
      return res.status(404).json({
        success: false,
        error: 'Door not found',
        code: 'DOOR_NOT_FOUND'
      });
    }

    // Check if user has access (admin can capture from all doors)
    const isAdmin = userRole === 'admin';
    if (!isAdmin) {
      const doorAccess = await db.DoorUser.findOne({
        where: {
          user_id: userId,
          door_id: doorId
        }
      });

      if (!doorAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this door camera',
          code: 'ACCESS_DENIED'
        });
      }
    }

    // Check if camera is active
    if (!door.camera_active) {
      return res.status(400).json({
        success: false,
        error: 'Camera is not active for this door',
        code: 'CAMERA_INACTIVE'
      });
    }

    // Generate filename
    const timestamp = new Date();
    const timestampStr = timestamp.toISOString().replace(/[:.]/g, '-');
    const filename = `capture_door_${doorId}_${timestampStr}_${Date.now()}.jpg`;

    // In production, here you would:
    // 1. Trigger camera to capture photo
    // 2. Save image file to storage (S3, local storage, etc.)
    // 3. Get file size and URL
    // For now, we'll simulate with a mock URL
    
    const imageBaseUrl = process.env.IMAGE_BASE_URL || 'https://camera-storage.example.com';
    const imageUrl = `${imageBaseUrl}/images/${filename}`;
    const thumbnailUrl = `${imageBaseUrl}/thumbnails/${filename}`;
    const fileSize = 250000; // Mock file size in bytes (~250KB)

    // Save capture record to database
    const cameraRecord = await db.CameraRecord.create({
      door_id: doorId,
      filename: filename,
      timestamp: timestamp,
      event_type: triggerType,
      file_size: fileSize
    });

    // Log the action
    try {
      await db.AccessLog.create({
        user_id: userId,
        door_id: doorId,
        action: 'camera_capture',
        success: true,
        method: 'POST',
        timestamp: timestamp,
        ip_address: req.ip || req.connection.remoteAddress
      });
    } catch (logError) {
      logger.error('Failed to log camera capture:', logError);
    }

    // Return capture data
    const captureData = {
      id: cameraRecord.id,
      door_id: doorId,
      trigger_type: triggerType,
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl,
      timestamp: timestamp.toISOString(),
      confidence_score: 0.85, // Mock confidence score (face recognition confidence)
      location: door.location || `Door ${doorId} Camera`,
      filename: filename,
      file_size: fileSize
    };

    res.json({
      success: true,
      data: captureData,
      message: 'Photo captured successfully'
    });

  } catch (error) {
    logger.error('Camera capture error:', error);
    next(error);
  }
}

/**
 * Get Camera Recordings
 * GET /api/camera/recordings
 * Get list of camera recordings/ captures
 */
async function getRecordings(req, res, next) {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const doorId = req.query.door_id ? parseInt(req.query.door_id) : null;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const eventType = req.query.event_type || null;
    const startDate = req.query.start_date ? new Date(req.query.start_date) : null;
    const endDate = req.query.end_date ? new Date(req.query.end_date) : null;

    // Build where clause
    const where = {};
    
    // Filter by door_id
    if (doorId) {
      where.door_id = doorId;

      // Check access if not admin
      const isAdmin = userRole === 'admin';
      if (!isAdmin) {
        const doorAccess = await db.DoorUser.findOne({
          where: {
            user_id: userId,
            door_id: doorId
          }
        });

        if (!doorAccess) {
          return res.status(403).json({
            success: false,
            error: 'Access denied to this door recordings',
            code: 'ACCESS_DENIED'
          });
        }
      }
    } else {
      // If no door_id specified, get doors user has access to
      const isAdmin = userRole === 'admin';
      if (!isAdmin) {
        const userDoorAccess = await db.DoorUser.findAll({
          where: { user_id: userId },
          attributes: ['door_id']
        });
        
        const accessibleDoorIds = userDoorAccess.map(access => access.door_id);
        if (accessibleDoorIds.length > 0) {
          where.door_id = { [Op.in]: accessibleDoorIds };
        } else {
          // User has no door access
          return res.json({
            success: true,
            data: [],
            pagination: {
              total: 0,
              limit,
              offset,
              has_more: false
            },
            message: 'No recordings found'
          });
        }
      }
    }

    // Filter by event_type
    if (eventType) {
      where.event_type = eventType;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp[Op.gte] = startDate;
      }
      if (endDate) {
        where.timestamp[Op.lte] = endDate;
      }
    }

    // Get recordings with door info
    const { count, rows } = await db.CameraRecord.findAndCountAll({
      where,
      include: [
        {
          model: db.DoorStatus,
          as: 'door',
          attributes: ['id', 'name', 'location']
        }
      ],
      order: [['timestamp', 'DESC']],
      limit,
      offset
    });

    // Format response with image URLs
    const imageBaseUrl = process.env.IMAGE_BASE_URL || 'https://camera-storage.example.com';
    const recordings = rows.map(record => {
      const recordData = record.toJSON();
      return {
        id: recordData.id,
        door_id: recordData.door_id,
        filename: recordData.filename,
        timestamp: recordData.timestamp,
        event_type: recordData.event_type,
        file_size: recordData.file_size,
        image_url: `${imageBaseUrl}/images/${recordData.filename}`,
        thumbnail_url: `${imageBaseUrl}/thumbnails/${recordData.filename}`,
        door: recordData.door
      };
    });

    res.json({
      success: true,
      data: recordings,
      pagination: {
        total: count,
        limit,
        offset,
        has_more: offset + limit < count
      },
      message: 'Camera recordings retrieved successfully'
    });

  } catch (error) {
    logger.error('Get camera recordings error:', error);
    next(error);
  }
}

/**
 * Delete Camera Recording
 * DELETE /api/camera/recordings/:id
 * Delete a camera recording
 */
async function deleteRecording(req, res, next) {
  try {
    const recordingId = parseInt(req.params.id);
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Get recording
    const recording = await db.CameraRecord.findByPk(recordingId, {
      include: [
        {
          model: db.DoorStatus,
          as: 'door'
        }
      ]
    });

    if (!recording) {
      return res.status(404).json({
        success: false,
        error: 'Camera recording not found',
        code: 'RECORDING_NOT_FOUND'
      });
    }

    // Check access (admin can delete any, users can delete from doors they have access to)
    const isAdmin = userRole === 'admin';
    if (!isAdmin && recording.door_id) {
      const doorAccess = await db.DoorUser.findOne({
        where: {
          user_id: userId,
          door_id: recording.door_id
        }
      });

      if (!doorAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to delete this recording',
          code: 'ACCESS_DENIED'
        });
      }
    }

    // In production, also delete the actual file from storage
    // await deleteFileFromStorage(recording.filename);

    // Delete from database
    await recording.destroy();

    // Log the action
    try {
      await db.AccessLog.create({
        user_id: userId,
        door_id: recording.door_id,
        action: 'delete_camera_recording',
        success: true,
        method: 'DELETE',
        ip_address: req.ip || req.connection.remoteAddress
      });
    } catch (logError) {
      logger.error('Failed to log recording deletion:', logError);
    }

    res.json({
      success: true,
      message: 'Camera recording deleted successfully'
    });

  } catch (error) {
    logger.error('Delete camera recording error:', error);
    next(error);
  }
}

module.exports = {
  getCameraStream,
  capturePhoto,
  getRecordings,
  deleteRecording
};

