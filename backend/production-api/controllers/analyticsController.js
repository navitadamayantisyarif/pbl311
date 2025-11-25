'use strict';

const db = require('../models');
const logger = require('../utils/logger');

async function getDashboard(req, res, next) {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const doorIdFilter = req.query.door_id ? parseInt(req.query.door_id) : null;
    const startDate = req.query.start_date ? new Date(req.query.start_date) : null;
    const endDate = req.query.end_date ? new Date(req.query.end_date) : null;

    let accessibleDoors = [];
    if (userRole === 'admin') {
      const doors = await db.DoorStatus.findAll({ attributes: ['id', 'name', 'location'] });
      accessibleDoors = doors.map(d => ({ id: d.id, name: d.name, location: d.location }));
    } else {
      const access = await db.DoorUser.findAll({
        where: { user_id: userId },
        include: [{ model: db.DoorStatus, as: 'door', attributes: ['id', 'name', 'location'] }]
      });
      accessibleDoors = access.map(a => ({ id: a.door.id, name: a.door.name, location: a.door.location }));
    }

    const accessibleDoorIds = accessibleDoors.map(d => d.id);

    const where = {};
    if (accessibleDoorIds.length > 0) {
      where.door_id = { [db.Sequelize.Op.in]: accessibleDoorIds };
    }
    if (doorIdFilter && accessibleDoorIds.includes(doorIdFilter)) {
      where.door_id = doorIdFilter;
    }
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[db.Sequelize.Op.gte] = startDate;
      if (endDate) where.timestamp[db.Sequelize.Op.lte] = endDate;
    }

    const accessLogs = await db.AccessLog.findAll({
      where,
      order: [['timestamp', 'DESC']],
      attributes: ['id', 'door_id', 'user_id', 'action', 'timestamp', 'success']
    });

    const totalAccess = accessLogs.length;
    const deniedAccess = accessLogs.filter(log => log.success === false).length;
    const lockedDoors = accessLogs.filter(log => log.action === 'kunci').length;
    const openedDoors = accessLogs.filter(log => log.action === 'buka').length;

    const hourlyActivity = {};
    accessLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });

    const chartData = [];
    for (let i = 0; i < 24; i++) {
      chartData.push({ hour: i, count: hourlyActivity[i] || 0 });
    }

    const sortedHours = Object.entries(hourlyActivity).sort(([, a], [, b]) => b - a).slice(0, 3);
    const top = sortedHours[0] ? sortedHours[0][1] : 1;
    const activeHours = sortedHours.map(([hour, count]) => ({
      timeRange: `${String(hour).padStart(2, '0')}:00 - ${String((parseInt(hour) + 2) % 24).padStart(2, '0')}:00`,
      count,
      progress: count / top
    }));

    const analyticsData = {
      metrics: {
        totalAccess: { value: totalAccess, change: `+${totalAccess > 0 ? Math.floor(Math.random() * 20) + 1 : 0}%`, changeType: 'positive' },
        deniedAccess: { value: deniedAccess, change: `${deniedAccess > 0 ? '+' : ''}${deniedAccess > 0 ? Math.floor(Math.random() * 10) - 5 : 0}%`, changeType: 'negative' },
        lockedDoors: { value: lockedDoors, change: `+${Math.floor(Math.random() * 10) + 1}%`, changeType: 'positive' },
        openedDoors: { value: openedDoors, change: `+${Math.floor(Math.random() * 15) + 1}%`, changeType: 'positive' }
      },
      chartData,
      activeHours,
      availableDoors: accessibleDoors,
      accessLogs
    };

    res.json({ success: true, data: analyticsData, message: 'Analytics data retrieved successfully' });
  } catch (error) {
    logger.error('Analytics dashboard error:', error);
    next(error);
  }
}

module.exports = { getDashboard };