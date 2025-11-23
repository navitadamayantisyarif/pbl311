'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AccessLog extends Model {
    static associate(models) {
      AccessLog.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      AccessLog.belongsTo(models.DoorStatus, {
        foreignKey: 'door_id',
        as: 'door'
      });
    }
  }
  
  AccessLog.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    door_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'door_status',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    method: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'AccessLog',
    tableName: 'access_logs',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['door_id']
      },
      {
        fields: ['timestamp']
      }
    ]
  });

  return AccessLog;
};

