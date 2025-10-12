const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, randomErrorMiddleware } = require('../middleware/common');
const { loadSampleData, generateIndonesianName } = require('../data/sampleData');

const router = express.Router();

// Apply authentication and random error simulation
router.use(authenticateToken);
// router.use(randomErrorMiddleware);

// GET /api/users - Get all users with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      limit = 20,
      offset = 0,
      role,
      face_registered,
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    // Check if user has permission to view users
    if (req.user.role !== 'admin' && req.user.role !== 'family') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Insufficient permissions to view users',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const data = loadSampleData();
    let users = [...data.users];

    // Filter by role
    if (role) {
      users = users.filter(user => user.role === role);
    }

    // Filter by face registration status
    if (face_registered !== undefined) {
      const faceRegistered = face_registered === 'true';
      users = users.filter(user => user.face_registered === faceRegistered);
    }

    // Search by name or email
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Sort users
    users.sort((a, b) => {
      let aValue = a[sort_by];
      let bValue = b[sort_by];

      if (sort_by === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sort_order === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const totalUsers = users.length;
    const paginatedUsers = users.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    // Remove sensitive information for non-admin users
    const sanitizedUsers = paginatedUsers.map(user => {
      const sanitized = { ...user };
      if (req.user.role !== 'admin') {
        delete sanitized.phone;
      }
      return sanitized;
    });

    res.json({
      success: true,
      data: sanitizedUsers,
      pagination: {
        total: totalUsers,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: parseInt(offset) + parseInt(limit) < totalUsers
      },
      filters: {
        role,
        face_registered,
        search,
        sort_by,
        sort_order
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to get users',
      message: error.message,
      code: 'GET_USERS_ERROR'
    });
  }
});

// GET /api/users/:id - Get specific user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = loadSampleData();

    const user = data.users.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own profile',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Remove sensitive information for non-admin users
    const sanitizedUser = { ...user };
    if (req.user.role !== 'admin' && req.user.id !== id) {
      delete sanitizedUser.phone;
    }

    res.json({
      success: true,
      data: sanitizedUser
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user',
      message: error.message,
      code: 'GET_USER_ERROR'
    });
  }
});

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    const { name, email, role = 'user', phone } = req.body;

    // Only admin can create users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only admin can create users',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        error: 'Name and email are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Validate role
    const validRoles = ['admin', 'user', 'guest', 'family'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        code: 'INVALID_ROLE',
        valid_roles: validRoles
      });
    }

    const data = loadSampleData();

    // Check if user already exists
    const existingUser = data.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Create new user
    const newUser = {
      id: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role,
      phone: phone || null,
      face_registered: false,
      created_at: new Date().toISOString(),
      avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`
    };

    data.users.push(newUser);

    // Create notification for new user creation
    const notification = {
      id: uuidv4(),
      type: 'user_created',
      message: `User baru ditambahkan: ${newUser.name} (${newUser.role})`,
      read: false,
      created_at: new Date().toISOString(),
      priority: 'low',
      user_id: null
    };

    data.notifications.unshift(notification);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'Failed to create user',
      message: error.message,
      code: 'CREATE_USER_ERROR'
    });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, face_registered } = req.body;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own profile',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const data = loadSampleData();
    const userIndex = data.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = data.users[userIndex];

    // Non-admin users can't change their role
    if (req.user.role !== 'admin' && role && role !== user.role) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You cannot change your own role',
        code: 'ROLE_CHANGE_DENIED'
      });
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Invalid email format',
          code: 'INVALID_EMAIL'
        });
      }

      // Check if email is already taken by another user
      const existingUser = data.users.find(u => u.email === email && u.id !== id);
      if (existingUser) {
        return res.status(409).json({
          error: 'Email already exists',
          message: 'Another user already has this email',
          code: 'EMAIL_EXISTS'
        });
      }
    }

    // Update user fields
    const updatedUser = {
      ...user,
      name: name || user.name,
      email: email || user.email,
      role: (req.user.role === 'admin' && role) ? role : user.role,
      phone: phone !== undefined ? phone : user.phone,
      face_registered: face_registered !== undefined ? face_registered : user.face_registered
    };

    data.users[userIndex] = updatedUser;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: error.message,
      code: 'UPDATE_USER_ERROR'
    });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Only admin can delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only admin can delete users',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      return res.status(400).json({
        error: 'Cannot delete yourself',
        message: 'Admin cannot delete their own account',
        code: 'SELF_DELETE_DENIED'
      });
    }

    const data = loadSampleData();
    const userIndex = data.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = data.users[userIndex];

    // Remove user
    data.users.splice(userIndex, 1);

    // Create notification for user deletion
    const notification = {
      id: uuidv4(),
      type: 'user_deleted',
      message: `User dihapus: ${user.name} (${user.role})`,
      read: false,
      created_at: new Date().toISOString(),
      priority: 'medium',
      user_id: null
    };

    data.notifications.unshift(notification);

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deleted_user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: error.message,
      code: 'DELETE_USER_ERROR'
    });
  }
});

// POST /api/users/:id/register-face - Register face for user
router.post('/:id/register-face', async (req, res) => {
  try {
    const { id } = req.params;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only register face for your own profile',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const data = loadSampleData();
    const userIndex = data.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Simulate face registration process
    const success = Math.random() > 0.1; // 90% success rate

    if (!success) {
      return res.status(422).json({
        error: 'Face registration failed',
        message: 'Could not capture clear face image. Please try again.',
        code: 'FACE_REGISTRATION_FAILED'
      });
    }

    data.users[userIndex].face_registered = true;

    res.json({
      success: true,
      message: 'Face registered successfully',
      data: {
        user_id: id,
        face_registered: true,
        registered_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Face registration error:', error);
    res.status(500).json({
      error: 'Face registration failed',
      message: error.message,
      code: 'FACE_REGISTRATION_ERROR'
    });
  }
});

module.exports = router;