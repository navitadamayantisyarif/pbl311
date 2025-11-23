'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DoorStatus extends Model {
    static associate(models) {
      DoorStatus.hasMany(models.AccessLog, {
        foreignKey: 'door_id',
        as: 'accessLogs'
      });
      DoorStatus.belongsToMany(models.User, {
        through: models.DoorUser,
        foreignKey: 'door_id',
        otherKey: 'user_id',
        as: 'users'
      });
      DoorStatus.hasMany(models.DoorUser, {
        foreignKey: 'door_id',
        as: 'userAccess'
      });
      DoorStatus.hasMany(models.CameraRecord, {
        foreignKey: 'door_id',
        as: 'cameraRecords'
      });
    }
  }
  
  DoorStatus.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    locked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    battery_level: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      comment: '0-100'
    },
    last_update: {
      type: DataTypes.DATE,
      allowNull: true
    },
    wifi_strength: {
      type: DataTypes.ENUM('Excellent', 'Good', 'Fair', 'Weak', 'No Signal'),
      allowNull: true
    },
    camera_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'DoorStatus',
    tableName: 'door_status',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return DoorStatus;
};

