'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CameraRecord extends Model {
    static associate(models) {
      CameraRecord.belongsTo(models.DoorStatus, {
        foreignKey: 'door_id',
        as: 'door'
      });
    }
  }
  
  CameraRecord.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    door_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'door_status',
        key: 'id'
      }
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    event_type: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'CameraRecord',
    tableName: 'camera_records',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['door_id']
      },
      {
        fields: ['timestamp']
      },
      {
        fields: ['event_type']
      }
    ]
  });

  return CameraRecord;
};

