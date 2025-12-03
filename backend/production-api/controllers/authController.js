'use strict';

const db = require('../models');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { verifyGoogleToken } = require('../utils/googleOAuth');

/**
 * Google Sign-In Authentication
 * POST /api/auth/google
 * 
 * Catatan: OAuth verification dilakukan di aplikasi (Android/Web)
 * Backend hanya menerima data yang sudah di-authenticate dan menyimpannya ke database
 */
async function googleSignIn(req, res, next) {
  try {
    const { id_token, email: emailInput, name: nameInput, picture: pictureInput } = req.body;
    const verified = await verifyGoogleToken(id_token);
    const google_id = verified.sub;
    const email = emailInput || verified.email;
    const name = nameInput || verified.name;
    const picture = pictureInput || verified.picture;

    // Cari user hanya berdasarkan google_id agar setiap akun Google unik
    let user = await db.User.findOne({
      where: { google_id: google_id }
    });

    const isNewUser = !user;

    if (user) {
      await user.update({
        name: name || user.name,
        avatar: picture || user.avatar,
        email: email || user.email
      });
    } else {
      // Create new user
      user = await db.User.create({
        google_id: google_id,
        email: email,
        name: name || 'Google User',
        avatar: picture || null,
        role: 'user' // Default role adalah 'user'
      });
    }

    // Generate JWT tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    try {
      const { generateTokenHash } = require('../utils/jwt');
      const hash = generateTokenHash(tokens.refresh_token);
      await user.update({ refresh_token_hash: hash });
    } catch (e) {}

    res.status(isNewUser ? 201 : 200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          google_id: user.google_id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          face_registered: !!user.face_data,
          created_at: user.created_at
        },
        tokens: tokens
      },
      message: 'Authentication successful'
    });

  } catch (error) {
    logger.error('Google sign-in error:', error);

    // Log failed access attempt if we have user info
    if (req.body.email) {
      try {
        const user = await db.User.findOne({ where: { email: req.body.email } });
        if (user) {
          await db.AccessLog.create({
            user_id: user.id,
            action: 'google_signin_failed',
            success: false,
            method: 'POST',
            ip_address: req.ip || req.connection.remoteAddress
          });
        }
      } catch (logError) {
        // Ignore logging errors
      }
    }

    next(error);
  }
}

/**
 * Refresh Access Token
 * POST /api/auth/refresh
 */
async function refreshToken(req, res, next) {
  try {
    const { refresh_token } = req.body;

    // Verify refresh token
    const decoded = verifyRefreshToken(refresh_token);

    // Find user
    const user = await db.User.findByPk(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate new token pair
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    try {
      const { generateTokenHash } = require('../utils/jwt');
      const incomingHash = generateTokenHash(refresh_token);
      if (user.refresh_token_hash && user.refresh_token_hash !== incomingHash) {
        return res.status(401).json({ success: false, error: 'Invalid refresh token', code: 'INVALID_TOKEN' });
      }
      const newHash = generateTokenHash(tokens.refresh_token);
      await user.update({ refresh_token_hash: newHash });
    } catch (e) {
      // tolerate missing column
    }

    res.json({
      success: true,
      data: {
        tokens: tokens
      },
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    logger.error('Token refresh error:', error);

    if (error.code === 'TOKEN_EXPIRED' || error.code === 'INVALID_TOKEN') {
      return res.status(401).json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    next(error);
  }
}

/**
 * Logout User
 * POST /api/auth/logout
 */
async function logout(req, res, next) {
  try {
    // Extract user from token if available (optional, since we might not have auth middleware)
    let userId = null;

    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (token) {
        const { verifyAccessToken } = require('../utils/jwt');
        const decoded = verifyAccessToken(token);
        userId = decoded.userId;
      }
    } catch (tokenError) {
      // Token might be invalid, that's okay for logout
      logger.debug('No valid token for logout:', tokenError.message);
    }


    // In a full implementation, you might want to:
    // 1. Store refresh tokens in database and blacklist them
    // 2. Invalidate session
    // For now, we just return success and client should delete tokens

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
}

module.exports = {
  googleSignIn,
  refreshToken,
  logout
};

