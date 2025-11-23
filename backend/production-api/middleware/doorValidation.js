'use strict';

/**
 * Middleware to validate door control request
 */
function validateDoorControl(req, res, next) {
  const { door_id, action } = req.body;

  const errors = [];

  if (door_id === undefined || door_id === null) {
    errors.push('door_id is required');
  } else if (typeof door_id !== 'number' && isNaN(parseInt(door_id))) {
    errors.push('door_id must be a number');
  }

  if (!action) {
    errors.push('action is required');
  } else if (typeof action !== 'string') {
    errors.push('action must be a string');
  } else {
    const validActions = ['buka', 'kunci', 'lock', 'unlock'];
    const normalizedAction = action.toLowerCase();
    if (!validActions.includes(normalizedAction)) {
      errors.push('action must be one of: buka, kunci, lock, unlock');
    }
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

/**
 * Middleware to validate door settings update request
 */
function validateDoorSettings(req, res, next) {
  const { door_id, name, location, camera_active, wifi_strength } = req.body;

  const errors = [];

  if (door_id === undefined || door_id === null) {
    errors.push('door_id is required');
  } else if (typeof door_id !== 'number' && isNaN(parseInt(door_id))) {
    errors.push('door_id must be a number');
  }

  if (name !== undefined && name !== null && typeof name !== 'string') {
    errors.push('name must be a string');
  }

  if (location !== undefined && location !== null && typeof location !== 'string') {
    errors.push('location must be a string');
  }

  if (camera_active !== undefined && camera_active !== null && typeof camera_active !== 'boolean') {
    errors.push('camera_active must be a boolean');
  }

  if (wifi_strength !== undefined && wifi_strength !== null) {
    if (typeof wifi_strength !== 'string') {
      errors.push('wifi_strength must be a string');
    } else {
      const validWifiStrengths = ['Excellent', 'Good', 'Fair', 'Weak', 'No Signal'];
      if (!validWifiStrengths.includes(wifi_strength)) {
        errors.push(`wifi_strength must be one of: ${validWifiStrengths.join(', ')}`);
      }
    }
  }

  // At least one field to update should be provided
  if (name === undefined && location === undefined && camera_active === undefined && wifi_strength === undefined) {
    errors.push('At least one field to update must be provided (name, location, camera_active, wifi_strength)');
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
  validateDoorControl,
  validateDoorSettings
};

