'use strict';

const db = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

async function getAccessHistory(req, res, next) {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const doorId = req.query.door_id ? parseInt(req.query.door_id) : null;
    const userIdParam = req.query.user_id ? parseInt(req.query.user_id) : null;
    const startDate = req.query.start_date ? new Date(req.query.start_date) : null;
    const endDate = req.query.end_date ? new Date(req.query.end_date) : null;
    const successParam = req.query.success;

    let accessibleDoorIds = [];
    if (userRole === 'admin') {
      const doors = await db.DoorStatus.findAll({ attributes: ['id'] });
      accessibleDoorIds = doors.map(d => Number(d.id));
    } else {
      const access = await db.DoorUser.findAll({ where: { user_id: userId }, attributes: ['door_id'] });
      accessibleDoorIds = access.map(a => Number(a.door_id));
    }

    if (accessibleDoorIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: { total: 0, limit, offset, has_more: false },
        message: 'Access history retrieved successfully'
      });
    }

    const where = {};
    if (doorId && accessibleDoorIds.includes(doorId)) {
      where.door_id = doorId;
    } else {
      where.door_id = { [Op.in]: accessibleDoorIds };
    }
    if (userIdParam) where.user_id = userIdParam;
    if (successParam !== undefined) where.success = successParam === 'true';
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = startDate;
      if (endDate) where.timestamp[Op.lte] = endDate;
    }

    const { count, rows } = await db.AccessLog.findAndCountAll({
      where,
      order: [['timestamp', 'DESC']],
      limit,
      offset
    });

    const userIds = [...new Set(rows.map(r => r.user_id).filter(Boolean))];
    const doorIds = [...new Set(rows.map(r => r.door_id).filter(Boolean))];

    const users = userIds.length > 0 ? await db.User.findAll({ where: { id: { [Op.in]: userIds } } }) : [];
    const doors = doorIds.length > 0 ? await db.DoorStatus.findAll({ where: { id: { [Op.in]: doorIds } } }) : [];
    const usersMap = Object.fromEntries(users.map(u => [u.id, u]));
    const doorsMap = Object.fromEntries(doors.map(d => [d.id, d]));

    const enrichedLogs = rows.map(log => {
      const user = usersMap[log.user_id];
      const door = doorsMap[log.door_id];
      return {
        id: log.id,
        user_id: log.user_id,
        door_id: log.door_id,
        action: log.action,
        timestamp: log.timestamp,
        success: log.success,
        method: log.method,
        ip_address: log.ip_address,
        user: user ? { id: user.id, name: user.name, email: user.email, avatar: user.avatar } : null,
        door: door ? { id: door.id, name: door.name, location: door.location } : null,
        camera_capture: null
      };
    });

    res.json({
      success: true,
      data: enrichedLogs,
      pagination: {
        total: count,
        limit,
        offset,
        has_more: offset + limit < count
      },
      message: 'Access history retrieved successfully'
    });
  } catch (error) {
    logger.error('Get access history error:', error);
    next(error);
  }
}

async function getPhotoHistory(req, res, next) {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const doorId = req.query.door_id ? parseInt(req.query.door_id) : null;
    const eventType = req.query.event_type || null;
    const startDate = req.query.start_date ? new Date(req.query.start_date) : null;
    const endDate = req.query.end_date ? new Date(req.query.end_date) : null;

    // Resolve accessible door ids for this user
    let accessibleDoorIds = [];
    if (userRole === 'admin') {
      const doors = await db.DoorStatus.findAll({ attributes: ['id'] });
      accessibleDoorIds = doors.map(d => Number(d.id));
    } else {
      const access = await db.DoorUser.findAll({ where: { user_id: userId }, attributes: ['door_id'] });
      accessibleDoorIds = access.map(a => Number(a.door_id));
    }

    if (accessibleDoorIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: { total: 0, limit, offset, has_more: false },
        message: 'Photo history retrieved successfully'
      });
    }

    const where = {};
    if (doorId && accessibleDoorIds.includes(doorId)) {
      where.door_id = doorId;
    } else {
      where.door_id = { [Op.in]: accessibleDoorIds };
    }
    if (eventType) where.event_type = eventType;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = startDate;
      if (endDate) where.timestamp[Op.lte] = endDate;
    }

    const { count, rows } = await db.CameraRecord.findAndCountAll({
      where,
      include: [{ model: db.DoorStatus, as: 'door', attributes: ['id', 'name', 'location'] }],
      order: [['timestamp', 'DESC']],
      limit,
      offset
    });

    const imageBaseUrl = process.env.IMAGE_BASE_URL || 'https://camera-storage.example.com';
    const enrichedCaptures = rows.map(record => ({
      id: record.id,
      door_id: record.door_id,
      filename: record.filename,
      event_type: record.event_type,
      timestamp: record.timestamp,
      image_url: `${imageBaseUrl}/images/${record.filename}`,
      thumbnail_url: `${imageBaseUrl}/thumbnails/${record.filename}`,
      door: record.door ? { id: record.door.id, name: record.door.name, location: record.door.location } : null
    }));

    res.json({
      success: true,
      data: enrichedCaptures,
      pagination: {
        total: count,
        limit,
        offset,
        has_more: offset + limit < count
      },
      message: 'Photo history retrieved successfully'
    });
  } catch (error) {
    logger.error('Get photo history error:', error);
    next(error);
  }
}

module.exports = { getAccessHistory, getPhotoHistory };
