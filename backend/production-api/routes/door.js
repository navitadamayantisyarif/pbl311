'use strict';

const express = require('express');
const router = express.Router();
const doorController = require('../controllers/doorController');
const { authenticateToken } = require('../middleware/auth');
const { validateDoorControl, validateDoorSettings } = require('../middleware/doorValidation');

/**
 * @route   GET /api/door/status
 * @desc    Get door status for authenticated user (doors they have access to)
 * @access  Private
 */
router.get('/status',
  authenticateToken,
  doorController.getDoorStatus
);

/**
 * @route   POST /api/door/control
 * @desc    Control door (lock/unlock)
 * @access  Private
 */
router.post('/control',
  authenticateToken,
  validateDoorControl,
  doorController.controlDoor
);

/**
 * @route   PUT /api/door/settings
 * @desc    Update door settings (name, location, camera_active, wifi_strength)
 * @access  Private (requires admin role or door access)
 */
router.put('/settings',
  authenticateToken,
  validateDoorSettings,
  doorController.updateDoorSettings
);

module.exports = router;

