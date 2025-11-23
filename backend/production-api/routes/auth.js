'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateGoogleAuth, validateRefreshToken } = require('../middleware/validation');
const { authRateLimiter } = require('../middleware/rateLimiter');

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate with Google OAuth
 * @access  Public
 */
router.post('/google', 
  authRateLimiter,
  validateGoogleAuth,
  authController.googleSignIn
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh',
  authRateLimiter,
  validateRefreshToken,
  authController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client should delete tokens)
 * @access  Public (optional: can require auth)
 */
router.post('/logout',
  authController.logout
);

module.exports = router;

