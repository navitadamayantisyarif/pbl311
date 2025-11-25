'use strict';

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { validateCreateUser, validateUpdateUser, validateFaceRegister } = require('../middleware/userValidation');

/**
 * @route   GET /api/users
 * @desc    Get all users (admin sees all, regular users see limited info)
 * @access  Private
 */
router.get('/',
  authenticateToken,
  userController.getUsers
);

router.get('/profile',
  authenticateToken,
  userController.getProfile
);

/**
 * @route   POST /api/users
 * @desc    Create new user (admin only)
 * @access  Private (Admin only)
 */
router.post('/',
  authenticateToken,
  validateCreateUser,
  userController.createUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (admin can update anyone, users can update themselves)
 * @access  Private
 */
router.put('/:id',
  authenticateToken,
  validateUpdateUser,
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (admin only)
 * @access  Private (Admin only)
 */
router.delete('/:id',
  authenticateToken,
  userController.deleteUser
);

/**
 * @route   POST /api/users/:id/face-register
 * @desc    Register face data for user (admin can register for anyone, users can register for themselves)
 * @access  Private
 */
router.post('/:id/face-register',
  authenticateToken,
  validateFaceRegister,
  userController.registerFace
);

module.exports = router;

