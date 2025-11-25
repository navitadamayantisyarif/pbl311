'use strict';

const express = require('express');
const router = express.Router();
const cameraController = require('../controllers/cameraController');
const { authenticateToken } = require('../middleware/auth');
const { validateCameraStream, validateCameraCapture } = require('../middleware/cameraValidation');

/**
 * @route   GET /api/camera/stream
 * @desc    Get camera stream URL for a door
 * @access  Private
 */
router.get('/stream',
  authenticateToken,
  validateCameraStream,
  cameraController.getCameraStream
);

/**
 * @route   POST /api/camera/capture
 * @desc    Capture photo from door camera
 * @access  Private
 */
router.post('/capture',
  authenticateToken,
  validateCameraCapture,
  cameraController.capturePhoto
);

router.get('/capture/:id',
  authenticateToken,
  cameraController.getCaptureById
);

/**
 * @route   GET /api/camera/recordings
 * @desc    Get list of camera recordings
 * @access  Private
 */
router.get('/recordings',
  authenticateToken,
  cameraController.getRecordings
);

/**
 * @route   DELETE /api/camera/recordings/:id
 * @desc    Delete a camera recording
 * @access  Private
 */
router.delete('/recordings/:id',
  authenticateToken,
  cameraController.deleteRecording
);

module.exports = router;

