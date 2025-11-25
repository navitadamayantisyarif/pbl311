'use strict';

const db = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Get All Users
 * GET /api/users
 * Returns all users (admin only, or users can see limited info)
 */
async function getUsers(req, res, next) {
  try {
    const userRole = req.user.role;
    const isAdmin = userRole === 'admin';

    // Admin can see all users, regular users see limited info
    let users;
    if (isAdmin) {
      users = await db.User.findAll({
        attributes: ['id', 'google_id', 'email', 'name', 'role', 'avatar', 'face_data', 'created_at', 'updated_at'],
        order: [['created_at', 'DESC']]
      });
    } else {
      // Regular users can only see basic info (for assignment purposes, etc)
      users = await db.User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'avatar', 'created_at'],
        order: [['created_at', 'DESC']]
      });
    }

    // Format response - convert face_data boolean
    const formattedUsers = users.map(user => {
      const userData = user.toJSON();
      return {
        ...userData,
        face_registered: !!userData.face_data
      };
    });

    res.json({
      success: true,
      data: formattedUsers,
      message: 'Users retrieved successfully'
    });

  } catch (error) {
    logger.error('Get users error:', error);
    next(error);
  }
}

/**
 * Create User
 * POST /api/users
 * Create a new user (admin only)
 */
async function createUser(req, res, next) {
  try {
    const userRole = req.user.role;
    
    // Only admin can create users
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
        code: 'FORBIDDEN'
      });
    }

    const { name, email, role = 'user', avatar, google_id } = req.body;

    // Check if user with email already exists
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
        code: 'DUPLICATE_EMAIL'
      });
    }

    // Create new user
    const user = await db.User.create({
      name,
      email,
      role,
      avatar: avatar || null,
      google_id: google_id || null,
      face_data: null
    });


    const userData = user.toJSON();
    res.status(201).json({
      success: true,
      data: {
        ...userData,
        face_registered: !!userData.face_data
      },
      message: 'User created successfully'
    });

  } catch (error) {
    logger.error('Create user error:', error);
    next(error);
  }
}

/**
 * Update User
 * PUT /api/users/:id
 * Update user information
 */
async function updateUser(req, res, next) {
  try {
    const userId = parseInt(req.params.id);
    const currentUserId = req.user.userId;
    const userRole = req.user.role;
    const { name, email, role, avatar } = req.body;

    // Get user to update
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Authorization check: admin can update anyone, users can only update themselves
    const isAdmin = userRole === 'admin';
    const isOwnProfile = currentUserId === userId;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only update your own profile',
        code: 'ACCESS_DENIED'
      });
    }

    // Regular users cannot change their role
    if (!isAdmin && role && role !== user.role) {
      return res.status(403).json({
        success: false,
        error: 'Cannot change role. Admin access required',
        code: 'FORBIDDEN'
      });
    }

    // Check email uniqueness if email is being changed
    if (email && email !== user.email) {
      const emailExists = await db.User.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: userId }
        } 
      });
      
      if (emailExists) {
        return res.status(409).json({
          success: false,
          error: 'Email already in use',
          code: 'DUPLICATE_EMAIL'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined && isAdmin) updateData.role = role;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Update user
    await user.update(updateData);


    const userData = user.toJSON();
    res.json({
      success: true,
      data: {
        ...userData,
        face_registered: !!userData.face_data
      },
      message: 'User updated successfully'
    });

  } catch (error) {
    logger.error('Update user error:', error);
    next(error);
  }
}

/**
 * Delete User
 * DELETE /api/users/:id
 * Delete a user (admin only)
 */
async function deleteUser(req, res, next) {
  try {
    const userId = parseInt(req.params.id);
    const currentUserId = req.user.userId;
    const userRole = req.user.role;

    // Only admin can delete users
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
        code: 'FORBIDDEN'
      });
    }

    // Prevent self-deletion (optional safety check)
    if (currentUserId === userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account',
        code: 'SELF_DELETE_NOT_ALLOWED'
      });
    }

    // Get user
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Delete user (cascade will handle related records via foreign keys)
    await user.destroy();


    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    logger.error('Delete user error:', error);
    next(error);
  }
}

/**
 * Face Register
 * POST /api/users/:id/face-register
 * Register face data for a user
 */
async function registerFace(req, res, next) {
  try {
    const userId = parseInt(req.params.id);
    const currentUserId = req.user.userId;
    const userRole = req.user.role;
    const { face_data } = req.body;

    // Get user
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Authorization: admin can register face for anyone, users can only register their own
    const isAdmin = userRole === 'admin';
    const isOwnProfile = currentUserId === userId;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only register face for your own account',
        code: 'ACCESS_DENIED'
      });
    }

    // Validate face_data
    if (!face_data) {
      return res.status(400).json({
        success: false,
        error: 'face_data is required',
        code: 'VALIDATION_ERROR'
      });
    }

    if (typeof face_data !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'face_data must be a string',
        code: 'VALIDATION_ERROR'
      });
    }

    // Update user face_data
    await user.update({
      face_data: face_data
    });


    const userData = user.toJSON();
    res.json({
      success: true,
      data: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        face_registered: true,
        updated_at: userData.updated_at
      },
      message: 'Face data registered successfully'
    });

  } catch (error) {
    logger.error('Face register error:', error);
    next(error);
  }
}

async function getProfile(req, res, next) {
  try {
    const userId = req.user.userId;
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found', code: 'USER_NOT_FOUND' });
    }
    const userData = user.toJSON();
    res.json({
      success: true,
      data: {
        id: userData.id,
        google_id: userData.google_id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        avatar: userData.avatar,
        face_registered: !!userData.face_data,
        created_at: userData.created_at
      },
      message: 'User profile retrieved successfully'
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    next(error);
  }
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  registerFace,
  getProfile
};

