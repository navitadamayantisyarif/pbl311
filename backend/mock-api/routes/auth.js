const express = require('express');
const jwt = require('jsonwebtoken');
const { randomErrorMiddleware } = require('../middleware/common');
const { loadSampleData } = require('../data/sampleData');

const router = express.Router();

// Apply random error simulation
router.use(randomErrorMiddleware);

// POST /api/auth/google - Google authentication
router.post('/google', async (req, res) => {
  try {
    const { token, email, name, picture } = req.body;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        error: 'Google token and email are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Mock Google token validation
    const userData = {
      id: `google_${Date.now()}`,
      email,
      name: name || 'Google User',
      picture: picture || 'https://via.placeholder.com/150',
      provider: 'google'
    };

    // Generate JWT token
    const jwtToken = jwt.sign(
      { 
        userId: userData.id, 
        email: userData.email,
        name: userData.name 
      },
      'mock-secret-key-for-testing',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        user: userData,
        token: jwtToken,
        expiresIn: '24h'
      },
      message: 'Authentication successful'
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: error.message,
      code: 'AUTH_ERROR'
    });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    // In a real app, you would blacklist the token
    // For mock purposes, we just return success
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      message: error.message,
      code: 'LOGOUT_ERROR'
    });
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, 'mock-secret-key-for-testing');
    
    // Mock user data
    const userData = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: 'user',
      face_registered: true,
      created_at: new Date().toISOString(),
      phone: '+6281234567890',
      avatar: 'https://via.placeholder.com/150'
    };

    res.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      code: 'TOKEN_INVALID'
    });
  }
});

module.exports = router;