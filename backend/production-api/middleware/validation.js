'use strict';

/**
 * Middleware to validate request body for Google auth
 * OAuth verification dilakukan di aplikasi, backend hanya validasi format data
 */
function validateGoogleAuth(req, res, next) {
  const { id_token, email, name, picture } = req.body;

  const errors = [];

  // id_token diperlukan untuk identifikasi (meskipun tidak di-verify di backend)
  if (!id_token) {
    errors.push('id_token is required');
  } else if (typeof id_token !== 'string') {
    errors.push('id_token must be a string');
  } else if (id_token.trim().length === 0) {
    errors.push('id_token cannot be empty');
  }

  // email diperlukan untuk identifikasi user
  if (!email) {
    errors.push('email is required');
  } else if (typeof email !== 'string') {
    errors.push('email must be a string');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('email must be a valid email address');
  }

  // name dan picture optional, tapi jika ada harus string
  if (name !== undefined && name !== null && typeof name !== 'string') {
    errors.push('name must be a string');
  }

  if (picture !== undefined && picture !== null && typeof picture !== 'string') {
    errors.push('picture must be a string');
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
 * Middleware to validate refresh token request
 */
function validateRefreshToken(req, res, next) {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({
      success: false,
      error: 'refresh_token is required',
      code: 'VALIDATION_ERROR'
    });
  }

  if (typeof refresh_token !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'refresh_token must be a string',
      code: 'VALIDATION_ERROR'
    });
  }

  next();
}

module.exports = {
  validateGoogleAuth,
  validateRefreshToken
};

