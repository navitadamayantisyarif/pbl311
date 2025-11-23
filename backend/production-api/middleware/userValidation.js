'use strict';

/**
 * Middleware to validate create user request
 */
function validateCreateUser(req, res, next) {
  const { name, email, role, avatar } = req.body;

  const errors = [];

  if (!name) {
    errors.push('name is required');
  } else if (typeof name !== 'string') {
    errors.push('name must be a string');
  } else if (name.trim().length === 0) {
    errors.push('name cannot be empty');
  }

  if (!email) {
    errors.push('email is required');
  } else if (typeof email !== 'string') {
    errors.push('email must be a string');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('email must be a valid email address');
  }

  if (role !== undefined) {
    if (typeof role !== 'string') {
      errors.push('role must be a string');
    } else if (!['user', 'admin'].includes(role)) {
      errors.push('role must be either "user" or "admin"');
    }
  }

  if (avatar !== undefined && avatar !== null && typeof avatar !== 'string') {
    errors.push('avatar must be a string (URL)');
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
 * Middleware to validate update user request
 */
function validateUpdateUser(req, res, next) {
  const { name, email, role, avatar } = req.body;

  const errors = [];

  if (name !== undefined) {
    if (typeof name !== 'string') {
      errors.push('name must be a string');
    } else if (name.trim().length === 0) {
      errors.push('name cannot be empty');
    }
  }

  if (email !== undefined) {
    if (typeof email !== 'string') {
      errors.push('email must be a string');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('email must be a valid email address');
    }
  }

  if (role !== undefined) {
    if (typeof role !== 'string') {
      errors.push('role must be a string');
    } else if (!['user', 'admin'].includes(role)) {
      errors.push('role must be either "user" or "admin"');
    }
  }

  if (avatar !== undefined && avatar !== null && typeof avatar !== 'string') {
    errors.push('avatar must be a string (URL)');
  }

  // At least one field must be provided
  if (name === undefined && email === undefined && role === undefined && avatar === undefined) {
    errors.push('At least one field must be provided for update (name, email, role, avatar)');
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
 * Middleware to validate face register request
 */
function validateFaceRegister(req, res, next) {
  const { face_data } = req.body;

  if (!face_data) {
    return res.status(400).json({
      success: false,
      error: 'face_data is required',
      code: 'VALIDATION_ERROR'
    });
  }

  if (typeof face_data !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'face_data must be a string',
      code: 'VALIDATION_ERROR'
    });
  }

  if (face_data.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'face_data cannot be empty',
      code: 'VALIDATION_ERROR'
    });
  }

  next();
}

module.exports = {
  validateCreateUser,
  validateUpdateUser,
  validateFaceRegister
};

