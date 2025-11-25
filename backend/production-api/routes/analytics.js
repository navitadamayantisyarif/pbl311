'use strict';

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

router.get('/dashboard', authenticateToken, analyticsController.getDashboard);

module.exports = router;