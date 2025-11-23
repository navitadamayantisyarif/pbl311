'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Get JWT secrets from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate access token
 * @param {Object} payload - Token payload (userId, email, role, etc.)
 * @returns {String} JWT access token
 */
function generateAccessToken(payload) {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES_IN }
  );
}

/**
 * Generate refresh token
 * @param {Object} payload - Token payload (userId, email)
 * @returns {String} JWT refresh token
 */
function generateRefreshToken(payload) {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      type: 'refresh'
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
}

/**
 * Generate both access and refresh tokens
 * @param {Object} payload - Token payload
 * @returns {Object} Object containing access_token and refresh_token
 */
function generateTokenPair(payload) {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'Bearer',
    expires_in: 900 // 15 minutes in seconds
  };
}

/**
 * Verify access token
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Access token expired');
      err.code = 'TOKEN_EXPIRED';
      throw err;
    } else if (error.name === 'JsonWebTokenError') {
      const err = new Error('Invalid access token');
      err.code = 'INVALID_TOKEN';
      throw err;
    }
    throw error;
  }
}

/**
 * Verify refresh token
 * @param {String} token - JWT refresh token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      const err = new Error('Invalid token type');
      err.code = 'INVALID_TOKEN_TYPE';
      throw err;
    }
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Refresh token expired');
      err.code = 'TOKEN_EXPIRED';
      throw err;
    } else if (error.name === 'JsonWebTokenError') {
      const err = new Error('Invalid refresh token');
      err.code = 'INVALID_TOKEN';
      throw err;
    }
    throw error;
  }
}

/**
 * Generate a random token for refresh token storage (optional, for token blacklisting)
 * @returns {String} Random token string
 */
function generateTokenHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenHash
};

