'use strict';

const db = require('../models');
const logger = require('../utils/logger');
const { sendToToken, sendToTokens } = require('../utils/fcm');

/**
 * Get Door Status
 * GET /api/door/status
 * Returns all doors accessible by the authenticated user
 */
async function getDoorStatus(req, res, next) {
  try {
    const userId = req.user.userId;

    // Get all door access for this user from junction table
    const doorAccess = await db.DoorUser.findAll({
      where: { user_id: userId },
      include: [
        {
          model: db.DoorStatus,
          as: 'door',
          required: true
        }
      ]
    });

    // Extract doors from the access relationships
    const accessibleDoors = doorAccess.map(access => {
      const door = access.door;
      return {
        id: door.id,
        name: door.name,
        location: door.location,
        locked: door.locked,
        battery_level: door.battery_level,
        last_update: door.last_update,
        wifi_strength: door.wifi_strength,
        camera_active: door.camera_active,
        access_granted_at: access.created_at
      };
    });

    res.json({
      success: true,
      data: accessibleDoors,
      message: accessibleDoors.length > 0 
        ? 'User accessible doors retrieved successfully' 
        : 'No doors accessible for this user'
    });

  } catch (error) {
    logger.error('Get door status error:', error);
    next(error);
  }
}

/**
 * Control Door
 * POST /api/door/control
 * Lock or unlock a door
 */
async function controlDoor(req, res, next) {
  try {
    const userId = req.user.userId;
    const { door_id, action } = req.body;
    const doorIdInt = parseInt(door_id);

    // Validate and normalize action
    const validActions = ['buka', 'kunci', 'lock', 'unlock'];
    let internalAction = action.toLowerCase();
    
    // Convert English to Indonesian
    if (internalAction === 'lock') internalAction = 'kunci';
    if (internalAction === 'unlock') internalAction = 'buka';
    
    // Final validation (should only be 'buka' or 'kunci' after conversion)
    if (internalAction !== 'buka' && internalAction !== 'kunci') {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Must be buka, kunci, lock, or unlock',
        code: 'INVALID_ACTION'
      });
    }

    // Check if user has access to this door
    const doorAccess = await db.DoorUser.findOne({
      where: {
        user_id: userId,
        door_id: doorIdInt
      }
    });

    if (!doorAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this door',
        code: 'ACCESS_DENIED'
      });
    }

    // Get door from database
    const door = await db.DoorStatus.findByPk(doorIdInt);

    if (!door) {
      return res.status(404).json({
        success: false,
        error: 'Door not found',
        code: 'DOOR_NOT_FOUND'
      });
    }

    // Check if door is online (battery > 0 or has recent update)
    if (door.battery_level === 0 || door.battery_level === null) {
      return res.status(400).json({
        success: false,
        error: 'Door is offline (battery depleted)',
        code: 'DOOR_OFFLINE'
      });
    }

    const shouldLock = internalAction === 'kunci';
    const timestamp = new Date();

    await db.sequelize.transaction(async (t) => {
      await db.sequelize.query(
        "SELECT set_config('app.trusted_caller', '1', true)",
        { transaction: t }
      );

      const doorForUpdate = await db.DoorStatus.findOne({
        where: { id: doorIdInt },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      await doorForUpdate.update({
        locked: shouldLock,
        last_update: timestamp
      }, { transaction: t });

      await db.AccessLog.create({
        user_id: userId,
        door_id: doorIdInt,
        action: internalAction,
        success: true,
        method: 'POST',
        timestamp: timestamp,
        ip_address: req.ip || req.connection.remoteAddress
      }, { transaction: t });
    });

    try {
      const actor = await db.User.findByPk(userId);
      const actorName = actor?.name || 'Pengguna';
      const statusWord = internalAction === 'buka' ? 'terbuka' : 'terkunci';
      const actionVerb = internalAction === 'buka' ? 'dibuka' : 'dikunci';
      const title = `${door.name} ${statusWord}`;
      const body = `${door.name} telah ${actionVerb} oleh ${actorName}`;

      const accessUsers = await db.DoorUser.findAll({ where: { door_id: doorIdInt } });
      const userIds = accessUsers.map(a => a.user_id);
      const users = userIds.length ? await db.User.findAll({ where: { id: userIds } }) : [];

      const tokens = users.map(u => u.fcm_token).filter(t => !!t);
      if (tokens.length) {
        await sendToTokens(tokens, { title, body });
      }

      const now = new Date();
      const type = internalAction === 'buka' ? 'door_unlock' : 'door_lock';
      const notifRows = users.map(u => ({ user_id: u.id, type, title, message: body, read: false, created_at: now, updated_at: now }));
      if (notifRows.length) {
        await db.Notification.bulkCreate(notifRows);
      }
    } catch (pushErr) {
      logger.warn('Failed to broadcast push notification:', pushErr);
    }

    const updatedDoor = await db.DoorStatus.findByPk(doorIdInt);
    res.json({
      success: true,
      data: {
        door_id: doorIdInt,
        action: internalAction,
        success: true,
        timestamp: timestamp,
        message: `Door ${internalAction === 'buka' ? 'opened' : 'locked'} successfully`,
        door_status: {
          locked: updatedDoor.locked,
          last_update: updatedDoor.last_update
        }
      },
      message: `Door ${internalAction === 'buka' ? 'opened' : 'locked'} successfully`
    });

  } catch (error) {
    logger.error('Door control error:', error);
    next(error);
  }
}

