'use strict';

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const historyController = require('../controllers/historyController');

router.get('/access', authenticateToken, historyController.getAccessHistory);
router.get('/photos', authenticateToken, historyController.getPhotoHistory);

module.exports = router;