'use strict';

const { verifyAccessToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate requests using JWT
 * Extracts token from Authorization header and verifies it
 */
function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NO_TOKEN'
      });
    }

    const decoded = verifyAccessToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);

    if (error.code === 'TOKEN_EXPIRED') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.code === 'INVALID_TOKEN') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
}

/**
 * Middleware to check if user has admin role
 * Must be used after authenticateToken middleware
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'NO_TOKEN'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
      code: 'FORBIDDEN'
    });
  }

  next();
}

module.exports = {
  authenticateToken,
  requireAdmin
};