/**
 * Update Door Settings
 * PUT /api/door/settings
 * Update door configuration/settings (requires admin role or door access)
 */
async function updateDoorSettings(req, res, next) {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { door_id, name, location, camera_active, wifi_strength } = req.body;
    const doorIdInt = parseInt(door_id);

    // Get door
    const door = await db.DoorStatus.findByPk(doorIdInt);

    if (!door) {
      return res.status(404).json({
        success: false,
        error: 'Door not found',
        code: 'DOOR_NOT_FOUND'
      });
    }

    // Check if user is admin or has access to this door
    const isAdmin = userRole === 'admin';
    const hasAccess = await db.DoorUser.findOne({
      where: {
        user_id: userId,
        door_id: doorIdInt
      }
    });

    if (!isAdmin && !hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin role or door access required',
        code: 'ACCESS_DENIED'
      });
    }

    // Prepare update data (only update fields that are provided)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (location !== undefined) updateData.location = location;
    if (camera_active !== undefined) updateData.camera_active = camera_active;
    if (wifi_strength !== undefined) {
      // Validate wifi_strength enum
      const validWifiStrengths = ['Excellent', 'Good', 'Fair', 'Weak', 'No Signal'];
      if (!validWifiStrengths.includes(wifi_strength)) {
        return res.status(400).json({
          success: false,
          error: `Invalid wifi_strength. Must be one of: ${validWifiStrengths.join(', ')}`,
          code: 'INVALID_WIFI_STRENGTH'
        });
      }
      updateData.wifi_strength = wifi_strength;
    }

    // Update door settings
    await door.update(updateData);

    // Log the action
    try {
      await db.AccessLog.create({
        user_id: userId,
        door_id: doorIdInt,
        action: 'update_settings',
        success: true,
        method: 'PUT',
        ip_address: req.ip || req.connection.remoteAddress
      });
    } catch (logError) {
      logger.error('Failed to log door settings update:', logError);
    }

    // Return updated door data
    res.json({
      success: true,
      data: {
        id: door.id,
        name: door.name,
        location: door.location,
        locked: door.locked,
        battery_level: door.battery_level,
        last_update: door.last_update,
        wifi_strength: door.wifi_strength,
        camera_active: door.camera_active,
        updated_at: door.updated_at
      },
      message: 'Door settings updated successfully'
    });

  } catch (error) {
    logger.error('Update door settings error:', error);
    next(error);
  }
}

async function getDoorDeviceStatus(req, res, next) {
  try {
    const doorId = parseInt(req.params.door_id);
    if (!doorId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid door ID',
        code: 'INVALID_DOOR_ID'
      });
    }
    const door = await db.DoorStatus.findByPk(doorId);
    if (!door) {
      return res.status(404).json({
        success: false,
        error: 'Door not found',
        code: 'DOOR_NOT_FOUND'
      });
    }
    res.json({
      success: true,
      data: {
        door_id: door.id,
        status: door.locked ? 'terkunci' : 'terbuka',
        locked: door.locked,
        battery_level: door.battery_level,
        last_update: door.last_update
      },
      message: 'Door status retrieved successfully'
    });
  } catch (error) {
    logger.error('Get door device status error:', error);
    next(error);
  }
}

module.exports = {
  getDoorStatus,
  controlDoor,
  updateDoorSettings,
  getDoorDeviceStatus
};

