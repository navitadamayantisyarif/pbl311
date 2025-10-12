const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, randomErrorMiddleware } = require('../middleware/common');
const { loadSampleData } = require('../data/sampleData');

const router = express.Router();

// Apply random error simulation
router.use(randomErrorMiddleware);

// POST /api/auth/google - Google OAuth authentication
router.post('/google', async (req, res) => {
  try {
    const { id_token, access_token } = req.body;

    // Validate required fields
    if (!id_token) {
      return res.status(400).json({
        error: 'ID token is required',
        code: 'MISSING_ID_TOKEN'
      });
    }

    // Mock Google token validation
    // In real implementation, you'd verify with Google's API
    const mockGoogleUser = {
      id: 'google_' + Math.random().toString(36).substr(2, 9),
      email: req.body.email || 'user@gmail.com',
      name: req.body.name || 'Test User',
      picture: req.body.picture || 'https://randomuser.me/api/portraits/men/1.jpg'
    };

    // Check if user exists in our system
    const data = loadSampleData();
    let user = data.users.find(u => u.email === mockGoogleUser.email);

    if (!user) {
      // Create new user if doesn't exist
      user = {
        id: mockGoogleUser.id,
        name: mockGoogleUser.name,
        email: mockGoogleUser.email,
        role: 'user',
        face_registered: false,
        created_at: new Date().toISOString(),
        avatar: mockGoogleUser.picture,
        phone: null
      };

      data.users.push(user);
      console.log('✅ New user created:', user.email);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET + '_refresh',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          face_registered: user.face_registered,
          avatar: user.avatar,
          created_at: user.created_at
        },
        tokens: {
          access_token: token,
          refresh_token: refreshToken,
          token_type: 'Bearer',
          expires_in: 86400 // 24 hours in seconds
        }
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: error.message,
      code: 'AUTH_ERROR'
    });
  }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refresh_token, JWT_SECRET + '_refresh');
    const data = loadSampleData();
    const user = data.users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate new access token
    const newToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        access_token: newToken,
        token_type: 'Bearer',
        expires_in: 86400
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', async (req, res) => {
  try {
    // In a real implementation, you'd invalidate the token in a blacklist
    // For mock API, we just return success
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: error.message,
      code: 'LOGOUT_ERROR'
    });
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', require('../middleware/common').authenticateToken, async (req, res) => {
  try {
    const data = loadSampleData();
    const user = data.users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        face_registered: user.face_registered,
        avatar: user.avatar,
        phone: user.phone,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get user profile',
      message: error.message,
      code: 'PROFILE_ERROR'
    });
  }
});

module.exports = router;