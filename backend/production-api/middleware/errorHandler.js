'use strict';

const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * Catches all errors and returns formatted error responses
 */
function errorHandler(err, req, res, next) {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors,
      code: 'VALIDATION_ERROR'
    });
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      error: 'Resource already exists',
      code: 'DUPLICATE_ENTRY'
    });
  }

  // Sequelize database errors
  if (err.name === 'SequelizeDatabaseError') {
    // Don't expose database details in production
    return res.status(500).json({
      success: false,
      error: 'Database error occurred',
      code: 'DATABASE_ERROR'
    });
  }

  // JWT errors (already handled, but just in case)
  if (err.code === 'TOKEN_EXPIRED' || err.code === 'INVALID_TOKEN') {
    return res.status(401).json({
      success: false,
      error: err.message || 'Authentication failed',
      code: err.code || 'AUTH_ERROR'
    });
  }

  // Custom application errors with status code
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message || 'An error occurred',
      code: err.code || 'APPLICATION_ERROR'
    });
  }

  // Default to 500 Internal Server Error
  // Don't expose error details in production
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(500).json({
    success: false,
    error: errorMessage,
    code: 'INTERNAL_ERROR'
  });
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'NOT_FOUND'
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};

