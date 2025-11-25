'use strict';

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

router.get('/', authenticateToken, notificationController.getNotifications);
router.post('/mark-read', authenticateToken, notificationController.markRead);

module.exports = router;