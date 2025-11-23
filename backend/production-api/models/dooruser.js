'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DoorUser extends Model {
    static associate(models) {
      DoorUser.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      DoorUser.belongsTo(models.DoorStatus, {
        foreignKey: 'door_id',
        as: 'door'
      });
    }
  }
  
  DoorUser.init({
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
      allowNull: false,
      references: {
        model: 'door_status',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'DoorUser',
    tableName: 'door_user',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'door_id'],
        name: 'door_user_user_door_unique_idx'
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['door_id']
      }
    ]
  });

  return DoorUser;
};

