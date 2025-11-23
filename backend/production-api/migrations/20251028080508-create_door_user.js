'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('door_user', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      door_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'door_status',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint to prevent duplicate user-door associations
    await queryInterface.addIndex('door_user', ['user_id', 'door_id'], {
      name: 'door_user_user_door_unique_idx',
      unique: true
    });

    // Add individual indexes for better query performance
    await queryInterface.addIndex('door_user', ['user_id'], {
      name: 'door_user_user_id_idx'
    });
    await queryInterface.addIndex('door_user', ['door_id'], {
      name: 'door_user_door_id_idx'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('door_user');
  }
};
