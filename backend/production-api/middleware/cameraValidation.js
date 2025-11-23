'use strict';

/**
 * Middleware to validate camera stream request
 */
function validateCameraStream(req, res, next) {
  const { door_id } = req.query;

  if (!door_id) {
    return res.status(400).json({
      success: false,
      error: 'Door ID is required',
      code: 'MISSING_DOOR_ID'
    });
  }

  const doorIdInt = parseInt(door_id);
  if (isNaN(doorIdInt)) {
    return res.status(400).json({
      success: false,
      error: 'Door ID must be a valid number',
      code: 'INVALID_DOOR_ID'
    });
  }

  next();
}

/**
 * Middleware to validate camera capture request
 */
function validateCameraCapture(req, res, next) {
  const { door_id, trigger_type } = req.body;

  const errors = [];

  if (!door_id) {
    errors.push('door_id is required');
  } else if (isNaN(parseInt(door_id))) {
    errors.push('door_id must be a valid number');
  }

  if (trigger_type !== undefined && trigger_type !== null) {
    if (typeof trigger_type !== 'string') {
      errors.push('trigger_type must be a string');
    }
    // Valid trigger types: manual, automatic, face_scan, motion_detection, etc.
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors,
      code: 'VALIDATION_ERROR'
    });
  }

  next();
}

module.exports = {
  validateCameraStream,
  validateCameraCapture
};

