const express = require('express');
const { authenticateToken, randomErrorMiddleware } = require('../middleware/common');
const { loadSampleData } = require('../data/sampleData');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Apply authentication and random error simulation
router.use(authenticateToken);
router.use(randomErrorMiddleware);

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const data = loadSampleData();
    
    // Get users
    const users = data.users || [];
    
    res.json({
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users',
      message: error.message,
      code: 'USERS_ERROR'
    });
  }
});

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    const { name, email, role = 'user', phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Mock user creation
    const newUser = {
      id: uuidv4(),
      name,
      email,
      role,
      face_registered: false,
      created_at: new Date().toISOString(),
      phone: phone || null,
      avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`
    };

    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      message: error.message,
      code: 'CREATE_USER_ERROR'
    });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    // Mock user deletion
    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      message: error.message,
      code: 'DELETE_USER_ERROR'
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = loadSampleData();
    
    // Find user by ID
    const user = data.users.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User retrieved successfully'
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user',
      message: error.message,
      code: 'GET_USER_ERROR'
    });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    // Mock user update
    const updatedUser = {
      id,
      name: name || 'Updated User',
      email: email || 'updated@example.com',
      role: role || 'user',
      face_registered: true,
      created_at: new Date().toISOString(),
      phone: phone || '+6281234567890',
      avatar: 'https://via.placeholder.com/150'
    };

    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      message: error.message,
      code: 'UPDATE_USER_ERROR'
    });
  }
});

module.exports = router;