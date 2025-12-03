'use strict';

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

router.get('/', authenticateToken, notificationController.getNotifications);
router.post('/mark-read', authenticateToken, notificationController.markRead);
router.post('/register-token', authenticateToken, notificationController.registerToken);
router.post('/push-test', authenticateToken, notificationController.pushTest);

module.exports = router;
