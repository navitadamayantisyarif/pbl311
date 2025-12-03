'use strict';

const db = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { sendToToken } = require('../utils/fcm');

async function getNotifications(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const readParam = req.query.read;
    const type = req.query.type || null;
    const userIdParam = req.query.user_id ? parseInt(req.query.user_id) : null;
    const currentUserId = req.user.userId;
    const isAdmin = req.user.role === 'admin';

    const where = {};
    if (readParam !== undefined) where.read = readParam === 'true';
    if (type) where.type = type;

    if (isAdmin) {
      if (userIdParam) where.user_id = userIdParam;
    } else {
      where.user_id = currentUserId;
    }

    const { count, rows } = await db.Notification.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    const userIds = [...new Set(rows.map(r => r.user_id))];
    const users = userIds.length > 0 ? await db.User.findAll({ where: { id: { [Op.in]: userIds } } }) : [];
    const usersMap = Object.fromEntries(users.map(u => [u.id, u]));

    const enrichedNotifications = rows.map(notif => {
      const user = usersMap[notif.user_id];
      return {
        id: notif.id,
        user_id: notif.user_id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        read: notif.read,
        created_at: notif.created_at,
        user: user ? { id: user.id, name: user.name, email: user.email, avatar: user.avatar } : null
      };
    });

    res.json({
      success: true,
      data: enrichedNotifications,
      pagination: {
        total: count,
        limit,
        offset,
        has_more: offset + limit < count
      },
      message: 'Notifications retrieved successfully'
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    next(error);
  }
}

async function markRead(req, res, next) {
  try {
    const { notification_ids } = req.body;
    if (!notification_ids || !Array.isArray(notification_ids)) {
      return res.status(400).json({ success: false, error: 'Notification IDs array is required', code: 'MISSING_NOTIFICATION_IDS' });
    }
    const isAdmin = req.user.role === 'admin';
    const currentUserId = req.user.userId;

    const where = { id: { [Op.in]: notification_ids } };
    if (!isAdmin) {
      where.user_id = currentUserId;
    }

    const [updatedCount] = await db.Notification.update({ read: true }, { where });

    res.json({ success: true, data: { marked_count: updatedCount, notification_ids, timestamp: new Date().toISOString() }, message: 'Notifications marked as read successfully' });
  } catch (error) {
    logger.error('Mark notifications as read error:', error);
    next(error);
  }
}

async function registerToken(req, res, next) {
  try {
    const { fcm_token } = req.body;
    if (!fcm_token || typeof fcm_token !== 'string') {
      return res.status(400).json({ success: false, error: 'FCM token is required', code: 'MISSING_FCM_TOKEN' });
    }
    const userId = req.user.userId;
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found', code: 'USER_NOT_FOUND' });
    }
    await user.update({ fcm_token });
    res.json({ success: true, message: 'FCM token registered', data: { user_id: userId } });
  } catch (error) {
    logger.error('Register FCM token error:', error);
    next(error);
  }
}

async function pushTest(req, res, next) {
  try {
    const { title = 'SecureDoor', body = 'Test push notification' } = req.body || {};
    const userId = req.user.userId;
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found', code: 'USER_NOT_FOUND' });
    }
    if (!user.fcm_token) {
      return res.status(400).json({ success: false, error: 'FCM token not registered', code: 'FCM_TOKEN_MISSING' });
    }
    const messageId = await sendToToken(user.fcm_token, { title, body });
    await db.Notification.create({ user_id: user.id, type: 'push_test', title, message: body, read: false });
    res.json({ success: true, message: 'Push sent', data: { message_id: messageId } });
  } catch (error) {
    logger.error('Push test error:', error);
    next(error);
  }
}

module.exports = { getNotifications, markRead, registerToken, pushTest };
